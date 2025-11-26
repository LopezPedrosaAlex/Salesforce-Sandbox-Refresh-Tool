const { VALUE_TYPES, METADATA_TYPES } = require('@enums/constants.js')
const Spinnies = require('spinnies');

const spinner = { interval: 80, frames: ['🌒', '🌓', '🌔', '🌕', '🌖', '🌗']}
const spinnies = new Spinnies({color: 'blue', succeedColor: 'green', spinner});

function batchIt(batchSize, objectToBatch) {
        const batches = [];
        for (let i = 0; i < objectToBatch.length; i += batchSize) {
        batches.push(objectToBatch.slice(i, i + batchSize));
        }

        return batches;
}

// Helper to recursively fix 'value' fields in metadata
function escapeXml(str) {
    if (typeof str !== VALUE_TYPES.STRING) return str;
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
}

function fixMetadataValues(metadata) {
    if (Array.isArray(metadata)) {
        return metadata.map(fixMetadataValues);
    } else if (typeof metadata === METADATA_TYPES.OBJECT && metadata !== null) {
        const newObj = { ...metadata };
        if (Array.isArray(newObj.values)) {
            newObj.values = newObj.values.map(valObj => {
                if (valObj && typeof valObj === METADATA_TYPES.OBJECT && valObj.field && valObj.value) {
                    let value = valObj.value;
                    // If value is an object with _, use that
                    if (typeof value === METADATA_TYPES.OBJECT && value !== null && '_' in value) {
                        value = value._;
                    }
                    // Only allow string, number, boolean. Convert number/boolean to string, skip others.
                    if (
                        typeof value === VALUE_TYPES.STRING ||
                        typeof value === VALUE_TYPES.NUMBER ||
                        typeof value === VALUE_TYPES.BOOLEAN
                    ) {
                        return { ...valObj, value: escapeXml(String(value)) };
                    } else {
                        // Skip invalid value
                        return null;
                    }
                }
                return valObj;
            }).filter(Boolean); // Remove nulls
        }
        // Recursively fix nested objects
        for (const key in newObj) {
            if (typeof newObj[key] === METADATA_TYPES.OBJECT) {
                newObj[key] = fixMetadataValues(newObj[key]);
            }
        }
        return newObj;
    }
    return metadata;
}

const getOrgIdentifier = (connection) => {
    const match = connection.instanceUrl.match(/--([^.]*)\./);
    return match ? match[1] : '';
}

const isValidCustomMetadata = (record) => {
    if (!record || typeof record !== METADATA_TYPES.OBJECT) return false;
    if (!record.fullName || !record.label) return false;
    if (!Array.isArray(record.values) || record.values.length === 0) return false;
    return true;
};

const percentCalc = (part, total) => {
    if (total === 0) return 0;
    return ((part / total) * 100).toFixed(2);
};

const sendEmails = async (connection, subject, body, recipients) => {
    
    await connection.requestPost('/services/data/v59.0/actions/standard/emailSimple', {    
        inputs: [{
            emailSubject: subject,
            sendRichBody: true,
            emailBody: body,
            senderType: 'CurrentUser',
            emailAddresses: 'alex.lopez@grifols.com'
        }]
    });

};

const spinnerInitialization = (spinnerName, connections) => {
    if (connections.length === 0) {
        spinnies.add(`${spinnerName}`, { text: ``, color: 'yellow' });
    } else {
        connections.forEach(connection => {
            spinnies.add(`${spinnerName} ${getOrgIdentifier(connection)}`, { text: ``, color: 'yellow' });
        });
    }

    return spinnies;
}

module.exports = {
    batchIt,
    fixMetadataValues,
    isValidCustomMetadata,
    percentCalc,
    sendEmails,
    getOrgIdentifier,
    spinnerInitialization
};
