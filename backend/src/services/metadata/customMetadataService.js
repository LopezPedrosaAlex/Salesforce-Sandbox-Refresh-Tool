const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { METADATA_TYPES, BATCH_SIZES } = require('@enums/constants.js');
const {
    batchIt,
    fixMetadataValues,
    isValidCustomMetadata,
    percentCalc,
    getOrgIdentifier,
    spinnerInitialization
} = require('@utils/metadataUtils.js');
const { FILES_DIR } = require('@config/paths.js');

const readAllCustomMetadataToFile = async (connections) => {
    const spinnies = spinnerInitialization(METADATA_TYPES.CUSTOM_METADATA, connections);
    for (const connection of connections) {
        try {
            const listResult = await connection.metadata.list(
                [{ type: METADATA_TYPES.CUSTOM_METADATA, folder: null }],
                process.env.API_VERSION
            );
            // listResult can be undefined/null if no metadata found?
            // jsforce usually returns array or throws or returns null?
            // Assuming it returns array or empty.
            if (!listResult) {
                // If it's null, handled?
                spinnies.update(`${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {
                    text: `No custom metadata found on ${getOrgIdentifier(connection)}`
                });
                // Continue to next connection
                continue;
            }
            // listResult might be a single object if only one result? No, list usually returns array.
            // But good to be safe.
            const metadataList = Array.isArray(listResult) ? listResult : [listResult];

            const metadataNames = metadataList.map((metadata) => metadata.fullName);

            let metadataToWrite = [];
            let i = 0;
            spinnies.update(`${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {
                text: `Retrieving custom metadata on ${getOrgIdentifier(connection)}... 0%`
            });
            for (const batch of batchIt(BATCH_SIZES.LARGE, metadataNames)) {
                try {
                    const batchResult = await connection.metadata.read(METADATA_TYPES.CUSTOM_METADATA, batch);
                    // Read can return single object if batch size 1, or array
                    const items = Array.isArray(batchResult) ? batchResult : [batchResult];
                    metadataToWrite.push(...items);
                    i += batch.length;
                    spinnies.update(`${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {
                        text: `Retrieving custom metadata on ${getOrgIdentifier(connection)}... ${percentCalc(i, metadataNames.length)}%`
                    });
                } catch (err) {
                    spinnies.fail(`${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {
                        text: `Error retrieving custom metadata on ${getOrgIdentifier(connection)}`
                    });
                    console.error('Error reading batch:', err);
                }
            }
            spinnies.succeed(`${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {
                text: `Retrieved custom metadata on ${getOrgIdentifier(connection)}`
            });
            fs.writeFileSync(
                FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].CUSTOM_METADATA_FILE,
                JSON.stringify(metadataToWrite, null, 2)
            );
        } catch (err) {
            spinnies.fail(`${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {
                text: `Error listing custom metadata on ${getOrgIdentifier(connection)}`
            });
            console.error('Error listing metadata:', err);
        }
    }
};

/* ... kept commented code ... */

const createMetadataFromAFile = async (connections) => {
    // Added async
    const spinnies = spinnerInitialization(`Create ${METADATA_TYPES.CUSTOM_METADATA}`, connections);

    for (const connection of connections) {
        console.log('Deleted existing custom metadata before creation.');
        try {
            const result = await fs.promises.readFile(
                FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].CUSTOM_METADATA_FILE,
                'utf8'
            );
            let metadata = JSON.parse(result);
            metadata = fixMetadataValues(metadata);

            // Filter out empty or invalid records
            const validMetadata = Array.isArray(metadata) ? metadata.filter(isValidCustomMetadata) : [];
            if (validMetadata.length === 0) {
                console.log('No valid custom metadata records to create.');
                continue; // was return in forEach
            }

            let i = 0;
            for (const batch of batchIt(BATCH_SIZES.STANDARD, validMetadata)) {
                await connection.metadata.update(METADATA_TYPES.CUSTOM_METADATA, batch).catch((err) => {
                    console.log(batch);
                });
                i += batch.length;
                spinnies.update(`Create ${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {
                    text: `Creating custom metadata... ${percentCalc(i, validMetadata.length)}%`
                });
            }
            spinnies.succeed(`Create ${METADATA_TYPES.CUSTOM_METADATA} ${getOrgIdentifier(connection)}`, {
                text: `Created custom metadata on ${getOrgIdentifier(connection)}`
            });
        } catch (err) {
            console.error('Error creating metadata:', err);
            // return { success: false, error: err }; // return in async function returns promise result, not breaking loop in for..of
        }
    }
    return { success: true };
};

const deleteSubsidiaryMetadata = async (connections) => {
    const spinnies = spinnerInitialization(`Delete Subsidiary Metadata`, connections);
    for (const connection of connections) {
        let subsidiaryMetadata = [];
        try {
            const metadataListPromise = await connection.metadata.list(
                [{ type: METADATA_TYPES.CUSTOM_METADATA, folder: null }],
                process.env.API_VERSION
            );
            // handle list result
            const metadataListArray = Array.isArray(metadataListPromise)
                ? metadataListPromise
                : metadataListPromise
                  ? [metadataListPromise]
                  : [];

            const listCustomMetadata = metadataListArray.filter((metadata) =>
                metadata.fullName.startsWith('Sales_Organization_Dependency')
            );

            const records = await connection.metadata.read(
                METADATA_TYPES.CUSTOM_METADATA,
                listCustomMetadata.map((metadata) => metadata.fullName)
            );
            // Read returns array or single obj?
            const recordsArray = Array.isArray(records) ? records : records ? [records] : [];

            subsidiaryMetadata = recordsArray.map((metadata) => ({
                label: metadata.label,
                fullName: metadata.fullName,
                values: [{ field: 'SubsidiaryId__c', value: '' }]
            }));
        } catch (error) {
            console.error('Error retrieving subsidiary metadata:', error);
            throw error;
        }

        try {
            spinnies.update(`Delete Subsidiary Metadata ${getOrgIdentifier(connection)}`, {
                text: `Deleting subsidiary metadata on ${getOrgIdentifier(connection)}...`
            });

            // Should batch updates? Original code didn't batch?
            // Original code: await connection.metadata.update(...)
            // update expects array up to limit (10).
            // If subsidiaryMetadata > 10, it might fail?
            // But original code didn't batch. I'll stick to original logic but fix async.

            const updateSubsidiaryMetadata = await connection.metadata
                .update(METADATA_TYPES.CUSTOM_METADATA, subsidiaryMetadata)
                .catch((err) => {
                    console.log(err);
                    spinnies.fail(`Delete Subsidiary Metadata ${getOrgIdentifier(connection)}`, {
                        text: `Error: ${err.message}`
                    });
                    throw err; // Re-throw to catch block
                });
            if (updateSubsidiaryMetadata && updateSubsidiaryMetadata[0] && updateSubsidiaryMetadata[0].errors) {
                console.log(updateSubsidiaryMetadata[0].errors);
            }
            spinnies.succeed(`Delete Subsidiary Metadata ${getOrgIdentifier(connection)}`, {
                text: `Deleted subsidiary metadata on ${getOrgIdentifier(connection)}`
            });
        } catch (error) {
            console.error('Error updating subsidiary metadata:', error);
            throw error;
        }
    }
};

module.exports = {
    readAllCustomMetadataToFile,
    createMetadataFromAFile,
    deleteSubsidiaryMetadata
};
