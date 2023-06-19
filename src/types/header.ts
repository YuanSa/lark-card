import { AvailableHeaderTemplates } from "../constants";
import { Text } from "./text";

export type HeaderTemplatesEnum = (typeof AvailableHeaderTemplates)[number];

export type HeaderConfig = {
  title: {
    tag: "plain_text";
  } & Text;
  template?: string;
};
