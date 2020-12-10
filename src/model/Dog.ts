import * as t from "io-ts";
import { DogBreed, dogBreedType } from "./DogBreed";

export interface Dog {
  id: string;
  name: string;
  breed: DogBreed;
}

export const dogType: t.Type<Dog> = t.type({
  id: t.string,
  name: t.string,
  breed: dogBreedType,
});
