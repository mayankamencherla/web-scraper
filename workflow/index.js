const Parallel           = require('async-parallel');
const Configuration      = require('../configuration');

const config = new Configuration();

const concurrency = config.get('concurrency') || 1;

console.log(`Setting up request queue with concurrency of ${concurrency}`);

Parallel.setConcurrency(concurrency);

class Workflow {
    constructor() {
        this.tasks = [];
    }

    /**
     * Adds a parallel task to the workflow
     * @param input
     * @param callback
     * @param retries
     */
    addParallelTask(input, callback, retries) {
        var task = {
            input,
            callback,
            retries
        };

        this.tasks.push(task);
    }

    /**
     * Returns where there exist pending tasks
     * @return bool
     */
    pendingTasks() {
        return this.tasks.length > 0;
    }

    /**
     * Pops the front task and returns it
     * @return task
     */
    popFrontTask() {
        var task = this.tasks[0];

        this.tasks.splice(0, 1);

        return task;
    }

    /**
     * Runs a pending task
     * @param task
     * @return true
     */
    async runTask(task) {
       var elems = task.input;

       var numTry = task.retries;

       var method = task.callback;

       while (numTry > 0) {

            try {
                await Parallel.map(elems, (elem) => this.deps[method](elem));

                return true;
            } catch (e) {
                console.log(`Task failed`, e);
                // Use a retry
                numTry--;
            }
       }

       console.log(`Unable to run task`);

       return false;
    }

    /**
     * Recursively runs the set of pending tasks
     */
    async runTasks() {
        if (!this.pendingTasks()) return;

        var task = this.popFrontTask();

        await this.runTask(task);

        await this.runTasks();
    }

    /**
     * Sets the dependency object that is using this workflow
     * @param deps
     */
    setDependency(deps) {
        this.deps = deps;
    }
};

module.exports = Workflow;