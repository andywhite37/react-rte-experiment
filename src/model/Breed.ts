import * as t from "io-ts";

export interface Breed {
  name: string;
  subBreeds: Array<string>;
}

export const breedCodec: t.Type<Breed> = t.type({
  name: t.string,
  subBreeds: t.array(t.string),
});
