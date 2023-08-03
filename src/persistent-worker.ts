import { TaskList } from 'graphile-worker';
import { WorkerEvent } from './events';
import { JobFlags, jobHasFlag } from './flags';
import { getJobResult } from './job';
import { numberOrDefault, PoolOrPoolFactory, stringOrNull } from './util';
import { GraphileQueueWorker } from './worker';

export interface PersistentWorkerConfig {
    /**
     * Defines where finished jobs shall be stored.
     * The worker will fail to start if the table does not exist,
     * the schema is not validated though.
     */
    target: {
        schema: string;
        table: string;
    }
}

/**
 * The persistent worker can be used to save finished jobs in the configured table.
 * The table must have the same structure as the `graphile_worker.jobs` table
 * in version https://github.com/graphile/worker/tree/v0.14.0
 *
 * It uses the `job:success` event to move successful
 * jobs to the configured history table.
 */
export class PersistentGraphileQueueWorker extends GraphileQueueWorker {

    private static SQL_STRING_QUOTE = '$safe_quote$';

    constructor(
        pool: PoolOrPoolFactory,
        taskList: TaskList,
        private readonly config: PersistentWorkerConfig
    ) {
        super(pool, taskList);
    }

    override async start(): Promise<void> {
        await super.start();
        const tableExists = await this.tableExists();
        if (!tableExists) {
            throw new Error(`The table "${this.config.target.schema}"."${this.config.target.table}" does not exist`);
        }
        this.setupEventListeners();
    }

    override async stop(): Promise<void> {
        await super.stop();
        if (this.events) {
            this.events.removeAllListeners(WorkerEvent.JOB_SUCCESS);
        }
    }

    private async tableExists(): Promise<boolean> {
        if (!this.pool) {
            return false;
        }
        const result = await this.pool.query<{
            exists: boolean;
        }>(`
            select exists(
                select 1
                from information_schema.tables
                where table_schema = $1
                and table_name = $2
            ) as "exists"
        `, [
            this.config.target.schema,
            this.config.target.table
        ]);
        return result.rows[0].exists;
    }

    private setupEventListeners(): void {
        if (this.pool && this.events) {
            this.events.on(WorkerEvent.JOB_SUCCESS, async ({ job }) => {
                if (jobHasFlag(job, JobFlags.DO_NOT_PERSIST)) {
                    return;
                }
                const result = getJobResult(job);
                await this.pool?.query(`
                    insert into "${this.config.target.schema}"."${this.config.target.table}"
                        (
                            "id",
                            "job_queue_id",
                            "task_id",
                            "payload",
                            "result",
                            "priority",
                            "run_at",
                            "attempts",
                            "max_attempts",
                            "last_error",
                            "created_at",
                            "updated_at",
                            "key",
                            "revision",
                            "flags"
                        )
                    values
                        (
                            ${job.id},
                            ${numberOrDefault(job.job_queue_id)},
                            ${numberOrDefault(job.task_id)},
                            ${stringOrNull(JSON.stringify(job.payload || {}), PersistentGraphileQueueWorker.SQL_STRING_QUOTE)},
                            ${stringOrNull(result ? JSON.stringify(result) : null, PersistentGraphileQueueWorker.SQL_STRING_QUOTE)},
                            ${numberOrDefault(job.priority)},
                            ${stringOrNull(job.run_at.toISOString())},
                            ${numberOrDefault(job.attempts)},
                            ${numberOrDefault(job.max_attempts)},
                            ${stringOrNull(job.last_error, PersistentGraphileQueueWorker.SQL_STRING_QUOTE)},
                            ${stringOrNull(job.created_at.toISOString())},
                            ${stringOrNull(job.updated_at.toISOString())},
                            ${stringOrNull(job.key)},
                            ${numberOrDefault(job.revision)},
                            ${stringOrNull(job.flags ? JSON.stringify(job.flags) : null)}
                        );
                `);
            });
        }
    }

}
