/**
 * Attaches CLI console logging to a Refresh Process's events.
 * This adapter allows the Event-Driven process to output to the console
 * behaving just like a traditional CLI script.
 * @param {import('../classes/AbstractRefresh')} refreshProcess
 */
const attachCliLogger = (refreshProcess) => {
    refreshProcess.on('log', (message) => {
        console.log(message);
    });

    refreshProcess.on('error', (error) => {
        console.error('\n!!! Process Error !!!');
        console.error(error);
    });

    // Optional: Add specific handling for step-start/end if needed
    // refreshProcess.on('step-start', (name) => console.log(`> [Step] ${name}`));
};

module.exports = { attachCliLogger };
