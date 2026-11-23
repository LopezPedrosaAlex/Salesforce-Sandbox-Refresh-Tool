const AbstractRefresh = require('./AbstractRefresh');
const RefreshStep = require('./RefreshStep');

const { readAllCustomMetadataToFile } = require('@services/metadata/customMetadataService.js');
const { retrieveActiveUsers } = require('@services/sobjects/userService.js');
const { retrieveAllStaticResources } = require('@services/metadata/staticResources.js');
const { retrieveAllEmailTemplates } = require('@services/metadata/emailTemplateService.js');
const { retrieveLeadAssignmentRules } = require('@services/metadata/leadAssignmentRules.js');
const { retrieveRemoteSiteSettings } = require('@services/metadata/remoteSiteSettingsService.js');
const { retrieveDKIMKeys } = require('@services/metadata/emailService.js');
const { sendEmails } = require('@utils/metadataUtils.js');
const { EMAILS } = require('@config/emails.js');

class PreRefresh extends AbstractRefresh {
    getSteps() {
        return [
            new RefreshStep('read_custom_metadata', 'Read Custom Metadata', readAllCustomMetadataToFile),
            new RefreshStep(
                'retrieve_lead_assignment_rules',
                'Retrieve Lead Assignment Rules',
                retrieveLeadAssignmentRules
            ),
            new RefreshStep(
                'retrieve_remote_site_settings',
                'Retrieve Remote Site Settings',
                retrieveRemoteSiteSettings
            ),
            new RefreshStep('retrieve_active_users', 'Retrieve Active Users', retrieveActiveUsers),
            new RefreshStep('retrieve_static_resources', 'Retrieve Static Resources', retrieveAllStaticResources),
            new RefreshStep('retrieve_email_templates', 'Retrieve Email Templates', retrieveAllEmailTemplates),
            new RefreshStep('retrieve_dkim_keys', 'Retrieve DKIM Keys', retrieveDKIMKeys),

            // Feature to Test (Disabled by default)
            new RefreshStep(
                'send_warning_emails',
                'Send Warning Emails',
                async (connections) => {
                    const promises = connections.map((conn) =>
                        sendEmails(conn, EMAILS.REFRESH_WARNING.SUBJECT, EMAILS.REFRESH_WARNING.BODY, [
                            'alex.lopez@grifols.com'
                        ])
                    );
                    await Promise.all(promises);
                },
                false
            )
        ];
    }
}

module.exports = PreRefresh;
