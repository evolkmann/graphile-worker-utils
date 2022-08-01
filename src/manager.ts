import { Job, TaskSpec, WorkerUtils } from 'graphile-worker';

export type TaskOptions = Omit<TaskSpec, 'queueName'>;

export abstract class GraphileQueueManager {

    protected constructor(
        private readonly workerUtils: WorkerUtils,
        private readonly queueName?: string
    ) {}

    protected async enqueue<T = unknown>(jobType: string, payload?: T, options: TaskOptions = {}): Promise<Job> {
        return this.workerUtils.addJob(jobType, payload, {
            ...options,
            queueName: this.queueName
        });
    }

}
