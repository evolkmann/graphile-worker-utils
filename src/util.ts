export const stringOrNull = (value?: string | null, quote = `'`) => typeof value === 'string' ? `${quote}${value}${quote}` : 'null';
export const numberOrDefault = (value?: number | null) => typeof value === 'number' ? `${value}` : `default`;
