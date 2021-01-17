import * as t from 'io-ts'
import * as E from 'fp-ts/lib/Either'
import {pipe} from 'fp-ts/lib/function'

export type DecodeError = {tag: 'decodeError', errors: t.Errors}

export const decodeError = (errors: t.Errors): DecodeError => ({tag: 'decodeError', errors})

export const decodeWithType = <A>(codec: t.Type<A>) => (value: unknown): E.Either<DecodeError, A> => pipe(
  codec.decode(value),
  E.mapLeft(decodeError)
)
