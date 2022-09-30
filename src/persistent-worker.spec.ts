import { Pool } from 'pg';
import { PersistentGraphileQueueWorker } from './persistent-worker';
import { isPool } from './util';

class TestWorker extends PersistentGraphileQueueWorker {
    constructor() {
        super(
            async () => new Pool(),
            {
                test: () => {}
            },
            {
                target: {
                    schema: 'test',
                    table: 'test'
                }
            }
        );
    }
}

describe('PersistentWorker', () => {
    describe('Constructor', () => {
        it('should construct', async () => {
            const worker = new TestWorker();
            expect(worker instanceof PersistentGraphileQueueWorker).toBe(true);
            expect((worker as any).config).toStrictEqual({
                target: {
                    schema: 'test',
                    table: 'test'
                }
            });
            expect(typeof (worker as any).setupEventListeners).toBe('function');
            expect(typeof (worker as any).start).toBe('function');
            // not started yet
            expect(typeof (worker as any).runner).toBe('undefined');
            expect(isPool((worker as any).pool)).toBe(false);
        });
    });
});
