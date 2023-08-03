import { Job, TaskSpec, WorkerUtils } from 'graphile-worker';

export type TaskOptions = Omit<TaskSpec, 'queueName'>;

/**
 * A wrapper class around `WorkerUtils` with the intention
 * to provide a more convenient and typed API for scheduling jobs.
 *
 * Extend this class and add specialized `enqueue` methods, then
 * use that class to schedule jobs.
 *
 * During shutdown of your programm, make sure to call `stop()`.
 */
export abstract class GraphileQueueManager {

    /**
     * @param workerUtils
     *  An instance of `WorkerUtils` from `graphile-worker`.
     * @param queueName
     *  All jobs will be added to this queue.
     *  If not specified, no queueing will be used for the scheduled jobs.
     */
    protected constructor(
        private readonly workerUtils: WorkerUtils,
        private readonly queueName?: string
    ) {}

    protected async enqueue<T = unknown>(identifier: string, payload?: T, options: TaskOptions = {}): Promise<Job> {
        return this.workerUtils.addJob(identifier, payload, {
            ...options,
            queueName: this.queueName
        });
    }

    async stop(): Promise<void> {
        await this.workerUtils.release();
    }

}
