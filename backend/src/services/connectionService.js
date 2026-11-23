const jsforce = require('jsforce');
require('module-alias/register');
const { ENVIRONMENTS } = require('@enums/constants.js');
require('dotenv').config();

const getConnectionsConfig = () => {
    return [
        {
            name: ENVIRONMENTS.PROD,
            instanceUrl: process.env.SALESFORCE_PROD_INSTANCE_URL,
            username: process.env.SALESFORCE_PROD_USERNAME,
            password: process.env.SALESFORCE_PROD_PASSWORD,
            loginUrl: process.env.SALESFORCE_LOGIN_URL
        },
        {
            name: ENVIRONMENTS.TST,
            instanceUrl: process.env.SALESFORCE_TST_INSTANCE_URL,
            username: process.env.SALESFORCE_TST_USERNAME,
            password: process.env.SALESFORCE_TST_PASSWORD,
            loginUrl: process.env.SALESFORCE_TEST_LOGIN_URL
        },
        {
            name: ENVIRONMENTS.PRE,
            instanceUrl: process.env.SALESFORCE_PRE_INSTANCE_URL,
            username: process.env.SALESFORCE_PRE_USERNAME,
            password: process.env.SALESFORCE_PRE_PASSWORD,
            loginUrl: process.env.SALESFORCE_TEST_LOGIN_URL
        },
        {
            name: ENVIRONMENTS.ALEX,
            instanceUrl: process.env.SALESFORCE_ALEX_INSTANCE_URL,
            username: process.env.SALESFORCE_ALEX_USERNAME,
            password: process.env.SALESFORCE_ALEX_PASSWORD,
            loginUrl: process.env.SALESFORCE_TEST_LOGIN_URL
        }
    ];
};

const loginAll = async () => {
    const jsforceConnections = {};
    const configs = getConnectionsConfig();

    for (const cfg of configs) {
        // Skip if critical config is missing (optional safety)
        if (!cfg.username || !cfg.password) {
            console.warn(`Skipping connection ${cfg.name}: Missing credentials in .env`);
            continue;
        }

        const conn = new jsforce.Connection({
            instanceUrl: cfg.instanceUrl,
            loginUrl: cfg.loginUrl,
            pollTimeout: 120000
        });
        conn.name = cfg.name;

        try {
            await conn.login(cfg.username, cfg.password);
            console.log(`Login successful for ${cfg.name}`);
            jsforceConnections[cfg.name] = conn;
        } catch (err) {
            console.error(`Login failed for ${cfg.name}`);
            console.error(err);
        }
    }
    return jsforceConnections;
};

module.exports = {
    loginAll
};
