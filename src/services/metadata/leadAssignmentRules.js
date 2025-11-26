const fs = require('fs');
const { FILES_DIR } = require('@config/paths.js');
const { METADATA_TYPES } = require('@enums/constants.js');
const { getOrgIdentifier, spinnerInitialization } = require('@utils/metadataUtils.js');                                                       
const path = require('path');
const xml2js = require('xml2js');
const archiver = require('archiver');

const retrieveLeadAssignmentRules = async (connections) => {
    const spinnies = spinnerInitialization(METADATA_TYPES.LEAD_ASSIGNMENT_RULES, connections);

    connections.forEach(async (connection) => {
        try {
            spinnies.update(`${METADATA_TYPES.LEAD_ASSIGNMENT_RULES} ${getOrgIdentifier(connection)}`, { text: `Retrieving Lead Assignment Rules on ${getOrgIdentifier(connection)}...` });
            const leadAssignmentRulesToWrite = await connection.metadata.read(METADATA_TYPES.LEAD_ASSIGNMENT_RULES, METADATA_TYPES.LEAD_OBJECT);
            let metadataParsed;
    
            metadataParsed = leadAssignmentRulesToWrite;
            delete metadataParsed.fullName; 

            metadataParsed.assignmentRule[0].ruleEntry.forEach(rule => {
                rule.assignedTo += `.${getOrgIdentifier(connection)}`;
            });
            
            const wrappedContent = {
                AssignmentRules: {
                    $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
                    ...metadataParsed
                }
            };
    
            const builder = new xml2js.Builder({
                xmldec: { version: '1.0', encoding: 'UTF-8' }
            });
            const xml = builder.buildObject(wrappedContent);
    
            fs.writeFileSync(FILES_DIR.METADATA[getOrgIdentifier(connection).toUpperCase()].LEAD_ASSIGNMENT_XML_RULES_FILE, xml);
            spinnies.succeed(`${METADATA_TYPES.LEAD_ASSIGNMENT_RULES} ${getOrgIdentifier(connection)}`, { text: `Retrieved Lead Assignment Rules on ${getOrgIdentifier(connection)}` });
        } catch (err) {
            spinnies.fail(`${METADATA_TYPES.LEAD_ASSIGNMENT_RULES} ${getOrgIdentifier(connection)}`, { text: `Error retrieving Lead Assignment Rules on ${getOrgIdentifier(connection)}` });
            console.error('Error retrieving Lead Assignment Rules:', err);
            return { success: false, error: err };
        }
    });
}

const updateLeadAssignmentRules = async (filePath, connection) => {
    try {
        const output = fs.createWriteStream(FILES_DIR.METADATA.LEAD_ASSIGNMENT_FOLDER_ZIP);
        const archive = archiver('zip', { zlib: { level: 9 } });

        const leadAssignmentXml = await fs.promises.readFile(FILES_DIR.METADATA.LEAD_ASSIGNMENT_XML_RULES_FILE, 'utf8');
        const packageXml = await fs.promises.readFile(FILES_DIR.METADATA.LEAD_ASSIGNMENT_PACKAGE_XML_FILE, 'utf8');
        archive.pipe(output);

        const leadAssignmentRulesFolder = path.basename(path.dirname(FILES_DIR.METADATA.LEAD_ASSIGNMENT_XML_RULES_FILE));
        const leadAssignmentRulesFile = path.basename(FILES_DIR.METADATA.LEAD_ASSIGNMENT_XML_RULES_FILE);

        archive.append(leadAssignmentXml, { name:  path.join(leadAssignmentRulesFolder, leadAssignmentRulesFile) });
        archive.append(packageXml, { name: path.basename(FILES_DIR.METADATA.LEAD_ASSIGNMENT_PACKAGE_XML_FILE) });
        archive.finalize();

        console.log('Deploying zip file for Lead Assignment Rules...');

        const spinner = createSpinner('Deploying...').start();
        const deployRequest = await connection.metadata.deploy(archive, { singlePackage: true }).then(async (result) => {
            let status;
            do {
                await new Promise(r => setTimeout(r, 15000)); // espera 15s
                status = await connection.metadata.checkDeployStatus(result.id, true);
            } while (status.status !== 'Succeeded');
            spinner.stop();
        });

        return { success: true };
    } catch (err) {
        console.error('Error updating Lead Assignment Rules:', err);
        return { success: false, error: err };
    }
}

module.exports = { 
    retrieveLeadAssignmentRules,
    updateLeadAssignmentRules
 };