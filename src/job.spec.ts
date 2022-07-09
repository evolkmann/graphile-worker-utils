import { AddJobFunction, Job, JobHelpers, Logger, WithPgClient } from 'graphile-worker';
import { appendJobResult, assertTaskIdentifier, getJobResult, setJobResult, validateTask } from './job';

describe('job', () => {
    let helpers: JobHelpers;
    beforeEach(() => {
        helpers = {
            job: {
                task_identifier: 'task_identifier',
                payload: {
                    key: 'value'
                }
            } as Job,
            logger: null as unknown as Logger,
            addJob: null as unknown as AddJobFunction,
            withPgClient: null as unknown as WithPgClient,
            query: (() => {}) as any
        }
    });

    describe('setJobResult', () => {
        it('should set result data', () => {
            expect(getJobResult(helpers.job)).toBeUndefined();
            setJobResult(helpers, {
                success: true
            });
            expect(getJobResult(helpers.job)).toEqual({
                success: true
            });
        })
    });

    describe('appendJobResult', () => {
        it('should handle empty results object', () => {
            expect(getJobResult(helpers.job)).toBeUndefined();
            appendJobResult(helpers, {
                success: true
            });
            expect(getJobResult(helpers.job)).toEqual({
                success: true
            });
        })
        it('should handle append to existing results', () => {
            expect(getJobResult(helpers.job)).toBeUndefined();
            appendJobResult(helpers, {
                success: true
            });
            expect(getJobResult(helpers.job)).toEqual({
                success: true
            });
            appendJobResult(helpers, {
                second: true
            });
            expect(getJobResult(helpers.job)).toEqual({
                success: true,
                second: true
            });
        })
    });

    describe('assertTaskIdentifier', () => {
        it('should not throw for valid identifier', () => {
            const run = () => {
                assertTaskIdentifier(helpers, 'task_identifier');
            };
            expect(run).not.toThrow()
        })
        it('should throw for invalid identifier', () => {
            const run = () => {
                assertTaskIdentifier(helpers, 'error');
            };
            expect(run).toThrow()
        })
    });

    describe('validateTask', () => {
        it('should handle undefined payload', () => {
            helpers.job.payload = undefined;
            const payload = validateTask<any>(helpers, 'task_identifier');
            expect(payload).toBeUndefined()
        })
        it('should not throw for valid identifier and return payload', () => {
            const run = () => {
                const payload = validateTask<any>(helpers, 'task_identifier');
                expect(payload.key).toEqual('value');
            };
            expect(run).not.toThrow()
        })
        it('should throw for invalid identifier', () => {
            const run = () => {
                const payload = validateTask<any>(helpers, 'error');
                expect(payload.key).toEqual('value');
            };
            expect(run).toThrow()
        })
    });
});
