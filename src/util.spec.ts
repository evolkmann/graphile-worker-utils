import { Client, Pool } from 'pg';
import { isPool, numberOrDefault, stringOrNull } from './util';

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

    describe('isPool', () => {
        it('should detect valid pool', () => {
            const pool = new Pool();
            expect(isPool(pool)).toBe(true);
        });
        it('should detect invalid pool', () => {
            const client = new Client()
            expect(isPool()).toBe(false);
            expect(isPool(0)).toBe(false);
            expect(isPool('pool')).toBe(false);
            expect(isPool(null)).toBe(false);
            expect(isPool(undefined)).toBe(false);
            expect(isPool(client)).toBe(false);
        });
    });
});
