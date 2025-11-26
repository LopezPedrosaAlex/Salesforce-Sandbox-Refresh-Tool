const { batchIt, percentCalc, getOrgIdentifier, spinnerInitialization } = require('@utils/metadataUtils.js');
const fs = require('fs');
const { FILES_DIR } = require('@config/paths.js');
const { METADATA_TYPES } = require('@enums/constants.js');

const retrieveAllEmailTemplates = async (connections) => {
    const spinnies = spinnerInitialization(METADATA_TYPES.EMAIL_TEMPLATE, connections);
    connections.forEach(async (connection) => {
        try {
            let folderNames = [];
            for (const folderType of METADATA_TYPES.EMAIL_FOLDERS) {
                const folders = await connection.metadata.list([{ type: folderType }], process.env.API_VERSION);
                folderNames.push(...(Array.isArray(folders) ? folders.map(folder => folder.fullName) : []));
            }
            folderNames = [...new Set(folderNames)];
            const emailTemplatesMetadata = [];
            for(const folder of folderNames) {
                const emailTemplate = await connection.metadata.list([{ type: METADATA_TYPES.EMAIL_TEMPLATE, folder }], process.env.API_VERSION);
                emailTemplatesMetadata.push(...emailTemplate);
            }
            let emailTemplatesContent = [];
            let i = 0;

            for(const batch of batchIt(10, emailTemplatesMetadata)) {
                const batchContent = await connection.metadata.read(METADATA_TYPES.EMAIL_TEMPLATE, batch.map(res => res.fullName)).catch(err => {
                    spinnies.fail(`${METADATA_TYPES.EMAIL_TEMPLATE} ${getOrgIdentifier(connection)}`, { text: `Error retrieving email templates on ${getOrgIdentifier(connection)}` });
                    console.error(`Error reading email template ${batch.map(res => res.fullName).join(', ')}: ${err}`);
                    return [];
                });
                emailTemplatesContent.push(...batchContent);
                i += batch.length;
                spinnies.update(`${METADATA_TYPES.EMAIL_TEMPLATE} ${getOrgIdentifier(connection)}`, { text: `Retrieving email templates on ${getOrgIdentifier(connection)}... ${percentCalc(i, emailTemplatesMetadata.length)}%` });
            }
            fs.writeFileSync(FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].EMAIL_TEMPLATES_FILE, JSON.stringify(emailTemplatesContent, null, 2));
            spinnies.succeed(`${METADATA_TYPES.EMAIL_TEMPLATE} ${getOrgIdentifier(connection)}`, { text: `Retrieved email templates on ${getOrgIdentifier(connection)}` });
        } catch (error) {
            console.error('Error retrieving email templates:', error);
            throw error;
        }
    });
};

const deleteMetadata = async (query, connection) => {
    
    const allEmailTemplates = await connection.query(query); 
    for (const batch of batchIt(200, allEmailTemplates.records)) {
        await connection.metadata.delete(METADATA_TYPES.EMAIL_TEMPLATE, batch.map(record => record.Id));
    }

}

const updateEmailTemplates = async (connections) => {
    const spinnies = spinnerInitialization(`Update ${METADATA_TYPES.EMAIL_TEMPLATE}`, connections);
    connections.forEach(async connection => {
        const filePath = FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].EMAIL_TEMPLATES_FILE;
        try {
            const emailTemplatesToCreate = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let i = 0;
            spinnies.update(`Update ${METADATA_TYPES.EMAIL_TEMPLATE} ${getOrgIdentifier(connection)}`, { text: `Updating Email Templates on ${getOrgIdentifier(connection)}... 0%` });
            for (const batch of batchIt(10, emailTemplatesToCreate)) {
                await connection.metadata.update(METADATA_TYPES.EMAIL_TEMPLATE, batch);
                i += batch.length;
                spinnies.update(`Update ${METADATA_TYPES.EMAIL_TEMPLATE} ${getOrgIdentifier(connection)}`, { text: `Updating Email Templates on ${getOrgIdentifier(connection)}... ${percentCalc(i, emailTemplatesToCreate.length)}%` });
            }
        } catch (error) {
            console.error('Error updating email templates:', error);
            spinnies.fail(`Update ${METADATA_TYPES.EMAIL_TEMPLATE} ${getOrgIdentifier(connection)}`, { text: `Error updating email templates on ${getOrgIdentifier(connection)}` });
            throw error;
        }    
        spinnies.succeed(`Update ${METADATA_TYPES.EMAIL_TEMPLATE} ${getOrgIdentifier(connection)}`, { text: `Updated Email Templates on ${getOrgIdentifier(connection)}` });
    });
};

module.exports = {
    retrieveAllEmailTemplates,
    updateEmailTemplates
};