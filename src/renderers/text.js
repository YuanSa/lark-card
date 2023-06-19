/**
 * @param {import('../types').Text} config
 * @param {import('../types').Env} env
 */
export function renderLarkCardText({ content, i18n }, { language }) {
  return i18n?.[language] || content || "";
}
