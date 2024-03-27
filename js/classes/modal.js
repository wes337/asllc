import { COLORS } from "../constants/colors.js";
import { TEXT_STYLES, FONT_SIZES } from "../constants/text.js";
import { isMobileSizedScreen } from "../utils.js";
import State from "./state.js";

export default class Modal {
  static visible = false;

  static modal = document.getElementById("modal-container");
  static header = document.getElementById("modal-header");
  static body = document.getElementById("modal-body");

  static {
    const closeButton = document.getElementById("modal-close");
    closeButton.onclick = this.hide.bind(this);
  }

  static show({ header, body }) {
    this.modal = document.getElementById("modal-container");

    this.modal.classList.add("show");

    this.header.innerText = header;
    this.body.innerText = body;

    this.visible = true;
  }

  static hide() {
    this.modal.classList.remove("show");
    this.header.innerText = "";
    this.body.innerText = "";
    this.visible = false;
  }
}
