const VALUE_TYPES = Object.freeze({
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean'
});

const ENVIRONMENTS = Object.freeze({
  PROD: 'Production',
  TST: 'Test',
  PRE: 'Pre',
  ALEX: 'Alex'
});

const METADATA_TYPES = Object.freeze({
  CUSTOM_METADATA: 'CustomMetadata',
  LEAD_ASSIGNMENT_RULES: 'AssignmentRules',
  OBJECT: 'object',
  LEAD_OBJECT: 'Lead',
  CERTIFICATE: 'Certificate',
  EMAIL_TEMPLATE: 'EmailTemplate',
  STATIC_RESOURCE: 'StaticResource',
  USER: 'User',
  DKIM_KEY: 'EmailDomainKey',
  EMAIL_FOLDERS: ['EmailTemplateFolder', 'EmailFolder'],
  REMOTE_SITE_SETTINGS: 'RemoteSiteSetting'
});

module.exports = {
  VALUE_TYPES,
  METADATA_TYPES,
  ENVIRONMENTS
};
