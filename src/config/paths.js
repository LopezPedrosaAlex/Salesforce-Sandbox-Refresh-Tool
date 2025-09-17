const path = require('path');

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const FILES_DIR = {
    METADATA: {
        CUSTOM_METADATA_FILE: path.join(SRC_DIR, 'files', 'metadata', 'customMetadata.json'),
        CERTIFICATES_FILE: path.join(SRC_DIR, 'files', 'metadata', 'certificatesMetadata.json'),
        STATIC_RESOURCES_FILE: path.join(SRC_DIR, 'files', 'metadata', 'staticResources.json'),
        EMAIL_TEMPLATES_FILE: path.join(SRC_DIR, 'files', 'metadata', 'emailTemplates.json'),
    },
    SOBJECTS: {
        USER_FILE: path.join(SRC_DIR, 'files', 'sobjects', 'user.json'),
    }
};

module.exports = {
  FILES_DIR
};
