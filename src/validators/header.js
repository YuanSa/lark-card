import { AvailableHeaderTemplates } from "../constants/index.js";

export function validateLarkCardHeaderConfig(larkCardHeaderRenderConfig) {
  if (!larkCardHeaderRenderConfig) {
    return;
  }

  const { title, template = "default" } = larkCardHeaderRenderConfig;

  if (!title) {
    throw new Error("header.title is required");
  }

  if (template) {
    if (!AvailableHeaderTemplates.includes(template)) {
      throw new Error(
        `header.title.template should be one of ${AvailableHeaderTemplates.join(
          ", "
        )}, but got ${template}`
      );
    }
  }

  const { tag, content, i18n } = title;

  if (!tag) {
    throw new Error("header.title.tag is required");
  }

  if (tag !== "plain_text") {
    throw new Error("header.title.tag must be plain_text");
  }

  if (!content && !i18n) {
    throw new Error("header.title.content or header.title.i18n is required");
  }
}
