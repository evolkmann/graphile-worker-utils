import 'dotenv/config';
import { makeWorkerUtils } from 'graphile-worker';
import { Pool } from 'pg';
import { PersistentGraphileQueueWorker, PersistentWorkerConfig } from '../src';
import { DemoManager } from './manager';

async function createFinishedJobsTable(pool: Pool, config: PersistentWorkerConfig): Promise<void> {
    await pool.query(`
        drop table if exists "${config.target.schema}".${config.target.table};
        create table "${config.target.schema}".${config.target.table} (
           id int primary key,
           job_queue_id int,
           task_id int not null,
           payload jsonb not null default '{}'::jsonb,
           result jsonb,
           priority int not null default 0,
           run_at timestamptz not null default now(),
           attempts int not null default 0,
           max_attempts int not null default 25,
           last_error text,
           created_at timestamptz not null default now(),
           updated_at timestamptz not null default now(),
           "key" text,
           revision int not null default 0,
           flags jsonb
        );
    `);
}

async function main() {
    const pgPool = new Pool({
        connectionString: process.env.DATABASE_URL
    });
    const workerUtils = await makeWorkerUtils({ pgPool });
    const config: PersistentWorkerConfig = {
        target: {
            schema: 'graphile_worker',
            table: 'finished_job'
        }
    };
    const worker = new PersistentGraphileQueueWorker(
        pgPool,
        {
            test: async (payload, helpers) => {},
            demo: async (payload, helpers) => {},
            'demo-with-payload': async (payload, helpers) => {}
        },
        config
    );
    const manager = new DemoManager(workerUtils);

    workerUtils.logger.info(`Created Worker`);

    const targetTablesExists = await worker.targetTableExists();
    if (!targetTablesExists) {
        workerUtils.logger.warn(`Creating target table...`);
        await createFinishedJobsTable(pgPool, config);
    } else {
        workerUtils.logger.info(`Target table exists. Worker can be started`);
    }

    workerUtils.logger.info(`Starting worker in 3sec for 3sec...`);
    await wait(3000);
    await worker.start();
    workerUtils.logger.info(`Started Worker`);

    workerUtils.logger.info(`Adding five tasks that should be processed immediately...`);
    await workerUtils.addJob('test');
    await workerUtils.addJob('test');
    await workerUtils.addJob('test');
    await workerUtils.addJob('test');
    await workerUtils.addJob('test');

    await wait(3000);
    workerUtils.logger.info(`Stopping worker...`);
    await worker.stop();
    workerUtils.logger.info(`Stopped worker`);

    await wait(1000);

    workerUtils.logger.info(`Adding five more tasks`);
    workerUtils.logger.info(`They will not be processed until the worker is started again...`);
    await manager.scheduleDemoJob();
    await manager.scheduleDemoJob();
    await manager.scheduleDemoJobWithPayload({ prop: 'a' });
    await manager.scheduleDemoJobWithPayload({ prop: 'b' });
    await manager.scheduleDemoJobWithPayload({ prop: 'c' });

    workerUtils.logger.info(`Starting worker again in 3sec for 3sec...`);
    await wait(3000);
    await worker.start();
    await wait(3000);
    workerUtils.logger.info(`Stopping worker and disconnecting...`);
    workerUtils.logger.info(`Check the ${config.target.schema}.${config.target.table} table to see if the jobs were processed`);
    await manager.stop();
    await worker.stop();
    await workerUtils.release();
    await pgPool.end();
}

async function wait(millis: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, millis);
    });
}

main();
