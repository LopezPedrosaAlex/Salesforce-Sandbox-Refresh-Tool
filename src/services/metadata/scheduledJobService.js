const { percentCalc, batchIt, getOrgIdentifier, spinnerInitialization } = require('@utils/metadataUtils.js');
const { SCHEDULED_JOBS_QUERY } = require('@config/queries.js');

const deleteScheduledJobs = async (connections) => {
    const spinnies = spinnerInitialization(`Delete Scheduled Jobs`, connections);
        connections.forEach(async (connection) => {
            try {
                const jobs = await connection.query(SCHEDULED_JOBS_QUERY);
                let i = 0;
                for(const batch of batchIt(150, jobs.records)) {
                    const apexCode = batch.map(job => {
                        return `System.abortJob('${job.Id}');`;
                    }).join('\n');
                    const executeJobs = await connection.tooling.executeAnonymous(apexCode);
                    i += batch.length;
                    spinnies.update(`Delete Scheduled Jobs ${getOrgIdentifier(connection)}`, { text: `Reading scheduled jobs... ${percentCalc(i, jobs.records.length)}%` });
                }
            } catch (error) {
                spinnies.fail(`Delete Scheduled Jobs ${getOrgIdentifier(connection)}`, { text: `Error deleting scheduled jobs` });
            }
            spinnies.succeed(`Delete Scheduled Jobs ${getOrgIdentifier(connection)}`, { text: `Deleted scheduled jobs` });
        });
    
}

module.exports = { deleteScheduledJobs };