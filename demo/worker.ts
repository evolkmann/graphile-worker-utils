import { Pool } from 'pg';
import { PersistentGraphileQueueWorker, PersistentWorkerConfig } from '../src';

export class DemoWorker extends PersistentGraphileQueueWorker {

    constructor(
        pool: Pool,
        config: PersistentWorkerConfig
    ) {
        super(
            pool,
            {
                test: async (payload, helpers) => {},
                demo: async (payload, helpers) => {},
                'demo-with-payload': async (payload, helpers) => {
                    helpers.logger.info(JSON.stringify(payload));
                }
            },
            config
        );
    }

}
