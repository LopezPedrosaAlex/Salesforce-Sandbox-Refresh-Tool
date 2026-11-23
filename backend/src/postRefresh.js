require('module-alias/register');
require('dotenv').config();
const PostRefresh = require('./classes/PostRefresh.js');
const { attachCliLogger } = require('./utils/cliLogger.js');

(async () => {
    try {
        const refreshProcess = new PostRefresh();
        attachCliLogger(refreshProcess);
        await refreshProcess.run();
    } catch (e) {
        console.error('An unexpected error occurred in PostRefresh:', e);
        process.exit(1);
    }
})();
