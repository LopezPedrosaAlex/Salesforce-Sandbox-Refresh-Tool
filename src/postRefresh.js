const jsforce = require('jsforce');
require('module-alias/register');
const { FILES_DIR } = require('@config/paths.js')
const { deleteMetadataFromAFile, createMetadataFromAFile } = require('@services/metadata/customMetadataService.js');
const { deleteCertificatesFromAFile, createCertificatesFromAFile } = require('@services/metadata/certificateService.js');
const { deleteStaticResourcesFromAFile, createStaticResourcesFromAFile } = require('@services/metadata/staticResources.js');
const fs = require('fs');
require('dotenv').config();

const conn = new jsforce.Connection({
  instanceUrl : process.env.SALESFORCE_TARGET_INSTANCE_URL,
  loginUrl : process.env.SALESFORCE_LOGIN_URL
});

conn.login(process.env.SALESFORCE_TARGET_USERNAME, process.env.SALESFORCE_TARGET_PASSWORD)
    .then(() => {
        console.log('Login successful');
    })
    .catch(err => {
        console.log('Login failed');
        console.error(err);
    });



//deleteMetadataFromAFile(FILES_DIR.METADATA.CUSTOM_METADATA_FILE, conn);
//createMetadataFromAFile(FILES_DIR.METADATA.CUSTOM_METADATA_FILE, conn);
//deleteCertificatesFromAFile(FILES_DIR.METADATA.CERTIFICATES_FILE, conn);
//createCertificatesFromAFile(FILES_DIR.METADATA.CERTIFICATES_FILE, conn);
//deleteStaticResourcesFromAFile(FILES_DIR.METADATA.STATIC_RESOURCES_FILE, conn);
//createStaticResourcesFromAFile(FILES_DIR.METADATA.STATIC_RESOURCES_FILE, conn);