import { Job, WorkerUtils } from 'graphile-worker';
import { GraphileQueueManager } from '../src';

/**
 * Example for a queue manager class.
 * The intention is that you can add specialized methods to create
 * the different job types with proper type safety for the payloads.
 */
export class DemoManager extends GraphileQueueManager {

    constructor(
        workerUtils: WorkerUtils
    ) {
        super(
            workerUtils,
            'demo'
        );
    }

    scheduleDemoJob(): Promise<Job> {
        return this.enqueue('demo');
    }

    scheduleDemoJobWithPayload(payload: {
        prop: string;
    }): Promise<Job> {
        return this.enqueue('demo-with-payload', payload);
    }

}
