import * as t from "io-ts";
import {DogBreed, dogBreedType} from "./DogBreed";

export interface Breed {
  name: string;
  subBreeds: Array<string>
}


export const breedType: t.Type<Breed> = t.type({
  name: t.string,
  breed: 
});

