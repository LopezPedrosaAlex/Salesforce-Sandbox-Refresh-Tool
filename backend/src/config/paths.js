const path = require('path');

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const FILES_DIR = {
    METADATA: {
        TST: {
            CUSTOM_METADATA_FILE: path.join(SRC_DIR, 'files', 'metadata', 'tst', 'customMetadata.json'),
            LEAD_ASSIGNMENT_RULES_FILE: path.join(SRC_DIR, 'files', 'metadata', 'tst', 'leadAssignmentRules.json'),
            LEAD_ASSIGNMENT_XML_RULES_FILE: path.join(
                SRC_DIR,
                'files',
                'metadata',
                'tst',
                'assignmentRules',
                'Lead.assignmentRules-meta.xml'
            ),
            LEAD_ASSIGNMENT_PACKAGE_XML_FILE: path.join(
                SRC_DIR,
                'files',
                'metadata',
                'tst',
                'assignmentRules',
                'package.xml'
            ),
            LEAD_ASSIGNMENT_FOLDER_ZIP: path.join(
                SRC_DIR,
                'files',
                'metadata',
                'tst',
                'assignmentRules',
                'assignmentRules.zip'
            ),
            CERTIFICATES_FILE: path.join(SRC_DIR, 'files', 'metadata', 'tst', 'certificatesMetadata.json'),
            STATIC_RESOURCES_FILE: path.join(SRC_DIR, 'files', 'metadata', 'tst', 'staticResources.json'),
            EMAIL_TEMPLATES_FILE: path.join(SRC_DIR, 'files', 'metadata', 'tst', 'emailTemplates.json'),
            DKIM_FILE: path.join(SRC_DIR, 'files', 'sobjects', 'tst', 'dkimKeys.json'),
            REMOTE_SITE_SETTINGS_FILE: path.join(SRC_DIR, 'files', 'metadata', 'tst', 'remoteSiteSettings.json')
        },
        PRE: {
            CUSTOM_METADATA_FILE: path.join(SRC_DIR, 'files', 'metadata', 'pre', 'customMetadata.json'),
            LEAD_ASSIGNMENT_RULES_FILE: path.join(SRC_DIR, 'files', 'metadata', 'pre', 'leadAssignmentRules.json'),
            LEAD_ASSIGNMENT_XML_RULES_FILE: path.join(
                SRC_DIR,
                'files',
                'metadata',
                'pre',
                'assignmentRules',
                'Lead.assignmentRules-meta.xml'
            ),
            LEAD_ASSIGNMENT_PACKAGE_XML_FILE: path.join(
                SRC_DIR,
                'files',
                'metadata',
                'pre',
                'assignmentRules',
                'package.xml'
            ),
            LEAD_ASSIGNMENT_FOLDER_ZIP: path.join(
                SRC_DIR,
                'files',
                'metadata',
                'pre',
                'assignmentRules',
                'assignmentRules.zip'
            ),
            CERTIFICATES_FILE: path.join(SRC_DIR, 'files', 'metadata', 'pre', 'certificatesMetadata.json'),
            STATIC_RESOURCES_FILE: path.join(SRC_DIR, 'files', 'metadata', 'pre', 'staticResources.json'),
            EMAIL_TEMPLATES_FILE: path.join(SRC_DIR, 'files', 'metadata', 'pre', 'emailTemplates.json'),
            DKIM_FILE: path.join(SRC_DIR, 'files', 'sobjects', 'pre', 'dkimKeys.json'),
            REMOTE_SITE_SETTINGS_FILE: path.join(SRC_DIR, 'files', 'metadata', 'pre', 'remoteSiteSettings.json')
        }
    },
    SOBJECTS: {
        TST: {
            USER_FILE: path.join(SRC_DIR, 'files', 'sobjects', 'tst', 'user.json')
        },
        PRE: {
            USER_FILE: path.join(SRC_DIR, 'files', 'sobjects', 'pre', 'user.json')
        }
    }
};

module.exports = {
    FILES_DIR
};
