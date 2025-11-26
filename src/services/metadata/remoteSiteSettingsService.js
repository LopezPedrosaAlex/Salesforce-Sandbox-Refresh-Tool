const { METADATA_TYPES } = require('@enums/constants.js');
const { FILES_DIR } = require('@config/paths.js');
const { batchIt, getOrgIdentifier, spinnerInitialization } = require('@utils/metadataUtils.js');
const fs = require('fs');

const retrieveRemoteSiteSettings = async (connections) => {
    const spinnies = spinnerInitialization(METADATA_TYPES.REMOTE_SITE_SETTINGS, connections);
    connections.forEach(async (connection) => {
        try {
            const remoteSiteSettingMetadata = await connection.metadata.list([{type: METADATA_TYPES.REMOTE_SITE_SETTINGS}], process.env.API_VERSION);
            let remoteSiteSettingsContent = [];
            for(const batch of batchIt(10, remoteSiteSettingMetadata.map(item => item.fullName))){
                spinnies.update(`${METADATA_TYPES.REMOTE_SITE_SETTINGS} ${getOrgIdentifier(connection)}`, { text: `Retrieving Remote Site Settings on ${getOrgIdentifier(connection)}...` });
                remoteSiteSettingsContent = [...remoteSiteSettingsContent, ...await connection.metadata.read(METADATA_TYPES.REMOTE_SITE_SETTINGS, batch)];
            }
            fs.writeFileSync(FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].REMOTE_SITE_SETTINGS_FILE, JSON.stringify(remoteSiteSettingsContent, null, 2));
            spinnies.succeed(`${METADATA_TYPES.REMOTE_SITE_SETTINGS} ${getOrgIdentifier(connection)}`, { text: `Retrieved Remote Site Settings on ${getOrgIdentifier(connection)}` });
        }catch (err) {
            spinnies.fail(`${METADATA_TYPES.REMOTE_SITE_SETTINGS} ${getOrgIdentifier(connection)}`, { text: `Error retrieving Remote Site Settings on ${getOrgIdentifier(connection)}` });
            console.error('Error retrieving Remote Site Settings:', err);
            return { success: false, error: err };
        }
    });
}


const deleteRemoteSiteSettings = async (filePath, connection) => {
    try {
        const remoteSiteSettingsData = await fs.promises.readFile(filePath, 'utf8');
        const remoteSiteSettingsNames = JSON.parse(remoteSiteSettingsData).map(setting => setting.fullName).filter(name => !name.includes('__'));
        
        const spinner = createSpinner('Deleting Remote Site Settings...').start();
        for (const batch of batchIt(10, remoteSiteSettingsNames)) {
            await connection.metadata.delete(METADATA_TYPES.REMOTE_SITE_SETTINGS, batch);
        }
        spinner.stop();

        return { success: true };
    } catch (err) {
        console.error('Error deleting Remote Site Settings:', err);
        return { success: false, error: err };
    }
}

const createRemoteSiteSettings = async (filePath, connection) => {
    try {
        const remoteSiteSettingsData = await fs.promises.readFile(filePath, 'utf8');
        const remoteSiteSettingsParsed = JSON.parse(remoteSiteSettingsData);

        const spinner = createSpinner('Creating Remote Site Settings...').start();
        for(const batch of batchIt(10, remoteSiteSettingsParsed)){
            await connection.metadata.create(METADATA_TYPES.REMOTE_SITE_SETTINGS, batch);
        }
        spinner.stop();
        return { success: true };
    } catch (err) {
        console.error('Error updating Remote Site Settings:', err);
        return { success: false, error: err };
    }
}

module.exports = {
    retrieveRemoteSiteSettings,
    createRemoteSiteSettings,
    deleteRemoteSiteSettings
}