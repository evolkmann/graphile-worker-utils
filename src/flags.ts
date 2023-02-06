import { Job } from 'graphile-worker';

export enum JobFlags {
    /**
     * If this flag is present on a job,
     * it will not be processed by `PersistentGraphileQueueWorker`.
     */
    DO_NOT_PERSIST = `graphile_worker_utils.do_not_persist`
}

export function jobHasFlag(job: Job, flag: string): boolean {
    return (job.flags || {})[flag] === true;
}
