import * as t from "io-ts";

export type Image = {
  url: string;
};

export const imageCodec: t.Type<Image> = t.type({
  url: t.string,
});
