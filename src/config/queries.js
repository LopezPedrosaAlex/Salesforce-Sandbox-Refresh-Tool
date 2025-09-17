const ACTIVE_USERS_QUERY = 'SELECT Id, Name, Email FROM User WHERE NOT(Email LIKE \'%.invalid%\')';
const ALL_USERS_QUERY = 'SELECT Id, UserId, IsFrozen FROM UserLogin';
const ALL_EMAIL_TEMPLATES_QUERY = 'SELECT Id FROM EmailTemplate';

module.exports = {
    ACTIVE_USERS_QUERY,
    ALL_USERS_QUERY,
    ALL_EMAIL_TEMPLATES_QUERY
};
