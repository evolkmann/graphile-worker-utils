import { run, Runner, TaskList, WorkerEvents } from 'graphile-worker';
import { Pool } from 'pg';

export abstract class GraphileQueueWorker {

    private runner?: Runner;
    protected pool?: Pool;
    protected events?: WorkerEvents;

    protected constructor(
        private readonly poolFactory: () => Promise<Pool>,
        private readonly taskList: TaskList
    ) {}

    async start(): Promise<void> {
        this.pool = await this.poolFactory();
        if (!this.pool || !(this.pool instanceof Pool)) {
            throw new Error(`The poolFactory function your provided in the constructor did not return a pool instance`)
        }

        this.runner = await run({
            pgPool: this.pool,
            taskList: this.taskList
        });
        this.events = this.runner.events;
    }

}
