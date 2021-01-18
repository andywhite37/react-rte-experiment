export type Nullable<A> = A | null;

export type Undefinedable<A> = A | undefined;

export type Nil = null | undefined;

export type Nilable<A> = A | Nil;

export const isNull = (x: unknown): x is null => x === null;

export const isUndefined = (x: unknown): x is undefined => x === undefined;

export const isNil = (x: unknown): x is Nil => isNull(x) || isUndefined(x);

export const isNotUndefined = <A>(
  x: Undefinedable<A>
): x is Exclude<A, undefined> => !isUndefined(x);

export const isNotNull = <A>(x: Nullable<A>): x is Exclude<A, null> =>
  !isNull(x);

export const isNotNil = <A>(x: Nilable<A>): x is Exclude<A, Nil> => !isNil(x);
