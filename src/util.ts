import { Client, native, Pool } from 'pg';

export const stringOrNull = (value?: string | null, quote = `'`) => typeof value === 'string' ? `${quote}${value}${quote}` : 'null';
export const numberOrDefault = (value?: number | null) => typeof value === 'number' ? `${value}` : `default`;

/**
 * Credit:
 * https://github.com/jawj/zapatos/blob/61f62ce387aa93505353b64d0ce5509ac6da11f9/src/db/transaction.ts#L53
 */
export function isPool(queryable?: unknown): boolean {
    if (queryable instanceof Pool) return true;
    if (queryable instanceof Client) return false;
    if (native !== null && queryable instanceof native.Pool) return true;
    if (native !== null && queryable instanceof native.Client) return false;

    // for pg < 8, and sometimes in 8.x for reasons that aren't clear, all the
    // instanceof checks fail: then we resort to testing for the private variable
    // `_connected`, which is defined (as a boolean) on clients (pure JS and
    // native) but not on pools
    return typeof queryable === 'object'
        && queryable !== null
        && (queryable as any)?._connected === undefined;
}

export type PoolOrPoolFactory = Pool | (() => Pool) | (() => Promise<Pool>);
