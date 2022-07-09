export const stringOrNull = (value?: string | null) => typeof value === 'string' ? `'${value}'` : 'null';
export const numberOrDefault = (value?: number | null) => typeof value === 'number' ? `${value}` : `default`;
