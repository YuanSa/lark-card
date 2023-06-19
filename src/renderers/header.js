import { renderLarkCardText } from "./text.js";

/**
 * @param {import('../types').HeaderConfig} headerConfig
 * @param {import('../types').Env} env 
 * @todo text clamp overflow
 */
export function renderLarkCardHeader(headerConfig, env) {
  if (!headerConfig) {
    return;
  }

  const { template, title } = headerConfig;

  const headerElement = document.createElement("div");
  headerElement.setAttribute("class", `lark-card-header ${template}`);
  headerElement.innerHTML = renderLarkCardText(title, env);
  return headerElement;
}
