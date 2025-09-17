const jsforce = require('jsforce');
require('module-alias/register');
const { deleteMetadataFromAFile, readAllCustomMetadataToFile, createMetadataFromAFile } = require('@services/metadata/customMetadataService.js');
const { retrieveCertificates } = require('@services/metadata/certificateService.js');
const { retrieveActiveUsers, freezeUsers } = require('@services/sobjects/userService.js'); 
const { retrieveAllStaticResources } = require('@services/metadata/staticResources.js');
const { retrieveAllEmailTemplates } = require('@services/metadata/emailTemplateService.js');
require('dotenv').config();

const conn = new jsforce.Connection({
  instanceUrl : process.env.SALESFORCE_SOURCE_INSTANCE_URL,
  loginUrl : process.env.SALESFORCE_LOGIN_URL
});

conn.login(process.env.SALESFORCE_SOURCE_USERNAME, process.env.SALESFORCE_SOURCE_PASSWORD)
    .then(() => {
        console.log('Login successful');
    })
    .catch(err => {
        console.log('Login failed');
        console.error(err);
    });


//readAllCustomMetadataToFile(conn);
//retrieveCertificates(conn);
//retrieveActiveUsers(conn);
//retrieveAllStaticResources(conn);
retrieveAllEmailTemplates(conn);

