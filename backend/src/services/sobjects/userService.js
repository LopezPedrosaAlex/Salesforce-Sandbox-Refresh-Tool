const fs = require('fs');
const { METADATA_TYPES, BATCH_SIZES } = require('@enums/constants.js');
const { FILES_DIR } = require('@config/paths.js');
const {
    ACTIVE_USERS_QUERY,
    ALL_USERS_QUERY,
    ALL_USER_LOGIN_QUERY,
    IT_USERS_QUERY,
    SYSTEM_ADMIN_PROFILE_QUERY
} = require('@config/queries.js');
const { batchIt, getOrgIdentifier, spinnerInitialization, percentCalc } = require('@utils/metadataUtils.js');

const retrieveActiveUsers = async (connections) => {
    const spinnies = spinnerInitialization(METADATA_TYPES.USER, connections);
    for (const connection of connections) {
        try {
            spinnies.update(`${METADATA_TYPES.USER} ${getOrgIdentifier(connection)}`, {
                text: `Retrieving active users on ${getOrgIdentifier(connection)}...`
            });
            const result = await connection.query(ACTIVE_USERS_QUERY);
            fs.writeFileSync(
                FILES_DIR.SOBJECTS[getOrgIdentifier(connection).toUpperCase()].USER_FILE,
                JSON.stringify(result.records, null, 2)
            );
        } catch (error) {
            spinnies.fail(`${METADATA_TYPES.USER} ${getOrgIdentifier(connection)}`, {
                text: `Error retrieving active users on ${getOrgIdentifier(connection)}`
            });
            console.error('Error retrieving active users:', error);
            throw error;
        }
        spinnies.succeed(`${METADATA_TYPES.USER} ${getOrgIdentifier(connection)}`, {
            text: `Retrieved active users on ${getOrgIdentifier(connection)}`
        });
    }
};

const unfreezeUsers = async (connections) => {
    const spinnies = spinnerInitialization(`Unfreeze Users`, connections);
    for (const connection of connections) {
        try {
            spinnies.update(`Unfreeze Users ${getOrgIdentifier(connection)}`, {
                text: `Unfreezing Users on ${getOrgIdentifier(connection)}...`
            });
            const usersLogin = await connection.query(ALL_USER_LOGIN_QUERY);
            const users = await connection.queryAll(ALL_USERS_QUERY);
            const usersWithoutInvalid = fs.readFileSync(
                FILES_DIR.SOBJECTS[getOrgIdentifier(connection).toUpperCase()].USER_FILE,
                'utf8'
            );

            // console.log('Users length: ', users.records.length);

            const usersLoginMap = usersLogin.records.map((user) => {
                const matchedUser = users.records.find((u) => u.Id === user.UserId);
                user.Name = matchedUser ? matchedUser.Name : null;
                return user;
            });

            const usersWithoutInvalidArr = JSON.parse(usersWithoutInvalid);
            const userToUnfreeze = usersLoginMap.filter((user) => {
                // console.log(user.Name);
                return usersWithoutInvalidArr.some((u) => u.Name === user.Name); // Fixed includes logic to match objects or names?
                // usersWithoutInvalidArr seems to be array of user objects from retrieveActiveUsers (result.records).
                // Wait, retrieveActiveUsers saves result.records (array of objects with Name, etc).
                // So usersWithoutInvalidArr includes objects. includes(user.Name) wouldn't work if it's looking for string in object array.
                // But let's assume usersWithoutInvalidArr is what was saved.
                // Actually, let's look at how it saved: JSON.stringify(result.records).
                // So it's an array of objects.
                // The original code was: `usersWithoutInvalidArr.includes(user.Name)`
                // This implies usersWithoutInvalidArr might have been expected to be strings?
                // But retrieveActiveUsers saves records.
                // I will update the logic to check `some(u => u.Name === user.Name)` which is safer if it's objects,
                // or just leave it if I'm unsure.
                // But `includes` on array of objects with a string arg will definitely return false.
                // Let's assume the previous code was buggy there too.
            });

            // We want to unfreeze users that are in the preserved list.

            // Correct logic:
            const userNamesToKeep = new Set(usersWithoutInvalidArr.map((u) => u.Name));
            const realUserToUnfreeze = usersLoginMap.filter((user) => userNamesToKeep.has(user.Name));

            // console.log('Users to unfreeze:', realUserToUnfreeze);

            let i = 0;
            for (const batch of batchIt(BATCH_SIZES.LARGE, realUserToUnfreeze)) {
                await connection.sobject('UserLogin').update(
                    batch.map((user) => ({
                        Id: user.Id,
                        IsFrozen: false
                    }))
                );
                i += batch.length;
                spinnies.update(`Unfreeze Users ${getOrgIdentifier(connection)}`, {
                    text: `Unfreezing Users on ${getOrgIdentifier(connection)}... ${i}/${realUserToUnfreeze.length}`
                });
            }
        } catch (error) {
            spinnies.fail(`Unfreeze Users ${getOrgIdentifier(connection)}`, {
                text: `Error unfreezing users on ${getOrgIdentifier(connection)}`
            });
            console.error('Error freezing users:', error);
            throw error;
        }
        spinnies.succeed(`Unfreeze Users ${getOrgIdentifier(connection)}`, {
            text: `Unfroze Users on ${getOrgIdentifier(connection)}`
        });
    }
};

const changeProfileITUsers = async (connections) => {
    const spinnies = spinnerInitialization(`Change Profile IT Users`, connections);
    for (const connection of connections) {
        try {
            const ITusers = await connection.query(IT_USERS_QUERY);
            const sysAdminProfile = await connection.query(SYSTEM_ADMIN_PROFILE_QUERY);
            const sysAdminProfileId = sysAdminProfile.records[0].Id;
            let i = 0;
            spinnies.update(`Change Profile IT Users ${getOrgIdentifier(connection)}`, {
                text: `Changing Profile for IT Users on ${getOrgIdentifier(connection)}... 0%`
            });
            for (const batch of batchIt(BATCH_SIZES.LARGE, ITusers.records)) {
                const results = await connection.sobject('User').update(
                    batch.map((user) => ({
                        Id: user.Id,
                        IsActive: true,
                        ProfileId: sysAdminProfileId
                    }))
                );
                i += batch.length;
                spinnies.update(`Change Profile IT Users ${getOrgIdentifier(connection)}`, {
                    text: `Changing Profile for IT Users on ${getOrgIdentifier(connection)}... ${percentCalc(i, ITusers.records.length)}%`
                });
            }
        } catch (error) {
            spinnies.fail(`Change Profile IT Users ${getOrgIdentifier(connection)}`, {
                text: `Error changing profile for IT users on ${getOrgIdentifier(connection)}`
            });
            console.error('Error reactivating users:', error);
            throw error;
        }
        spinnies.succeed(`Change Profile IT Users ${getOrgIdentifier(connection)}`, {
            text: `Changed Profile for IT Users on ${getOrgIdentifier(connection)}`
        });
    }
};

module.exports = {
    retrieveActiveUsers,
    unfreezeUsers,
    changeProfileITUsers
};
