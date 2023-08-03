import { run, Runner, TaskList, WorkerEvents } from 'graphile-worker';
import { Pool } from 'pg';
import { isPool, PoolOrPoolFactory } from './util';

export class GraphileQueueWorker {

    private runner?: Runner;
    protected pool?: Pool;
    protected events?: WorkerEvents;

    constructor(
        private readonly _pool: PoolOrPoolFactory,
        private readonly taskList: TaskList
    ) {}

    async start(): Promise<void> {
        await this.setupPool();
        if (!this.pool || !isPool(this.pool)) {
            throw new Error(`The pool or poolFactory function your provided in the constructor did not return a pool instance: ${this.pool} (type ${typeof this.pool})`);
        }

        this.runner = await run({
            pgPool: this.pool,
            taskList: this.taskList
        });
        this.events = this.runner.events;
    }

    async stop(): Promise<void> {
        await this.runner?.stop();
    }

    private async setupPool(): Promise<void> {
        if (typeof this._pool === 'function') {
            this.pool = await this._pool();
        } else {
            this.pool = this._pool;
        }
    }

}
