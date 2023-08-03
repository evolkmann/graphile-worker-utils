import { Job } from 'graphile-worker';
import { jobHasFlag } from './flags';

describe('flags', () => {
    it('should detect flags', () => {
        const jobWithoutFlags: Pick<Job, 'flags'> = {
            flags: null
        };
        const jobWithFlags: Pick<Job, 'flags'> = {
            flags: {
                'test': true
            }
        };

        expect(jobHasFlag(jobWithoutFlags as Job, 'test')).toBe(false);
        expect(jobHasFlag(jobWithFlags as Job, 'test')).toBe(true);
        expect(jobHasFlag(jobWithFlags as Job, 'another')).toBe(false);
    })
})
