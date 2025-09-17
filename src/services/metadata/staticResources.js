const fs = require('fs');
const { batchIt, percentCalc } = require('@utils/metadataUtils.js');
const { FILES_DIR } = require('@config/paths.js');
const { METADATA_TYPES } = require('@enums/constants.js')

const retrieveAllStaticResources = async (connection) => {
    try {
        const staticResourcesMetadata = await connection.metadata.list([{ type: METADATA_TYPES.STATIC_RESOURCE }], process.env.API_VERSION);
        let staticResourcesContent = [];
        let i = 0;
        for(const batch of batchIt(10, staticResourcesMetadata)) {
            const batchContent = await connection.metadata.read(METADATA_TYPES.STATIC_RESOURCE, batch.map(res => res.fullName)).catch(err => {
                console.error(`Error reading static resource ${batch.map(res => res.fullName).join(', ')}: ${err}`);
                return [];
            });
            staticResourcesContent.push(...batchContent);
            i += batch.length;
            console.log(`Reading static resources... ${percentCalc(i, staticResourcesMetadata.length)}%`);
        }
        console.log(`staticResourcesContent length: ${staticResourcesContent.length}`);
        fs.writeFileSync(FILES_DIR.METADATA.STATIC_RESOURCES_FILE, JSON.stringify(staticResourcesContent, null, 2));
    } catch (error) {
        console.error('Error retrieving static resources:', error);
        throw error;
    }
};

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

const createStaticResourcesFromAFile = async (filePath, connection) => {
    try {
        const staticResourcesToCreate = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        for (const batch of batchIt(10, staticResourcesToCreate)) {
            await connection.metadata.create(METADATA_TYPES.STATIC_RESOURCE, batch);
        }
    } catch (error) {
        console.error('Error creating static resources:', error);
        throw error;
    }
};

module.exports = {
    retrieveAllStaticResources,
    deleteStaticResourcesFromAFile,
    createStaticResourcesFromAFile
};
