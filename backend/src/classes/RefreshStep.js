/**
 * Wrapper class for individual refresh tasks.
 */
class RefreshStep {
    /**
     * @param {string} id - Unique identifier for the step (for API)
     * @param {string} name - Name of the step for logging
     * @param {Function} executeFn - Async function to execute
     * @param {boolean} [enabled=true] - Whether the step is enabled
     */
    constructor(id, name, executeFn, enabled = true) {
        this.id = id;
        this.name = name;
        this.executeFn = executeFn;
        this.enabled = enabled;
    }

    /**
     * Executes the wrapped function with the provided targets.
     * @param {Array<Object>} targets - Array of Salesforce connections
     * @param {Object} connectionsMap - Map of all connections
     */
    async run(targets, connectionsMap) {
        if (this.enabled) {
            await this.executeFn(targets, connectionsMap);
        }
    }
}

module.exports = RefreshStep;
