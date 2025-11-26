const jsforce = require('jsforce');
require('module-alias/register');
const { FILES_DIR } = require('@config/paths.js')
const { ENVIRONMENTS } = require('@enums/constants.js');
const { ALL_EMAIL_TEMPLATES_QUERY } = require('@config/queries.js');
const { createMetadataFromAFile, deleteSubsidiaryMetadata } = require('@services/metadata/customMetadataService.js');
const { deleteCertificatesFromAFile, createCertificatesFromAFile } = require('@services/metadata/certificateService.js');
const { createStaticResourcesFromAFile } = require('@services/metadata/staticResources.js');
const { unfreezeUsers,changeProfileITUsers } = require('@services/sobjects/userService.js'); 
const { deleteScheduledJobs } = require('@services/metadata/scheduledJobService.js');
const { updateSandboxEnvironment } = require('@services/sObjects/copadoService.js');
const { updateLeadAssignmentRules } = require('@services/metadata/leadAssignmentRules.js');
const { updateEmailTemplates } = require('@services/metadata/emailTemplateService.js');
const { createDKIMKeys } = require('@services/metadata/emailService.js');
const { createRemoteSiteSettings, deleteRemoteSiteSettings } = require('@services/metadata/remoteSiteSettingsService.js');

const fs = require('fs');
require('dotenv').config();

const connections = [
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

const jsforceConnections = {};
function loginAll() {
    for (const cfg of connections) {
        const conn = new jsforce.Connection({
            instanceUrl: cfg.instanceUrl,
            loginUrl: cfg.loginUrl,
            pollTimeout: 120000
        });
        conn.name = cfg.name;
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

//const sandboxToRefreshConnections = [jsforceConnections[ENVIRONMENTS.TST], jsforceConnections[ENVIRONMENTS.PRE]];
const sandboxToRefreshConnections = [jsforceConnections[ENVIRONMENTS.ALEX]];
const copadoEnvironmentsConnections = [jsforceConnections[ENVIRONMENTS.TST], jsforceConnections[ENVIRONMENTS.PRE], jsforceConnections[ENVIRONMENTS.PROD]];
//FEATURES OK
//createMetadataFromAFile(sandboxToRefreshConnections);
//deleteSubsidiaryMetadata(sandboxToRefreshConnections);
//createStaticResourcesFromAFile(sandboxToRefreshConnections);
//changeProfileITUsers(sandboxToRefreshConnections);
//unfreezeUsers(sandboxToRefreshConnections);
//updateEmailTemplates(sandboxToRefreshConnections);
//updateSandboxEnvironment(copadoEnvironmentsConnections);
//deleteScheduledJobs(sandboxToRefreshConnections);

//FEATURES TO TEST
//createDKIMKeys(sandboxToRefreshConnections);

//updateLeadAssignmentRules(FILES_DIR.METADATA.LEAD_ASSIGNMENT_RULES_FILE, jsforceConnections['ALEX']);
//deleteRemoteSiteSettings(FILES_DIR.METADATA.REMOTE_SITE_SETTINGS_FILE, jsforceConnections['ALEX']);
//createRemoteSiteSettings(FILES_DIR.METADATA.REMOTE_SITE_SETTINGS_FILE, jsforceConnections['ALEX']);

