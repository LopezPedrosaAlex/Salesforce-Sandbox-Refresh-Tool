const { percentCalc, batchIt, getOrgIdentifier, spinnerInitialization } = require('@utils/metadataUtils.js');
const { SCHEDULED_JOBS_QUERY } = require('@config/queries.js');
const { BATCH_SIZES } = require('@enums/constants.js');

const deleteScheduledJobs = async (connections) => {
    const spinnies = spinnerInitialization(`Delete Scheduled Jobs`, connections);
    for (const connection of connections) {
        try {
            const jobs = await connection.query(SCHEDULED_JOBS_QUERY);
            if (!jobs || !jobs.records || jobs.records.length === 0) {
                spinnies.succeed(`Delete Scheduled Jobs ${getOrgIdentifier(connection)}`, {
                    text: `No scheduled jobs to delete on ${getOrgIdentifier(connection)}`
                });
                continue;
            }
            let i = 0;
            for (const batch of batchIt(BATCH_SIZES.SCHEDULED_JOBS, jobs.records)) {
                const apexCode = batch
                    .map((job) => {
                        return `System.abortJob('${job.Id}');`;
                    })
                    .join('\n');
                const executeJobs = await connection.tooling.executeAnonymous(apexCode);
                i += batch.length;
                spinnies.update(`Delete Scheduled Jobs ${getOrgIdentifier(connection)}`, {
                    text: `Deleting scheduled jobs... ${percentCalc(i, jobs.records.length)}%`
                });
            }
        } catch (error) {
            spinnies.fail(`Delete Scheduled Jobs ${getOrgIdentifier(connection)}`, {
                text: `Error deleting scheduled jobs`
            });
            console.error(error);
        }
        spinnies.succeed(`Delete Scheduled Jobs ${getOrgIdentifier(connection)}`, {
            text: `Deleted scheduled jobs on ${getOrgIdentifier(connection)}`
        });
    }
};

module.exports = { deleteScheduledJobs };
