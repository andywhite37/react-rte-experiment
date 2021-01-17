import * as t from "io-ts";

export interface Breed {
  name: string;
  subBreeds: Array<string>
}

export const breedType: t.Type<Breed> = t.type({
  name: t.string,
  subBreeds: t.array(t.string)
});

