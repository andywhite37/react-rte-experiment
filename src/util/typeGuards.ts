export const isNull = (x: unknown): x is null => x === null

export const isUndefined = (x: unknown): x is undefined => x === undefined

export const isNil = (x: unknown): x is undefined | null => isNull(x) || isUndefined(x)
