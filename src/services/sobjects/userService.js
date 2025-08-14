const fs = require('fs');
const { FILES_DIR } = require('@config/paths.js');
const { ACTIVE_USERS_QUERY } = require('@config/queries.js');

const retrieveActiveUsers = async (connection) => {
    try {
        const result = await connection.query(ACTIVE_USERS_QUERY);
        fs.writeFileSync(FILES_DIR.SOBJECTS.USER_FILE, JSON.stringify(result.records, null, 2));
    } catch (error) {
        console.error('Error retrieving active users:', error);
        throw error;
    }
};

module.exports = {
    retrieveActiveUsers
};