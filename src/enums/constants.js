const VALUE_TYPES = Object.freeze({
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean'
});

const METADATA_TYPES = Object.freeze({
  CUSTOM_METADATA: 'CustomMetadata',
  OBJECT: 'object',
  CERTIFICATE: 'Certificate',
  EMAIL_TEMPLATE: 'EmailTemplate',
  STATIC_RESOURCE: 'StaticResource',
  USER: 'User'
});

module.exports = {
  VALUE_TYPES,
  METADATA_TYPES
};
