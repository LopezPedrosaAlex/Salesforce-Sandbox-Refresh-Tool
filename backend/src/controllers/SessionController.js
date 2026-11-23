const jsforce = require('jsforce');
const { execFile } = require('child_process');

/**
 * Runs a Salesforce CLI command with `--json` and resolves its parsed output.
 * The CLI returns a JSON payload on stdout even when it exits non-zero, so we
 * parse stdout first and only fall back to an error when there is no JSON.
 */
const _runSf = (args) =>
    new Promise((resolve, reject) => {
        execFile(
            'sf',
            args,
            { shell: true, timeout: 5 * 60 * 1000, maxBuffer: 10 * 1024 * 1024 },
            (err, stdout, stderr) => {
                let parsed = null;
                try {
                    parsed = JSON.parse(stdout);
                } catch {
                    // Non-JSON output; fall through to error handling below.
                }
                if (parsed) return resolve(parsed);
                return reject(new Error((stderr || (err && err.message) || 'Salesforce CLI error').toString()));
            }
        );
    });

/**
 * Reads the Salesforce OAuth access token from the request.
 * Accepts `Authorization: Bearer <token>` or an `access_token` query/body field.
 */
const _extractToken = (req) => {
    const auth = req.headers.authorization || '';
    if (auth.startsWith('Bearer ')) return auth.slice('Bearer '.length);
    return (req.query && req.query.access_token) || (req.body && req.body.access_token) || null;
};

/**
 * Reads the Salesforce instance URL bound to the session.
 */
const _extractInstanceUrl = (req) => {
    return (
        req.headers['x-instance-url'] ||
        (req.query && req.query.instance_url) ||
        (req.body && req.body.instance_url) ||
        null
    );
};

/**
 * Validates a single Salesforce OAuth session and returns its org/user
 * metadata, or `null` if the token is missing/invalid/expired.
 *
 * The browser cannot read Salesforce's HttpOnly `sid` cookie across domains,
 * so the reliable signal that a user is "logged into an org" is the OAuth
 * access token obtained through the PKCE flow.
 */
const _validateConnection = async (accessToken, instanceUrl) => {
    if (!accessToken || !instanceUrl) return null;

    try {
        const conn = new jsforce.Connection({ instanceUrl, accessToken });
        const identity = await conn.identity();

        let org = {};
        try {
            const result = await conn.query(
                'SELECT Id, Name, OrganizationType, IsSandbox, InstanceName FROM Organization LIMIT 1'
            );
            org = (result.records && result.records[0]) || {};
        } catch {
            // Org query is best-effort; identity alone confirms login.
        }

        return {
            id: instanceUrl,
            orgId: org.Id || identity.organization_id,
            orgName: org.Name || identity.display_name,
            username: identity.username,
            displayName: identity.display_name,
            email: identity.email,
            photo: identity.photos && identity.photos.thumbnail,
            instanceUrl,
            instanceName: org.InstanceName || null,
            organizationType: org.OrganizationType || null,
            isSandbox: typeof org.IsSandbox === 'boolean' ? org.IsSandbox : null,
            connectedAt: new Date().toISOString()
        };
    } catch {
        return null;
    }
};

/**
 * GET /api/session — validates a single OAuth session passed via headers.
 */
const getSession = async (req, res) => {
    const accessToken = _extractToken(req);
    const instanceUrl = _extractInstanceUrl(req);

    if (!accessToken || !instanceUrl) {
        return res.status(401).json({ loggedIn: false, error: 'Missing access token or instance URL' });
    }

    const session = await _validateConnection(accessToken, instanceUrl);
    if (!session) {
        return res.status(401).json({ loggedIn: false, error: 'Invalid or expired Salesforce session' });
    }

    return res.json({ loggedIn: true, sessions: [session] });
};

/**
 * POST /api/sessions — validates multiple OAuth sessions (multi-org).
 * Body: { connections: [{ accessToken, instanceUrl }] }
 * Returns only the sessions that are still valid.
 */
const getSessions = async (req, res) => {
    const connections = (req.body && req.body.connections) || [];

    if (!Array.isArray(connections) || connections.length === 0) {
        return res.status(400).json({ loggedIn: false, sessions: [], error: 'No connections provided' });
    }

    const results = await Promise.all(
        connections.map((c) => _validateConnection(c.accessToken, c.instanceUrl))
    );
    const sessions = results.filter(Boolean);

    return res.json({ loggedIn: sessions.length > 0, sessions });
};

/**
 * POST /api/session/login — logs into a Salesforce org with username/password
 * using jsforce's SOAP login (no Connected App required).
 * Body: { username, password, securityToken?, isSandbox? }
 * On success returns the org metadata plus the resulting session id
 * (accessToken) and instanceUrl so the frontend can persist the connection.
 */
const loginSession = async (req, res) => {
    const { username, password, securityToken, isSandbox } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ loggedIn: false, error: 'Missing username or password' });
    }

    const loginUrl = isSandbox ? 'https://test.salesforce.com' : 'https://login.salesforce.com';

    try {
        const conn = new jsforce.Connection({ loginUrl });
        await conn.login(username, `${password}${securityToken || ''}`);

        const session = await _validateConnection(conn.accessToken, conn.instanceUrl);
        if (!session) {
            return res.status(401).json({ loggedIn: false, error: 'Login succeeded but the session could not be validated' });
        }

        return res.json({
            loggedIn: true,
            session,
            accessToken: conn.accessToken,
            instanceUrl: conn.instanceUrl
        });
    } catch (err) {
        return res.status(401).json({
            loggedIn: false,
            error: (err && err.message) || 'Invalid credentials or login blocked (check MFA/security token)'
        });
    }
};

/**
 * POST /api/session/cli-login — logs into a Salesforce org through the local
 * Salesforce CLI web server flow (`sf org login web`). No custom Connected App
 * is required: the CLI ships with its own. This opens a browser on the machine
 * running the backend, so it is intended for local use.
 * Body: { isSandbox? }
 * Returns the org metadata plus the resulting session id and instanceUrl.
 */
const cliLoginSession = async (req, res) => {
    const { isSandbox } = req.body || {};
    const instanceUrl = isSandbox ? 'https://test.salesforce.com' : 'https://login.salesforce.com';

    try {
        const login = await _runSf(['org', 'login', 'web', '--instance-url', instanceUrl, '--json']);

        if (login.status !== 0) {
            return res.status(401).json({ loggedIn: false, error: login.message || 'Salesforce CLI login failed' });
        }

        const result = login.result || {};
        let accessToken = result.accessToken;
        let orgInstanceUrl = result.instanceUrl;
        const username = result.username;

        // `sf org login web` may omit the access token; fetch it explicitly.
        if ((!accessToken || !orgInstanceUrl) && username) {
            const display = await _runSf(['org', 'display', '--target-org', username, '--json']);
            const dr = (display && display.result) || {};
            accessToken = accessToken || dr.accessToken;
            orgInstanceUrl = orgInstanceUrl || dr.instanceUrl;
        }

        if (!accessToken || !orgInstanceUrl) {
            return res.status(401).json({ loggedIn: false, error: 'Could not obtain a session from the Salesforce CLI' });
        }

        const session = await _validateConnection(accessToken, orgInstanceUrl);
        if (!session) {
            return res.status(401).json({ loggedIn: false, error: 'Login succeeded but the session could not be validated' });
        }

        return res.json({ loggedIn: true, session, accessToken, instanceUrl: orgInstanceUrl });
    } catch (err) {
        return res.status(500).json({
            loggedIn: false,
            error: (err && err.message) || 'Salesforce CLI error. Is the CLI installed?'
        });
    }
};

module.exports = { getSession, getSessions, loginSession, cliLoginSession };
