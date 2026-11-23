require('module-alias/register');
require('dotenv').config();
const PreRefresh = require('./classes/PreRefresh.js');
const { attachCliLogger } = require('./utils/cliLogger.js');

(async () => {
    try {
        const refreshProcess = new PreRefresh();
        attachCliLogger(refreshProcess);
        await refreshProcess.run();
    } catch (e) {
        console.error('An unexpected error occurred in PreRefresh:', e);
        process.exit(1);
    }
})();
