const fs = require('fs')
const path = require('path')
require('dotenv').config()
const { METADATA_TYPES } = require('@enums/constants.js')
const { batchIt, fixMetadataValues, isValidCustomMetadata, percentCalc } = require('@utils/metadataUtils.js')
const { FILES_DIR } = require('@config/paths.js')

const readAllCustomMetadataToFile = async (connection) => {
    connection.metadata.list([{type: METADATA_TYPES.CUSTOM_METADATA, folder: null}], process.env.API_VERSION).then(async result => {
        const metadataNames = result.map(metadata => metadata.fullName);

        let metadataToWrite = [];
        let i = 0;
        for (const batch of batchIt(200, metadataNames)) {
            try {
                const batchResult = await connection.metadata.read(METADATA_TYPES.CUSTOM_METADATA, batch);
                metadataToWrite.push(...batchResult);
                i += batch.length;
                console.log(`Reading custom metadata... ${percentCalc(i, metadataNames.length)}%`);
            } catch (err) {
                console.error('Error reading batch:', err);
            }
        }
        fs.writeFileSync(FILES_DIR.METADATA.CUSTOM_METADATA_FILE, JSON.stringify(metadataToWrite, null, 2));
    });
}

const deleteMetadataFromAFile = (filePath, connection) => {
    fs.promises.readFile(filePath, 'utf8')
   .then(async result => {
        const metadataParsed = JSON.parse(result).map(element => {
            return element.fullName;
        })

    console.log(`Deleting custom metadata...`);
    for (const batch of batchIt(200, metadataParsed)) {
        await connection.metadata.delete(METADATA_TYPES.CUSTOM_METADATA, batch);
    }
   }).catch(err => {
       console.error('Error deleting metadata:', err);
       return { success: false, error: err };
   });
    return { success: true };
}

const createMetadataFromAFile = (filePath, connection) => {
    fs.promises.readFile(filePath, 'utf8')
    .then(async result => {
        let metadata = JSON.parse(result);
        metadata = fixMetadataValues(metadata);
        // Filter out empty or invalid records
        const validMetadata = Array.isArray(metadata) ? metadata.filter(isValidCustomMetadata) : [];
        if (validMetadata.length === 0) {
            console.log('No valid custom metadata records to create.');
            return;
        }
        console.log(`Creating ${validMetadata.length} custom metadata records...`);
        for(const batch of batchIt(200, validMetadata)){
            await connection.metadata.create(METADATA_TYPES.CUSTOM_METADATA, batch);
        }
    }).catch(err => {
        console.error('Error creating metadata:', err);
        return { success: false, error: err };
    });

    return { success: true };
}

module.exports = {
    readAllCustomMetadataToFile,
    deleteMetadataFromAFile,
    createMetadataFromAFile
};
