const jsforce = require('jsforce');
const PreRefresh = require('../classes/PreRefresh.js');
const PostRefresh = require('../classes/PostRefresh.js');

let currentProcess = null;

const _bindEvents = (process, io) => {
    process.on('log', (msg) => io.emit('log', msg));
    process.on('step-start', (name) => io.emit('step-start', name));
    process.on('step-end', (name) => io.emit('step-end', name));
    process.on('step-skip', (name) => io.emit('step-skip', name));
    process.on('error', (err) => {
        io.emit('error', err.toString());
    });
    process.on('done', () => {
        io.emit('done');
        currentProcess = null;
    });
};

const _runProcess = async (process, runFn) => {
    try {
        await runFn();
    } catch (e) {
        console.error('Process failed globally:', e);
        currentProcess = null;
    }
};

const startPreRefresh = (req, res, io) => {
    if (currentProcess) return res.status(409).json({ error: 'A process is already running.' });

    currentProcess = new PreRefresh();
    _bindEvents(currentProcess, io);
    _runProcess(currentProcess, () => currentProcess.run());

    res.json({ message: 'PreRefresh started' });
};

const startPostRefresh = (req, res, io) => {
    if (currentProcess) return res.status(409).json({ error: 'A process is already running.' });

    currentProcess = new PostRefresh();
    _bindEvents(currentProcess, io);
    _runProcess(currentProcess, () => currentProcess.run());

    res.json({ message: 'PostRefresh started' });
};

const getStatus = (req, res) => {
    res.json({
        running: !!currentProcess,
        type: currentProcess ? currentProcess.constructor.name : null
    });
};

// --- Granular Features ---

const getAllFeatures = (req, res) => {
    const pre = new PreRefresh();
    const post = new PostRefresh();

    const features = [
        ...pre.getSteps().map((s) => ({ id: s.id, name: s.name, group: 'PreRefresh', enabled: s.enabled })),
        ...post.getSteps().map((s) => ({ id: s.id, name: s.name, group: 'PostRefresh', enabled: s.enabled }))
    ];

    res.json(features);
};

const executeFeature = (req, res, io) => {
    const { id } = req.params;
    const { accessToken, instanceUrl } = req.body || {};
    if (currentProcess) return res.status(409).json({ error: 'A process is already running.' });

    // Identify which process owns the step
    const pre = new PreRefresh();
    const post = new PostRefresh();

    let process = null;
    if (pre.getSteps().find((s) => s.id === id)) {
        process = pre;
    } else if (post.getSteps().find((s) => s.id === id)) {
        process = post;
    } else {
        return res.status(404).json({ error: `Feature with ID '${id}' not found.` });
    }

    // When the frontend passes the selected org's session, run against it
    // instead of the .env-based connections.
    let options = {};
    if (accessToken && instanceUrl) {
        const connection = new jsforce.Connection({ accessToken, instanceUrl });
        options = { connection };
    }

    currentProcess = process;
    _bindEvents(currentProcess, io);

    // Execute single step
    _runProcess(currentProcess, () => currentProcess.runStep(id, options));

    res.json({ message: `Feature '${id}' execution started` });
};

module.exports = {
    startPreRefresh,
    startPostRefresh,
    getStatus,
    getAllFeatures,
    executeFeature
};
