import type { Job, JobHelpers } from 'graphile-worker';

const JOB_RESULT_KEY = '__job_result';

/**
 * Stores a result object on the job. The result will be available throughout the lifecycle
 * of the job, for instance it can be accessed during the `job:success` event.
 *
 * @param helpers the job helpers that is available during job execution
 * @param result must be a JSON-stringify-able object, will be saved as `jsonb`
 */
export function setJobResult<T>(helpers: JobHelpers, result: T): void {
    appendJobResult(helpers, result);
}

/**
 * Adds the result object to the job. If a given key already exists on the job's result
 * object, it will be overwritten. If the job has no result object yet, it will be created.
 *
 * @param helpers the job helpers that is available during job execution
 * @param partialResult must be a JSON-stringifyable object, will be saved as `jsonb`
 */
export function appendJobResult<T>(helpers: JobHelpers, partialResult: T): void {
    // @ts-ignore
    helpers.job[JOB_RESULT_KEY] = {
        ...(getJobResult(helpers.job) || {}),
        ...partialResult
    };
}

/**
 * Access the result object created with `setJobResult` or `appendJobResult`.
 *
 * @param job a job instance
 */
export function getJobResult(job: Job): object | undefined {
    // @ts-ignore
    return job[JOB_RESULT_KEY];
}

export function assertTaskIdentifier(helpers: JobHelpers, identifier: string): void {
    if (helpers.job.task_identifier !== identifier) {
        throw new Error(`task_identifier "${helpers.job.task_identifier}" does not match expected value "${identifier}"`);
    }
}
