const EventEmitter = require('events');
const { loginAll } = require('@services/connectionService.js');
const { ENVIRONMENTS } = require('@enums/constants.js');

/**
 * Abstract base class for Refresh processes.
 * Implements the main run loop.
 * Extends EventEmitter to provide status updates.
 */
class AbstractRefresh extends EventEmitter {
    constructor() {
        super();
        if (new.target === AbstractRefresh) {
            throw new TypeError('Cannot construct Abstract instances directly');
        }
    }

    /**
     * @abstract
     * @returns {Array<import('./RefreshStep')>}
     */
    getSteps() {
        throw new Error("Method 'getSteps()' must be implemented.");
    }

    /**
     * Determines the target connections for the refresh steps.
     * Default implementation returns [TST, PRE] based on loginAll results.
     * @param {Object} connectionsMap - Map of environment to connection
     * @returns {Array<Object>} - Array of target connections
     */
    getTargets(connectionsMap) {
        return [connectionsMap[ENVIRONMENTS.TST], connectionsMap[ENVIRONMENTS.PRE]];
    }

    /**
     * Main execution method.
     */
    async run() {
        this.emit('log', 'Starting Refresh Process...');
        try {
            const connectionsMap = await loginAll();
            const targets = this.getTargets(connectionsMap);

            const steps = this.getSteps();
            this.emit('log', `Found ${steps.length} steps to execute.`);

            for (const step of steps) {
                if (step.enabled) {
                    this.emit('step-start', step.name);
                    this.emit('log', `\n--- Executing Step: ${step.name} ---`);

                    await step.run(targets, connectionsMap);

                    this.emit('log', `--- Completed Step: ${step.name} ---`);
                    this.emit('step-end', step.name);
                } else {
                    this.emit('step-skip', step.name);
                    this.emit('log', `\n--- Skipping Step: ${step.name} (Disabled) ---`);
                }
            }
            this.emit('log', '\nRefresh Process Completed Successfully.');
            this.emit('done');
        } catch (error) {
            this.emit('error', error);
            // Allow caller to handle exit or response
            throw error;
        }
    }

    /**
     * Executes a single step by its ID.
     * @param {string} stepId - The ID of the step to run
     * @param {Object} [options] - Optional overrides
     * @param {Object} [options.connection] - A jsforce connection to run the
     *   step against. When provided, `loginAll()` is skipped and the step runs
     *   against this single org (targets = [connection]); every environment in
     *   the connections map is aliased to it so steps that look up a specific
     *   environment still work.
     */
    async runStep(stepId, options = {}) {
        this.emit('log', `Request to run single step: ${stepId}`);
        try {
            const steps = this.getSteps();
            const step = steps.find((s) => s.id === stepId);

            if (!step) {
                throw new Error(`Step with ID '${stepId}' not found.`);
            }

            let connectionsMap;
            let targets;

            if (options.connection) {
                this.emit('log', 'Using the selected org session...');
                const conn = options.connection;
                targets = [conn];
                connectionsMap = Object.values(ENVIRONMENTS).reduce((map, env) => {
                    map[env] = conn;
                    return map;
                }, {});
            } else {
                this.emit('log', 'Authenticating...');
                connectionsMap = await loginAll();
                targets = this.getTargets(connectionsMap);
            }

            // Force enable the step for this specific execution request
            step.enabled = true;

            this.emit('step-start', step.name);
            this.emit('log', `\n--- Executing Step (Single): ${step.name} ---`);

            await step.run(targets, connectionsMap);

            this.emit('log', `--- Completed Step: ${step.name} ---`);
            this.emit('step-end', step.name);
            this.emit('done');
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}

module.exports = AbstractRefresh;
