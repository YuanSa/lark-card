import { LanguageCodes } from "./language";

export type TextContent = string;

export type I18nTextContent = Partial<Record<LanguageCodes, TextContent>>;

export interface Text {
  content?: TextContent;
  i18n?: I18nTextContent;
  [k: string]: unknown;
}
