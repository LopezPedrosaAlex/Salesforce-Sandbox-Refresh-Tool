const ACTIVE_USERS_QUERY = 'SELECT Id, Name, Email FROM User WHERE NOT(Email LIKE \'%.invalid%\')';

module.exports = {
    ACTIVE_USERS_QUERY
};
