const jsforce = require('jsforce');
require('module-alias/register');
const { ENVIRONMENTS } = require('@enums/constants.js');
const { deleteMetadataFromAFile, readAllCustomMetadataToFile, createMetadataFromAFile } = require('@services/metadata/customMetadataService.js');
const { retrieveCertificates } = require('@services/metadata/certificateService.js');
const { retrieveActiveUsers, freezeUsers } = require('@services/sobjects/userService.js'); 
const { retrieveAllStaticResources } = require('@services/metadata/staticResources.js');
const { retrieveAllEmailTemplates } = require('@services/metadata/emailTemplateService.js');
const { retrieveLeadAssignmentRules } = require('@services/metadata/leadAssignmentRules.js');
const { retrieveRemoteSiteSettings } = require('@services/metadata/remoteSiteSettingsService.js');
const { sendEmails } = require('@utils/metadataUtils.js');
const { retrieveDKIMKeys } = require('@services/metadata/emailService.js');
const { EMAILS } = require('@config/emails.js');
require('dotenv').config();

const connections = [
    {
        name: ENVIRONMENTS.PRODUCTION,
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

const jsforceConnections = {};
function loginAll() {
    for (const cfg of connections) {
        const conn = new jsforce.Connection({
            name: cfg.name,
            instanceUrl: cfg.instanceUrl,
            loginUrl: cfg.loginUrl,
            environmentName: cfg.name
        });
        try {
            conn.login(cfg.username, cfg.password);
            console.log(`Login successful for ${cfg.name}`);
            jsforceConnections[cfg.name] = conn;
        } catch (err) {
            console.log(`Login failed for ${cfg.name}`);
            console.error(err);
        }
    }
}

loginAll();

const sandboxToRefreshConnections = [jsforceConnections[ENVIRONMENTS.TST], jsforceConnections[ENVIRONMENTS.PRE]];

readAllCustomMetadataToFile(sandboxToRefreshConnections);
retrieveLeadAssignmentRules(sandboxToRefreshConnections);
retrieveRemoteSiteSettings(sandboxToRefreshConnections);
retrieveActiveUsers(sandboxToRefreshConnections);
retrieveAllStaticResources(sandboxToRefreshConnections);
retrieveAllEmailTemplates(sandboxToRefreshConnections);
retrieveDKIMKeys(sandboxToRefreshConnections);

//FEATURES TO TEST
//sendEmails(conn, EMAILS.REFRESH_WARNING.SUBJECT, EMAILS.REFRESH_WARNING.BODY, ['alex.lopez@grifols.com']);