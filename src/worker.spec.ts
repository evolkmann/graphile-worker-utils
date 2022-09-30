import { Pool } from 'pg';
import { isPool } from './util';
import { GraphileQueueWorker } from './worker';

class TestWorker extends GraphileQueueWorker {
    constructor() {
        super(
            async () => new Pool(),
            {
                test: () => {}
            }
        );
    }
}

describe('Worker', () => {
    describe('Constructor', () => {
        it('should construct', async () => {
            const worker = new TestWorker();
            expect(worker instanceof GraphileQueueWorker).toBe(true);
            expect(typeof (worker as any).start).toBe('function');
            // not started yet
            expect(typeof (worker as any).runner).toBe('undefined');
            expect(isPool((worker as any).pool)).toBe(false);
        });
    });
});
