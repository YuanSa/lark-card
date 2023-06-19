import * as validate from "./validators/index.js";
import * as render from "./renderers/index.js";

const larkCardStyle = `
.lark-card {
  background: #fff;
  border: 1px solid #dee0e3;
  border-radius: 10px;
  overflow: hidden;
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
  width: 100%;
}
.lark-card-header.blue {
  --text-color: #245bdb;
  --background-color: #e1eaff;
}
.lark-card-header {
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  background-color: var(--background-color);
  padding: 12px;
  color: var(--text-color);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  background-size: 605px 140px;
  overflow: hidden;
}
.lark-card-elements {
    margin-top: 12px;
    padding: 0 12px 12px;
    position: relative;
    -webkit-user-select: none;
    user-select: none;
}
.lark-card-element {
    margin-top: 12px;
}
.lark-card-element.img {
    width: 100%;
    height: auto;
    position: relative;
}
.lark-card-element.img.compact {
    max-width: 278px;
}
.lark-card-element.note {
    display: flex;
    flex-wrap: wrap;
}
.lark-card-element.note .lark-card-embedded.img {
    width: 16px;
    height: 16px;
    margin-right: 4px;
}
.lark-card-element.note .lark-card-embedded.text {
    color: rgb(100, 106, 115);
    font-size: 12px;
}
`;

export class LarkCard extends HTMLElement {
  static init() {
    customElements.define("lark-card", this);
  }

  static get observedAttributes() {
    return ["json", "locale", "validate"];
  }

  validateLevel = "warning";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.validateLevel = this.getAttribute("validate") || "warning";
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "json") {
      const newComponent = this.render(newValue, {});
      this.shadowRoot.replaceChildren(newComponent);
    }
  }

  /**
   * Render lark card
   *
   * @todo add config validate
   * @param {string} json
   * @param {import('./types').Env} env
   * @see https://open.feishu.cn/document/common-capabilities/message-card/message-cards-content/card-structure/card-content
   */
  render(json, env) {
    const cardConfig = JSON.parse(json);
    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "lark-card");
    const { config, elements, header } = cardConfig;

    const cardStyle = document.createElement("style");
    cardStyle.innerHTML = larkCardStyle;
    wrapper.appendChild(cardStyle);

    const renderedHeader = render.header(header, env);
    if (renderedHeader) {
      wrapper.appendChild(renderedHeader);
    }

    const renderedElements = this.renderElements(elements);
    wrapper.appendChild(renderedElements);

    return wrapper;
  }

  /**
   * @todo add element fields support
   */
  renderElements(elements) {
    const elementsWrapper = document.createElement("div");
    elementsWrapper.setAttribute("class", "lark-card-elements");
    elements.forEach((element) => {
      if (!this.validate(element, "element is required")) {
        return;
      }
      const { tag, text, fields, extra } = element;
      if (
        !this.validates([
          [tag, "element.tag is required"],
          [
            this.allowedElementTag.includes(tag),
            `element.tag is not allowed to be ${tag}, allowed values are ${this.allowedElementTag.join(
              ", "
            )})}`,
          ],
          // [text || fields, 'element.text or element.fields is required'], // TODO
        ])
      ) {
        return;
      }
      switch (tag) {
        case "div":
          const div = this.renderDiv(element);
          elementsWrapper.appendChild(div);
          break;
        case "hr":
          const hr = this.renderHr(element);
          elementsWrapper.appendChild(hr);
          break;
        case "img":
          const img = this.renderImg(element);
          elementsWrapper.appendChild(img);
          break;
        case "note":
          const note = this.renderNote(element);
          elementsWrapper.appendChild(note);
          break;
        case "column_set":
          const columnSet = this.renderColumnSet(element);
          elementsWrapper.appendChild(columnSet);
          break;
        case "actions":
        case "markdown":
          console.warn(`element.tag ${tag} is not implemented yet`);
          break;
        default:
          throw new Error(
            `element.tag ${tag} is not allowed, allowed values are ${this.allowedElementTag.join(
              ", "
            )}`
          );
      }
    });
    return elementsWrapper;
  }

  /**
   * Render content module
   *
   * @todo support fields
   * @todo support lark_md
   * @see https://open.feishu.cn/document/common-capabilities/message-card/message-cards-content/content-module
   */
  renderDiv(divElement) {
    this.validate(divElement.tag === "div", "divElement.tag must be div");

    const div = document.createElement("div");
    div.setAttribute("class", "lark-card-element div");

    this.validate(divElement.text, "divElement.text is required");
    this.validate(
      divElement.text.tag === "plain_text",
      "divElement.text.tag must be plain_text"
    );
    this.validate(
      divElement.text.content,
      "divElement.text.content is required"
    );
    div.innerText = divElement.text.content;
    return div;
  }

  /**
   * Render divider line
   *
   * @todo adjust color
   * @see https://open.feishu.cn/document/common-capabilities/message-card/message-cards-content/divider-line-module
   */
  renderHr(hrElement) {
    this.validate(hrElement.tag === "hr", "hrElement.tag must be hr");

    const hr = document.createElement("hr");
    hr.setAttribute("class", "lark-card-element hr");
    return hr;
  }

  /**
   * Render image
   *
   * @todo render text into alt
   * @todo implement title config
   * @todo implement mode config
   * @todo implement preview config
   * @see https://open.feishu.cn/document/common-capabilities/message-card/message-cards-content/image-module
   */
  renderImg(imgElement) {
    this.validates([
      [imgElement.tag === "img", "imgElement.tag must be img"],
      [imgElement.img_key, "imgElement.img_key is required"],
      [imgElement.alt, "imgElement.alt is required"],
    ]);

    const img = document.createElement("img");
    img.setAttribute("class", "lark-card-element img");
    img.setAttribute(
      "src",
      `https://open.feishu.cn/open-apis/block-kit/image/${imgElement.img_key}`
    );

    const isCompact = Boolean(imgElement.compact_width);
    if (isCompact) {
      img.classList.add("compact");
    }

    const customWidth = imgElement.custom_width;
    if (customWidth) {
      this.validate(
        !isNaN(Number(customWidth)),
        "imgElement.custom_width must be number"
      );
      img.style.maxWidth = `clamp(278px, ${customWidth}px, 580px)`;
    }

    return img;
  }

  /**
   * Render note module
   *
   * @todo support image element
   * @see https://open.feishu.cn/document/common-capabilities/message-card/message-cards-content/notes-module
   */
  renderNote(noteElement) {
    this.validate(noteElement.tag === "note", "noteElement.tag must be note");
    this.validate(
      noteElement.elements?.length > 0,
      "noteElement.elements is required"
    );

    const note = document.createElement("div");
    note.setAttribute("class", "lark-card-element note");
    noteElement.elements.forEach((element) => {
      const { tag } = element;
      this.validate(
        ["plain_text", "lark_md", "img"].includes(tag),
        "noteElement.element.tag must be plain_text, lark_md or img"
      );
      switch (tag) {
        case "plain_text":
        case "lark_md":
          const embeddedText = this.renderEmbeddedText(element);
          note.appendChild(embeddedText);
          break;
        case "img":
          const embeddedImage = this.renderEmbeddedImage(element);
          note.appendChild(embeddedImage);
          break;
        default:
          throw new Error(
            `noteElement.element.tag ${tag} is not allowed, allowed values are plain_text, lark_md or img`
          );
      }
    });

    return note;
  }

  /**
   * @todo implement flex_mode
   * @todo implement background_style
   * @todo implement horizontal_spacing
   * @todo implement columns
   * @todo implement action
   * @see https://open.feishu.cn/document/common-capabilities/message-card/message-cards-content/column-set
   */
  renderColumnSet(columnSetElement) {
    this.validate(
      columnSetElement.tag === "column_set",
      "columnSetElement.tag must be column_set"
    );
    this.validate(
      columnSetElement.columns?.length > 0,
      "columnSetElement.columns is required"
    );

    const columnSet = document.createElement("div");
    columnSet.setAttribute("class", "lark-card-element column_set");
    columnSetElement.columns.forEach((column) => {
      const columnElement = this.renderColumn(column);
      columnSet.appendChild(columnElement);
    });

    return columnSet;
  }

  /**
   * @todo implement lark_md
   * @todo implement lines
   * @see https://open.feishu.cn/document/common-capabilities/message-card/message-cards-content/embedded-non-interactive-elements/text
   */
  renderEmbeddedText(embeddedText) {
    this.validate(
      ["plain_text", "lark_md"].includes(embeddedText.tag),
      'embeddedText.tag must be "plain_text" or "lark_md"'
    );
    this.validate(embeddedText.content, "embeddedText.content is required");

    const span = document.createElement("span");
    span.setAttribute("class", "lark-card-embedded text");
    span.innerText = embeddedText.content;
    return span;
  }

  /**
   * @todo implement preview
   * @todo implement alt
   * @see https://open.feishu.cn/document/ukTMukTMukTM/uAzNwUjLwcDM14CM3ATN
   */
  renderEmbeddedImage(embeddedImage) {
    this.validate(
      embeddedImage.tag === "img",
      'embeddedImage.tag must be "img"'
    );
    const { img_key, alt, preview } = embeddedImage;
    this.validate(img_key, "embeddedImage.img_key is required");
    this.validate(alt, "embeddedImage.alt is required");

    const img = document.createElement("img");
    img.setAttribute("class", "lark-card-embedded img");
    img.setAttribute(
      "src",
      `https://open.feishu.cn/open-apis/block-kit/image/${img_key}`
    );
    return img;
  }

  validate(assert, message) {
    if (!assert) {
      if (this.validateLevel === "warning") {
        console.warn(message);
      } else if (this.validateLevel === "error") {
        throw new Error(message);
      }
    }
    return Boolean(assert);
  }

  validates(assertSets = []) {
    return assertSets.every((assertSet) => this.validate(...assertSet));
  }

  allowedHeaderTemplate = [
    "blue",
    "wathet", // typo of watchet
    "turquoise",
    "carmine",
    "violet",
    "indigo",
    "red",
    "green",
    "yellow",
    "purple",
    "grey", // less common spelling of _gray_
    "default",
  ];
  allowedElementTag = [
    "column_set",
    "div",
    "markdown",
    "hr",
    "img",
    "note",
    "actions",
  ];
}

export default LarkCard;
