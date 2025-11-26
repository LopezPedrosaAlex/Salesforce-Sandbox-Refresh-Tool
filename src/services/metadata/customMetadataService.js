const fs = require('fs')
const path = require('path')
require('dotenv').config()
const { METADATA_TYPES } = require('@enums/constants.js')
const { batchIt, fixMetadataValues, isValidCustomMetadata, percentCalc, getOrgIdentifier, spinnerInitialization } = require('@utils/metadataUtils.js')
const { FILES_DIR } = require('@config/paths.js')

const readAllCustomMetadataToFile = async (connections) => {
    const spinnies = spinnerInitialization(METADATA_TYPES.CUSTOM_METADATA, connections);
    connections.forEach(connection => {
        connection.metadata.list([{type: METADATA_TYPES.CUSTOM_METADATA, folder: null}], process.env.API_VERSION).then(async result => {
            const metadataNames = result.map(metadata => metadata.fullName);

            let metadataToWrite = [];
            let i = 0;
            spinnies.update(`${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, { text: `Retrieving custom metadata on ${getOrgIdentifier(connection)}... 0%` });
            for (const batch of batchIt(200, metadataNames)) {
                try {
                    const batchResult = await connection.metadata.read(METADATA_TYPES.CUSTOM_METADATA, batch);
                    metadataToWrite.push(...batchResult);
                    i += batch.length;
                    spinnies.update(`${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {text: `Retrieving custom metadata on ${getOrgIdentifier(connection)}... ${percentCalc(i, metadataNames.length)}%`});
                } catch (err) {
                    spinnies.fail(`${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, { text: `Error retrieving custom metadata on ${getOrgIdentifier(connection)}` });
                    console.error('Error reading batch:', err);
                }
            }
            spinnies.succeed(`${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, { text: `Retrieved custom metadata on ${getOrgIdentifier(connection)}` });
            fs.writeFileSync(FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].CUSTOM_METADATA_FILE, JSON.stringify(metadataToWrite, null, 2));
        });
    });
}

/*
const deleteMetadataFromAFile = (filePath, connection) => {
    const spinnies = spinnerInitialization(`Delete ${METADATA_TYPES.CUSTOM_METADATA}`, [connection]);
    fs.promises.readFile(filePath, 'utf8')
   .then(async result => {
        const metadataParsed = JSON.parse(result).map(element => {
            return element.fullName;
        })

    let i = 0;
    for (const batch of batchIt(200, metadataParsed)) {
        await connection.metadata.delete(METADATA_TYPES.CUSTOM_METADATA, batch);
        i += batch.length;
        spinnies.update(`Delete ${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {text: `Deleting custom metadata... ${percentCalc(i, metadataParsed.length)}%`});
    }
    spinnies.succeed(`Delete ${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {text: `Deleted custom metadata on ${getOrgIdentifier(connection)}`});
   }).catch(err => {
       console.error('Error deleting metadata:', err);
       return { success: false, error: err };
   });
    return { success: true };
}
*/

const createMetadataFromAFile = (connections) => {
    const spinnies = spinnerInitialization(`Create ${METADATA_TYPES.CUSTOM_METADATA}`, connections);

    connections.forEach(async (connection) => {
        console.log('Deleted existing custom metadata before creation.');
        fs.promises.readFile(FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].CUSTOM_METADATA_FILE, 'utf8')
        .then(async result => {
            let metadata = JSON.parse(result);
            metadata = fixMetadataValues(metadata);
    
            // Filter out empty or invalid records
            const validMetadata = Array.isArray(metadata) ? metadata.filter(isValidCustomMetadata) : [];
            if (validMetadata.length === 0) {
                console.log('No valid custom metadata records to create.');
                return;
            }
    
            let i = 0;
            for(const batch of batchIt(1, validMetadata)){
    
                await connection.metadata.update(METADATA_TYPES.CUSTOM_METADATA, batch).catch(err => {
                    console.log(batch);
                });
                i += batch.length;
                spinnies.update(`Create ${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {text: `Creating custom metadata... ${percentCalc(i, validMetadata.length)}%`});
            }
            spinnies.succeed(`Create ${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {text: `Created custom metadata on ${getOrgIdentifier(connection)}`});
        }).catch(err => {
            console.error('Error creating metadata:', err);
            return { success: false, error: err };
        });
    });
    return { success: true };
}

const deleteSubsidiaryMetadata = async (connections) => {
    const spinnies = spinnerInitialization(`Delete Subsidiary Metadata`, connections);
    connections.forEach(async (connection) => {
        let subsidiaryMetadata = [];
        try {
            const listCustomMetadata = await connection.metadata.list([{type: METADATA_TYPES.CUSTOM_METADATA, folder: null}], process.env.API_VERSION)
            .then(metadataList => metadataList.filter(metadata => metadata.fullName.startsWith('Sales_Organization_Dependency')));

            subsidiaryMetadata = await connection.metadata.read(METADATA_TYPES.CUSTOM_METADATA, listCustomMetadata.map(metadata => metadata.fullName))
            .then(records => records
            .map(metadata => ({
                    label: metadata.label,
                    fullName: metadata.fullName,
                    values: [
                        { field: 'SubsidiaryId__c', value: '' }
                    ]
                })));
            }catch (error) {
            console.error('Error retrieving subsidiary metadata:', error);
            throw error;
        }
            try {
                spinnies.update(`Delete Subsidiary Metadata ${getOrgIdentifier(connection)}`, { text: `Deleting subsidiary metadata on ${getOrgIdentifier(connection)}...` });
                const updateSubsidiaryMetadata = await connection.metadata.update(METADATA_TYPES.CUSTOM_METADATA, subsidiaryMetadata).catch(err => {
                    console.log(err);
                spinnies.fail(`Delete Subsidiary Metadata ${getOrgIdentifier(connection)}`, { text: `Error: ${err.message}` });
            });
            console.log(updateSubsidiaryMetadata[0].errors);
                spinnies.succeed(`Delete Subsidiary Metadata ${getOrgIdentifier(connection)}`, { text: `Deleted subsidiary metadata on ${getOrgIdentifier(connection)}` });
            } catch (error) {
                console.error('Error updating subsidiary metadata:', error);
                throw error;
            }
    });
}

module.exports = {
    readAllCustomMetadataToFile,
    createMetadataFromAFile,
    deleteSubsidiaryMetadata
};
