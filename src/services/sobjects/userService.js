const fs = require('fs');
const { METADATA_TYPES } = require('@enums/constants.js');
const { FILES_DIR } = require('@config/paths.js');
const { ACTIVE_USERS_QUERY, ALL_USERS_QUERY, IT_USERS_QUERY, SYSTEM_ADMIN_PROFILE_QUERY } = require('@config/queries.js');
const { batchIt, getOrgIdentifier, spinnerInitialization, percentCalc } = require('@utils/metadataUtils.js');

const retrieveActiveUsers = async (connections) => {
    const spinnies = spinnerInitialization(METADATA_TYPES.USER, connections);
    connections.forEach(async (connection) => {
        try {
            spinnies.update(`${METADATA_TYPES.USER} ${getOrgIdentifier(connection)}`, { text: `Retrieving active users on ${getOrgIdentifier(connection)}...` });
            const result = await connection.query(ACTIVE_USERS_QUERY);
            fs.writeFileSync(FILES_DIR.SOBJECTS[getOrgIdentifier(connection).toUpperCase()].USER_FILE, JSON.stringify(result.records, null, 2));
        } catch (error) {
            spinnies.fail(`${METADATA_TYPES.USER} ${getOrgIdentifier(connection)}`, { text: `Error retrieving active users on ${getOrgIdentifier(connection)}` });
            console.error('Error retrieving active users:', error);
            throw error;
        }
        spinnies.succeed(`${METADATA_TYPES.USER} ${getOrgIdentifier(connection)}`, { text: `Retrieved active users on ${getOrgIdentifier(connection)}`
        });

    });

};

const unfreezeUsers = async (connections) => {
    const spinnies = spinnerInitialization(`Unfreeze Users`, connections);
    connections.forEach(async (connection) => {
        try {
    
            spinnies.update(`Unfreeze Users ${getOrgIdentifier(connection)}`, { text: `Unfreezing Users on ${getOrgIdentifier(connection)}...` });
            const usersLogin = await connection.query(ALL_USERS_QUERY);
            const usersWithoutInvalid = fs.readFileSync(FILES_DIR.SOBJECTS[getOrgIdentifier(connection).toUpperCase()].USER_FILE, 'utf8');
            const userToUnfreeze = usersLogin.records.filter(user => usersWithoutInvalid.includes(user.UserId));
            let i = 0;
            for (const batch of batchIt(200, userToUnfreeze)) {
                await connection.sobject('UserLogin').update(batch.map(user => ({
                    Id: user.Id,
                    IsFrozen: false
                })));
                i += batch.length;
                spinnies.update(`Unfreeze Users ${getOrgIdentifier(connection)}`, { text: `Unfreezing Users on ${getOrgIdentifier(connection)}... ${i}/${userToUnfreeze.length}` });
            }
        } catch (error) {
            spinnies.fail(`Unfreeze Users ${getOrgIdentifier(connection)}`, { text: `Error unfreezing users on ${getOrgIdentifier(connection)}` });
            console.error('Error freezing users:', error);
            throw error;
        }
        spinnies.succeed(`Unfreeze Users ${getOrgIdentifier(connection)}`, { text: `Unfroze Users on ${getOrgIdentifier(connection)}`
        });
    });
}

const changeProfileITUsers = async (connections) => {
    const spinnies = spinnerInitialization(`Change Profile IT Users`, connections);
    connections.forEach(async (connection) => {
        try {
            const ITusers = await connection.query(IT_USERS_QUERY);
            const sysAdminProfile = await connection.query(SYSTEM_ADMIN_PROFILE_QUERY);
            const sysAdminProfileId = sysAdminProfile.records[0].Id;
            let i = 0;
            spinnies.update(`Change Profile IT Users ${getOrgIdentifier(connection)}`, { text: `Changing Profile for IT Users on ${getOrgIdentifier(connection)}... 0%` });
            for (const batch of batchIt(200, ITusers.records)) {
                const results = await connection.sobject('User').update(batch.map(user => ({
                    Id: user.Id,
                    IsActive: true,
                    ProfileId: sysAdminProfileId
                })));
                i += batch.length;
                spinnies.update(`Change Profile IT Users ${getOrgIdentifier(connection)}`, { text: `Changing Profile for IT Users on ${getOrgIdentifier(connection)}... ${percentCalc(i, ITusers.records.length)}%` });
            }
        } catch (error) {
            spinnies.fail(`Change Profile IT Users ${getOrgIdentifier(connection)}`, { text: `Error changing profile for IT users on ${getOrgIdentifier(connection)}` });
            console.error('Error reactivating users:', error);
            throw error;
        }
        spinnies.succeed(`Change Profile IT Users ${getOrgIdentifier(connection)}`, { text: `Changed Profile for IT Users on ${getOrgIdentifier(connection)}` });
    });
}

module.exports = {
    retrieveActiveUsers,
    unfreezeUsers,
    changeProfileITUsers
};