import { Breed } from "../model/Breed";
import { HttpJsonError } from "../service/http/HttpError";
import { pipe, RD } from "../util/fpts";

const getErrorMessage = (e: HttpJsonError): string => {
  switch (e.tag) {
    case "httpRequestError":
      return "Failed to connect to server";
    case "httpContentTypeError":
      return "Unexpected response from server";
    case "httpResponseStatusError":
      return `Request failed with status: ${e.status}`;
    case "decodeError":
      return `Failed to decode response JSON`;
  }
};

export const Breeds = ({
  breedsRD,
}: {
  breedsRD: RD.RemoteData<HttpJsonError, Array<Breed>>;
}) => {
  return (
    <>
      <h1>Breeds</h1>
      {pipe(
        breedsRD,
        RD.fold(
          () => <h1>Welcome</h1>,
          () => <h1>Loading...</h1>,
          (error) => <h1>{getErrorMessage(error)}</h1>,
          (breeds) => (
            <ul>
              {breeds.map((breed) => (
                <li key={breed.name}>
                  {breed.name}
                  <ul>
                    {breed.subBreeds.map((subBreed) => (
                      <li key={subBreed}>{subBreed}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )
        )
      )}
    </>
  );
};
