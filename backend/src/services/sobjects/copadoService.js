const { ENVIRONMENTS } = require('@enums/constants.js');
const { spinnerInitialization } = require('@utils/metadataUtils.js');
const updateSandboxEnvironment = async (connections) => {
    const spinnies = spinnerInitialization(`Update Sandbox Environment`, []);
    try {
        const prodConnection = connections.find((conn) => conn.name === ENVIRONMENTS.PROD);
        const sandboxConnections = connections.filter((conn) => conn.name !== ENVIRONMENTS.PROD);

        // Esperar todos los queries de sandbox
        const sourceConnections = await Promise.all(
            sandboxConnections.map(async (sandboxConn) => {
                const organizaton = await sandboxConn.query('SELECT Id FROM Organization');
                return {
                    name: sandboxConn.name,
                    OrgId: organizaton.records[0].Id
                };
            })
        );

        for (const sourceEnv of sourceConnections) {
            spinnies.update(`Update Sandbox Environment`, {
                text: `Updating Copado Environment for ${sourceEnv.name}...`
            });
            const targetCopadoEnvironment = await prodConnection.query(
                "SELECT Id FROM copado__Environment__c WHERE Name = '" + sourceEnv.name + "'"
            );

            await prodConnection.sobject('copado__Environment__c').update({
                Id: targetCopadoEnvironment.records[0].Id,
                copado__Org_Id__c: sourceEnv.OrgId
            });
        }
    } catch (error) {
        spinnies.fail(`Update Sandbox Environment`, { text: `Error updating Copado Environments` });
        console.error('Error updating sandbox environment:', error);
        throw error;
    }
    spinnies.succeed(`Update Sandbox Environment`, { text: `Updated Copado Environments` });
};

module.exports = { updateSandboxEnvironment };
