const { METADATA_TYPES, BATCH_SIZES } = require('@enums/constants.js');
const { FILES_DIR } = require('@config/paths.js');
const { batchIt, getOrgIdentifier, spinnerInitialization } = require('@utils/metadataUtils.js');
const fs = require('fs');

const retrieveRemoteSiteSettings = async (connections) => {
    const spinnies = spinnerInitialization(METADATA_TYPES.REMOTE_SITE_SETTINGS, connections);
    for (const connection of connections) {
        try {
            const remoteSiteSettingMetadata = await connection.metadata.list(
                [{ type: METADATA_TYPES.REMOTE_SITE_SETTINGS }],
                process.env.API_VERSION
            );
            let remoteSiteSettingsContent = [];

            if (remoteSiteSettingMetadata) {
                const metadataList = Array.isArray(remoteSiteSettingMetadata)
                    ? remoteSiteSettingMetadata
                    : [remoteSiteSettingMetadata];
                for (const batch of batchIt(
                    BATCH_SIZES.STANDARD,
                    metadataList.map((item) => item.fullName)
                )) {
                    spinnies.update(`${METADATA_TYPES.REMOTE_SITE_SETTINGS} ${getOrgIdentifier(connection)}`, {
                        text: `Retrieving Remote Site Settings on ${getOrgIdentifier(connection)}...`
                    });
                    const items = await connection.metadata.read(METADATA_TYPES.REMOTE_SITE_SETTINGS, batch);
                    remoteSiteSettingsContent = [
                        ...remoteSiteSettingsContent,
                        ...(Array.isArray(items) ? items : [items])
                    ];
                }
            }

            fs.writeFileSync(
                FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].REMOTE_SITE_SETTINGS_FILE,
                JSON.stringify(remoteSiteSettingsContent, null, 2)
            );
            spinnies.succeed(`${METADATA_TYPES.REMOTE_SITE_SETTINGS} ${getOrgIdentifier(connection)}`, {
                text: `Retrieved Remote Site Settings on ${getOrgIdentifier(connection)}`
            });
        } catch (err) {
            spinnies.fail(`${METADATA_TYPES.REMOTE_SITE_SETTINGS} ${getOrgIdentifier(connection)}`, {
                text: `Error retrieving Remote Site Settings on ${getOrgIdentifier(connection)}`
            });
            console.error('Error retrieving Remote Site Settings:', err);
            // return { success: false, error: err };
            // continue
        }
    }
};

const deleteRemoteSiteSettings = async (connections) => {
    for (const connection of connections) {
        try {
            const remoteSiteSettingsData = await fs.promises.readFile(
                FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].REMOTE_SITE_SETTINGS_FILE,
                'utf8'
            );
            const remoteSiteSettingsNames = JSON.parse(remoteSiteSettingsData)
                .map((setting) => setting.fullName)
                .filter((name) => !name.includes('__'));

            for (const batch of batchIt(BATCH_SIZES.STANDARD, remoteSiteSettingsNames)) {
                await connection.metadata.delete(METADATA_TYPES.REMOTE_SITE_SETTINGS, batch);
            }

            // return { success: true };
        } catch (err) {
            console.error('Error deleting Remote Site Settings:', err);
            // return { success: false, error: err };
        }
    }
};

const createRemoteSiteSettings = async (connections) => {
    for (const connection of connections) {
        try {
            const remoteSiteSettingsData = await fs.promises.readFile(
                FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].REMOTE_SITE_SETTINGS_FILE,
                'utf8'
            );
            const remoteSiteSettingsParsed = JSON.parse(remoteSiteSettingsData);

            for (const batch of batchIt(BATCH_SIZES.STANDARD, remoteSiteSettingsParsed)) {
                await connection.metadata.create(METADATA_TYPES.REMOTE_SITE_SETTINGS, batch);
            }
            // return { success: true };
        } catch (err) {
            console.error('Error updating Remote Site Settings:', err);
            // return { success: false, error: err };
        }
    }
};

module.exports = {
    retrieveRemoteSiteSettings,
    createRemoteSiteSettings,
    deleteRemoteSiteSettings
};
