import { numberOrDefault, stringOrNull } from './util';

describe('util', () => {
    describe('stringOrNull', () => {
        it('should handle valid strings', () => {
            expect(stringOrNull('str')).toEqual(`'str'`);
        });
        it('should use custom quote chars', () => {
            expect(stringOrNull('str', '$graphile$')).toEqual(`$graphile$str$graphile$`);
        });
        it('should handle nullish values', () => {
            expect(stringOrNull(null)).toEqual(`null`);
            expect(stringOrNull(undefined)).toEqual(`null`);
            expect(stringOrNull(null, '$graphile$')).toEqual(`null`);
            expect(stringOrNull(undefined, '$graphile$')).toEqual(`null`);
        });
    });

    describe('numberOrDefault', () => {
        it('should handle valid numbers', () => {
            expect(numberOrDefault(-1)).toEqual(`-1`);
            expect(numberOrDefault(0)).toEqual(`0`);
            expect(numberOrDefault(1)).toEqual(`1`);
            expect(numberOrDefault(0.5)).toEqual(`0.5`);
        });
        it('should handle nullish values', () => {
            expect(numberOrDefault(null)).toEqual(`default`);
            expect(numberOrDefault(undefined)).toEqual(`default`);
        });
    });
});
