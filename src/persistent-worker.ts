import { TaskList } from 'graphile-worker';
import { Pool } from 'pg';
import { getJobResult } from './job';
import { numberOrDefault, stringOrNull } from './util';
import { GraphileQueueWorker } from './worker';

export interface PersistentWorkerConfig {
    /**
     * Defines where finished jobs shall be stored
     */
    target: {
        schema: string;
        table: string;
    }
}

/**
 * The persistent worker can be used to save finished jobs in the configured table.
 * The table must have the same structure as the `graphile_worker.jobs` table
 * in version https://github.com/graphile/worker/tree/v0.13.0
 *
 * It uses the `job:success` event to move successful
 * jobs to the configured history table.
 */
export abstract class PersistentGraphileQueueWorker extends GraphileQueueWorker {

    protected constructor(
        poolFactory: () => Promise<Pool>,
        taskList: TaskList,
        private readonly config: PersistentWorkerConfig
    ) {
        super(poolFactory, taskList);
    }

    override async start(): Promise<void> {
        await super.start();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (this.pool && this.events) {
            this.events.on('job:success', async ({ job }) => {
                const result = getJobResult(job);
                await this.pool!.query(`
                    insert into "${this.config.target.schema}"."${this.config.target.table}"
                        (
                            "id",
                            "queue_name",
                            "task_identifier",
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
                            ${stringOrNull(job.queue_name)},
                            ${stringOrNull(job.task_identifier)},
                            ${stringOrNull(JSON.stringify(job.payload || {}))}::jsonb,
                            ${stringOrNull(result ? JSON.stringify(result) : null)}::jsonb,
                            ${numberOrDefault(job.priority)},
                            ${stringOrNull(job.run_at.toISOString())},
                            ${numberOrDefault(job.attempts)},
                            ${numberOrDefault(job.max_attempts)},
                            ${stringOrNull(job.last_error)},
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
