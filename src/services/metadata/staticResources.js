const fs = require('fs');
const { batchIt, percentCalc, getOrgIdentifier, spinnerInitialization } = require('@utils/metadataUtils.js');
const { FILES_DIR } = require('@config/paths.js');
const { METADATA_TYPES } = require('@enums/constants.js');

const retrieveAllStaticResources = async (connections) => {
    const spinnies = spinnerInitialization(METADATA_TYPES.STATIC_RESOURCE, connections); 
    connections.forEach(async (connection) => {
        try {
            const staticResourcesMetadata = await connection.metadata.list([{ type: METADATA_TYPES.STATIC_RESOURCE }], process.env.API_VERSION);
            let staticResourcesContent = [];
            let i = 0;

            
            spinnies.update(`${METADATA_TYPES.STATIC_RESOURCE} ${getOrgIdentifier(connection)}`, { text: `Reading Static Resources on ${getOrgIdentifier(connection)}... 0%` });

            for (const batch of batchIt(10, staticResourcesMetadata)) {
                const batchContent = await connection.metadata.read(METADATA_TYPES.STATIC_RESOURCE, batch.map(res => res.fullName)).catch(err => {
                    console.error(`Error reading static resource ${batch.map(res => res.fullName).join(', ')}: ${err}`);
                    return [];
                });
                staticResourcesContent.push(...batchContent);
                i += batch.length;
                spinnies.update(`${METADATA_TYPES.STATIC_RESOURCE} ${getOrgIdentifier(connection)}`, { text: `Reading Static Resources on ${getOrgIdentifier(connection)}... ${percentCalc(i, staticResourcesMetadata.length)}%` });
            }
            fs.writeFileSync(FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].STATIC_RESOURCES_FILE, JSON.stringify(staticResourcesContent, null, 2));
        } catch (error) {
            spinnies.fail(`${METADATA_TYPES.STATIC_RESOURCE} ${getOrgIdentifier(connection)}`, { text: `Error retrieving static resources on ${getOrgIdentifier(connection)}` });
            console.error('Error retrieving static resources:', error);
            throw error;
        }
        spinnies.succeed(`${METADATA_TYPES.STATIC_RESOURCE} ${getOrgIdentifier(connection)}`, { text: `Retrieved Static Resources on ${getOrgIdentifier(connection)}`
        });
    });
    
};
/*

const deleteStaticResourcesFromAFile = async (filePath, connection) => {
    try {
        const staticResourcesToDelete = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        for (const batch of batchIt(10, staticResourcesToDelete)) {
            const result = await connection.metadata.delete(METADATA_TYPES.STATIC_RESOURCE, batch.map(res => res.fullName));
            console.log(`result: ${JSON.stringify(result, null, 2)}`);
        }
    } catch (error) {
        console.error('Error deleting static resources:', error);
        throw error;
    }
};
*/

const createStaticResourcesFromAFile = async (connections) => {
    const spinnies = spinnerInitialization(`Create ${METADATA_TYPES.STATIC_RESOURCE}`, connections);
    connections.forEach(async (connection) => {
        const filePath = FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].STATIC_RESOURCES_FILE;
        try {
            const staticResourcesToCreate = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let i = 0;
            spinnies.update(`Create ${METADATA_TYPES.STATIC_RESOURCE} ${getOrgIdentifier(connection)}`, { text: `Creating Static Resources on ${getOrgIdentifier(connection)}... 0%` });
            for (const batch of batchIt(10, staticResourcesToCreate)) {
                await connection.metadata.update(METADATA_TYPES.STATIC_RESOURCE, batch);
                i += batch.length;
                spinnies.update(`Create ${METADATA_TYPES.STATIC_RESOURCE} ${getOrgIdentifier(connection)}`, { text: `Creating Static Resources on ${getOrgIdentifier(connection)}... ${percentCalc(i, staticResourcesToCreate.length)}%` });
            }
        } catch (error) {
            spinnies.fail(`Create ${METADATA_TYPES.STATIC_RESOURCE} ${getOrgIdentifier(connection)}`, { text: `Error creating static resources on ${getOrgIdentifier(connection)}` });
            console.error('Error creating static resources:', error);
            throw error;
        }
            spinnies.succeed(`Create ${METADATA_TYPES.STATIC_RESOURCE} ${getOrgIdentifier(connection)}`, { text: `Created Static Resources on ${getOrgIdentifier(connection)}`
        });
    });
}

module.exports = {
    retrieveAllStaticResources,
    createStaticResourcesFromAFile
};
