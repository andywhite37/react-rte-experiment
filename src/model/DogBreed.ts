import * as t from "io-ts";
export interface DogBreed {
  id: string;
  name: string;
}

export const dogBreedType: t.Type<DogBreed> = t.type({
  id: t.string,
  name: t.string,
});
