const fs = require('fs');
const { FILES_DIR } = require('@config/paths.js');
const { batchIt, spinnerInitialization, getOrgIdentifier } = require('@utils/metadataUtils.js');
const { METADATA_TYPES } = require('@enums/constants.js');
const { DKIMS_QUERY } = require('@config/queries.js');

const retrieveDKIMKeys = async (connections) => {
    const spinnies = spinnerInitialization(METADATA_TYPES.DKIM_KEY, connections); 
    connections.forEach(async (connection) => {
        try {
            spinnies.update(`${METADATA_TYPES.DKIM_KEY} ${getOrgIdentifier(connection)}`, { text: `Retrieving DKIM Keys on ${getOrgIdentifier(connection)}...` });
            const result = await connection.query(DKIMS_QUERY);
            fs.writeFileSync(FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].DKIM_FILE, JSON.stringify(result.records, null, 2));
            } catch (error) {
                spinnies.fail(`${METADATA_TYPES.DKIM_KEY} ${getOrgIdentifier(connection)}`, { text: `Error retrieving DKIM Keys on ${getOrgIdentifier(connection)}` });
                console.error('Error retrieving DKIM Keys:', error);
                throw error;
        }
        spinnies.succeed(`${METADATA_TYPES.DKIM_KEY} ${getOrgIdentifier(connection)}`, { text: `Retrieved DKIM Keys on ${getOrgIdentifier(connection)}` });
    });
};

const createDKIMKeys = async (connections) => {
    const spinnies = spinnerInitialization(`Create DKIM Keys`, connections);
    connections.forEach(async (connection) => {
        try {
            const dkimKeysToCreate = JSON.parse(fs.readFileSync(FILES_DIR.METADATA.TST.DKIM_FILE, 'utf8'));
            for (const batch of batchIt(10, dkimKeysToCreate)) {
                spinnies.update(`Create DKIM Keys ${getOrgIdentifier(connection)}`, { text: `Creating DKIM Keys on ${getOrgIdentifier(connection)}...` });
                 const results = await connection.sobject(METADATA_TYPES.DKIM_KEY).create(batch.map(item => ({
                    ...item,
                    IsActive: true}))).then(async (result) => {
                let status;
                do {
                    await new Promise(r => setTimeout(r, 2000)); // espera 15s
                    status = await connection.metadata.checkDeployStatus(result.id, true);
                } while (status.status !== 'Succeeded');
                    spinnies.succeed(`Create DKIM Keys ${getOrgIdentifier(connection)}`, { text: `Created DKIM Keys on ${getOrgIdentifier(connection)}` });
                });
            }
        } catch (error) {
            console.error('Error creating DKIM Keys:', error);
            throw error;
        }
    });
};

module.exports = { retrieveDKIMKeys, createDKIMKeys };