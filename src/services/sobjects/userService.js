const fs = require('fs');
const { FILES_DIR } = require('@config/paths.js');
const { ACTIVE_USERS_QUERY, ALL_USERS_QUERY } = require('@config/queries.js');
const { batchIt } = require('@utils/metadataUtils.js');

const retrieveActiveUsers = async (connection) => {
    try {
        const result = await connection.query(ACTIVE_USERS_QUERY);
        fs.writeFileSync(FILES_DIR.SOBJECTS.USER_FILE, JSON.stringify(result.records, null, 2));
    } catch (error) {
        console.error('Error retrieving active users:', error);
        throw error;
    }
};

const unfreezeUsers = async (filePath, connection) => {
    try {

        const usersLogin = await connection.query(ALL_USERS_QUERY);
        const usersWithoutInvalid = fs.readFileSync(filePath, 'utf8');
        const userToUnfreeze = usersLogin.records.filter(user => usersWithoutInvalid.includes(user.UserId));
        for (const batch of batchIt(200, userToUnfreeze)) {
            await connection.sobject('UserLogin').update(batch.map(user => ({
                Id: user.Id,
                IsFrozen: false
            })));
        }
    } catch (error) {
        console.error('Error freezing users:', error);
        throw error;
    }
};

module.exports = {
    retrieveActiveUsers,
    unfreezeUsers
};