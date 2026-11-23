const ACTIVE_USERS_QUERY =
    "SELECT Id, Name, Email, IsActive FROM User WHERE IsActive = true AND (NOT Email LIKE '%.invalid%')";
const ALL_USER_LOGIN_QUERY = 'SELECT Id, UserId, IsFrozen FROM UserLogin';
const ALL_USERS_QUERY = 'SELECT Id, Name, Username, Email FROM User';
const ALL_EMAIL_TEMPLATES_QUERY = 'SELECT Id FROM EmailTemplate';
const IT_USERS_QUERY =
    "SELECT Id, Name, Email, ProfileId FROM User WHERE Profile.Name IN ('IT CRM') AND IsActive = true";
const SYSTEM_ADMIN_PROFILE_QUERY = "SELECT Id FROM Profile WHERE Name = 'System Administrator'";
const SCHEDULED_JOBS_QUERY =
    "SELECT Id, CronJobDetail.Name, State, toLabel(CronJobDetail.JobType) FROM CronTrigger WHERE toLabel(CronJobDetail.JobType) IN('Reporting Notification','Dashboard Refresh','Report Run') AND State = 'WAITING'";
const DKIMS_QUERY = 'SELECT Id, Domain, Selector, AlternateSelector, DomainMatch FROM EmailDomainKey';
module.exports = {
    ACTIVE_USERS_QUERY,
    ALL_USERS_QUERY,
    ALL_EMAIL_TEMPLATES_QUERY,
    IT_USERS_QUERY,
    SYSTEM_ADMIN_PROFILE_QUERY,
    SCHEDULED_JOBS_QUERY,
    DKIMS_QUERY,
    ALL_USER_LOGIN_QUERY
};
