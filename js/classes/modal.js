import { MODALS } from "../constants/modal.js";
import Building from "./building.js";
import SoundPlayer from "./sound.js";

export default class Modal {
  static visible = false;

  static id = null;
  static modal = document.getElementById("modal-container");
  static header = document.getElementById("modal-header");
  static body = document.getElementById("modal-body");
  static footer = document.getElementById("modal-footer");

  static {
    const closeButton = document.getElementById("modal-close");
    closeButton.onclick = this.hide.bind(this);
  }

  static show({ id, header, body, footer }) {
    this.modal = document.getElementById("modal-container");

    this.modal.classList.add("show");

    this.header.innerText = header;
    this.body.innerHTML = body;

    this.visible = true;

    this.id = id || "modal";

    if (footer) {
      this.footer.innerHTML = footer;
      this.footer.classList.add("show");
      this.setupFooterButtons();
    } else {
      this.footer.innerHTML = "";
      this.footer.classList.remove("show");
    }

    if (["artists", "other"].includes(this.id)) {
      this.setupArtistButtons();
    }

    if (this.id === "about") {
      this.setupAboutButtons();
    }

    this.setupBackButton();
  }

  static hide() {
    this.modal.classList.remove("show");
    this.header.innerText = "";
    this.body.innerHTML = "";
    this.visible = false;
    this.id = null;
    SoundPlayer.play("close.wav");
  }

  static setupBackButton() {
    const backButton = this.modal.querySelector("#back-button");

    if (!backButton) {
      return;
    }

    backButton.onclick = (event) => {
      event.stopPropagation();
      this.show(MODALS.about);
    };
  }

  static setupAboutButtons() {
    const touringButton = this.modal.querySelector("#touring-button");
    const merchandiseButton = this.modal.querySelector("#merchandise-button");

    touringButton.onclick = (event) => {
      event.stopPropagation();
      this.show(MODALS.touring);
    };

    merchandiseButton.onclick = (event) => {
      event.stopPropagation();
      this.show(MODALS.merchandise);
    };
  }

  static setupArtistButtons() {
    const artists = this.modal.querySelector(".artists");
    const buttons = artists.querySelectorAll(".artist");

    buttons.forEach((button) => {
      button.onclick = (event) => {
        event.stopPropagation();

        const floor = Building.allFloors.find(
          (floor) => `${floor.id}-button` === button.id
        );

        this.hide();

        if (floor) {
          floor.onClick();
        }
      };
    });
  }

  static setupFooterButtons() {
    if (!this.footer) {
      return;
    }

    const footerButton = this.footer.querySelector("button");
    footerButton.onclick = (event) => {
      event.stopPropagation();
      this.show(this.id === "artists" ? MODALS.other : MODALS.artists);
    };
  }
}
