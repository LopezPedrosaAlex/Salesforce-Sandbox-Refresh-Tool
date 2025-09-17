const { batchIt, percentCalc } = require('@utils/metadataUtils.js');
const fs = require('fs');
const { FILES_DIR } = require('@config/paths.js');
const { METADATA_TYPES } = require('@enums/constants.js');

const retrieveAllEmailTemplates = async (connection) => {
    try {
        const emailTemplatesMetadata = await connection.metadata.list([{ type: METADATA_TYPES.EMAIL_TEMPLATE, folder: null }], process.env.API_VERSION);
        console.log(emailTemplatesMetadata);
        let emailTemplatesContent = [];
        let i = 0;
        for(const batch of batchIt(200, emailTemplatesMetadata)) {
            const batchContent = await connection.metadata.read(METADATA_TYPES.EMAIL_TEMPLATE, batch.map(res => res.fullName)).catch(err => {
                console.error(`Error reading email template ${batch.map(res => res.fullName).join(', ')}: ${err}`);
                return [];
            });
            emailTemplatesContent.push(...batchContent);
            i += batch.length;
            console.log(`Reading email templates... ${percentCalc(i, emailTemplatesMetadata.length)}%`);
        }
        fs.writeFileSync(FILES_DIR.METADATA.EMAIL_TEMPLATES_FILE, JSON.stringify(emailTemplatesContent, null, 2));
    } catch (error) {
        console.error('Error retrieving email templates:', error);
        throw error;
    }
};

const deleteMetadata = async (query, connection) => {
    
    const allEmailTemplates = await connection.query(query); 
    for (const batch of batchIt(200, allEmailTemplates.records)) {
        await connection.metadata.delete(METADATA_TYPES.EMAIL_TEMPLATE, batch.map(record => record.Id));
    }

}

module.exports = {
    retrieveAllEmailTemplates,
    deleteMetadata
};