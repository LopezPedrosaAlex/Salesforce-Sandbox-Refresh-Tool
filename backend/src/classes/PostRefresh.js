const AbstractRefresh = require('./AbstractRefresh');
const RefreshStep = require('./RefreshStep');
const { ENVIRONMENTS } = require('@enums/constants.js');

const { createMetadataFromAFile, deleteSubsidiaryMetadata } = require('@services/metadata/customMetadataService.js');
const { createStaticResourcesFromAFile } = require('@services/metadata/staticResources.js');
const { unfreezeUsers, changeProfileITUsers } = require('@services/sobjects/userService.js');
const { deleteScheduledJobs } = require('@services/metadata/scheduledJobService.js');
const { updateSandboxEnvironment } = require('@services/sObjects/copadoService.js');
const { updateLeadAssignmentRules } = require('@services/metadata/leadAssignmentRules.js');
const { updateEmailTemplates } = require('@services/metadata/emailTemplateService.js');
const {
    createRemoteSiteSettings,
    deleteRemoteSiteSettings
} = require('@services/metadata/remoteSiteSettingsService.js');

class PostRefresh extends AbstractRefresh {
    getSteps() {
        return [
            new RefreshStep('create_metadata_from_file', 'Create Metadata From File', createMetadataFromAFile, false),
            new RefreshStep(
                'delete_subsidiary_metadata',
                'Delete Subsidiary Metadata',
                deleteSubsidiaryMetadata,
                false
            ),
            new RefreshStep(
                'create_static_resources',
                'Create Static Resources',
                createStaticResourcesFromAFile,
                false
            ),
            new RefreshStep('change_profile_it_users', 'Change Profile IT Users', changeProfileITUsers, false),

            // Enabled Task
            new RefreshStep('unfreeze_users', 'Unfreeze Users', unfreezeUsers, true),

            new RefreshStep('update_email_templates', 'Update Email Templates', updateEmailTemplates, false),

            // Special Task with different connections
            new RefreshStep(
                'update_sandbox_environment',
                'Update Sandbox Environment (Copado)',
                async (targets, connectionsMap) => {
                    const copadoConnections = [
                        connectionsMap[ENVIRONMENTS.TST],
                        connectionsMap[ENVIRONMENTS.PRE],
                        connectionsMap[ENVIRONMENTS.PROD]
                    ];
                    await updateSandboxEnvironment(copadoConnections);
                },
                false
            ),

            new RefreshStep('delete_scheduled_jobs', 'Delete Scheduled Jobs', deleteScheduledJobs, false),
            new RefreshStep(
                'delete_remote_site_settings',
                'Delete Remote Site Settings',
                deleteRemoteSiteSettings,
                false
            ),
            new RefreshStep(
                'create_remote_site_settings',
                'Create Remote Site Settings',
                createRemoteSiteSettings,
                false
            ),
            new RefreshStep(
                'update_lead_assignment_rules',
                'Update Lead Assignment Rules',
                updateLeadAssignmentRules,
                false
            )
        ];
    }
}

module.exports = PostRefresh;
