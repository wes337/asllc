import { INTERFACE_SPRITES } from "../constants/sprites.js";
import { COLORS } from "../constants/colors.js";
import { TEXT_STYLES, FONT_SIZES } from "../constants/text.js";
import { isLargeSizedScreen, isMobileSizedScreen } from "../utils.js";
import Building from "./building.js";
import Modal from "./modal.js";
import Button from "./button.js";
import state from "../state.js";

export default class Interface {
  static title = PIXI.Sprite.from(INTERFACE_SPRITES.logo.src);

  static navBar = {
    container: new PIXI.Container(),
    height: () =>
      isLargeSizedScreen() ? 200 * state.scale() : 300 * state.scale(),
    background: new PIXI.Graphics(),
    show: false,
    buttons: {
      about: new Button("about", "About"),
      artists: new Button("artists", "Artists"),
      contact: new Button("contact", "Contact"),
    },
  };

  static artistInfo = {
    container: new PIXI.Container(),
    background: new PIXI.Graphics(),
    height: () =>
      isLargeSizedScreen() ? 200 * state.scale() : 300 * state.scale(),
    show: false,
    text: new PIXI.Text("", {
      ...TEXT_STYLES.default,
      fill: COLORS.yellow,
      wordWrap: true,
      align: "center",
    }),
  };

  static {
    this.navBar.buttons.about.callback = () => {
      if (Modal.visible) {
        return;
      }

      Modal.show({
        headerText: "About",
        bodyText: "",
        buttonText: "Okay",
        callback: () => {
          Modal.hide();
        },
      });
    };

    this.navBar.buttons.artists.callback = () => {
      if (Modal.visible) {
        return;
      }

      Modal.show({
        headerText: "Artists",
        bodyText: "",
        buttonText: "Okay",
        callback: () => {
          Modal.hide();
        },
      });
    };

    this.navBar.buttons.contact.callback = () => {
      if (Modal.visible) {
        return;
      }

      Modal.show({
        headerText: "Contact",
        bodyText: "",
        buttonText: "Okay",
        callback: () => {
          Modal.hide();
        },
      });
    };
  }

  static onClickUpButton() {
    Building.selectNextOrPreviousFloor(false);
  }

  static onClickDownButton() {
    Building.selectNextOrPreviousFloor(true);
  }

  static renderTitle() {
    const margin = 8;
    const minWidth = 360;

    const positionY = Math.max(
      state.app.stage.pivot.y + this.title.height / 2 + margin,
      Building.topFloor.position.y() - this.title.height * 3
    );

    this.title.position.set(state.app.screen.width / 2, positionY);

    if (
      this.title.width >= state.app.screen.width &&
      this.title.width !== minWidth
    ) {
      this.title.width = Math.max(state.app.screen.width - 10, minWidth);
      this.title.scale.y = this.title.scale.y - 0.1;
    }

    this.title.anchor.set(0.5);

    state.app.stage.addChild(this.title);
  }

  static showBar(bar) {
    state.busy = true;

    this[bar].show = true;
    this[bar].container.pivot.y = this[bar].height() * -1;

    const animation = (delta) => {
      const speed = 4 * delta;
      this[bar].container.pivot.y += speed;

      if (this[bar].container.pivot.y >= -2) {
        state.app.ticker.remove(animation);
        state.busy = false;
        this[bar].container.pivot.y = -2;
      }
    };

    state.app.ticker.add(animation);
  }

  static hideBar(bar) {
    state.busy = true;

    this[bar].container.pivot.y = -2;

    const animation = (delta) => {
      const speed = 4 * delta;
      this[bar].container.pivot.y -= speed;

      if (this[bar].container.pivot.y <= this[bar].height() * -1) {
        state.app.ticker.remove(animation);
        state.busy = false;
        this[bar].container.pivot.y = this[bar].height() * -1;
        this[bar].show = false;
      }
    };

    state.app.ticker.add(animation);
  }

  static showNavBar() {
    this.showBar("navBar");
  }

  static setArtistInfo(artistId) {
    this.artistInfo.text.text = artistId || "";

    if (artistId === "lobby") {
      this.hideBar("artistInfo");
    } else if (artistId && !this.artistInfo.show) {
      this.showBar("artistInfo");
    }
  }

  static renderArtistInfo() {
    const scale = state.scale();

    const backgroundColor = COLORS.darkGray;
    const borderColor = COLORS.purple;
    const borderSize = 4;

    const width = isMobileSizedScreen()
      ? state.app.screen.width
      : state.app.screen.width / 2;

    const positionX = isMobileSizedScreen() ? 0 : state.app.screen.width / 4;

    const positionY =
      state.app.screen.height -
      this.artistInfo.height() / 2 -
      this.navBar.height() +
      state.app.stage.pivot.y;

    // Background
    this.artistInfo.background.clear();
    this.artistInfo.background.beginFill(backgroundColor);
    this.artistInfo.background.drawRect(
      0,
      positionY - this.artistInfo.height() / 2,
      width,
      this.artistInfo.height()
    );

    this.artistInfo.background.endFill();
    this.artistInfo.container.addChild(this.artistInfo.background);
    this.artistInfo.container.position.x = positionX;

    // Top border
    this.artistInfo.background.beginFill(borderColor);
    this.artistInfo.background.drawRect(
      0,
      positionY - this.artistInfo.height() / 2 - borderSize,
      width + borderSize,
      borderSize
    );

    if (!isMobileSizedScreen()) {
      // Left border
      this.artistInfo.background.drawRect(
        positionX - state.app.screen.width / 4,
        positionY - this.artistInfo.height() / 2,
        borderSize,
        this.artistInfo.height()
      );

      // Right border
      this.artistInfo.background.drawRect(
        positionX + state.app.screen.width / 4,
        positionY - this.artistInfo.height() / 2,
        borderSize,
        this.artistInfo.height()
      );
    }

    // Text
    this.artistInfo.text.position.y =
      positionY - this.artistInfo.text.height / 2;
    this.artistInfo.text.position.x = isMobileSizedScreen()
      ? state.app.screen.width / 2 - this.artistInfo.text.width / 2
      : positionX - this.artistInfo.text.width / 2;
    this.artistInfo.text.style.wordWrapWidth = width;
    this.artistInfo.text.style.fontSize = isMobileSizedScreen()
      ? FONT_SIZES.xl
      : FONT_SIZES.xxl;
    this.artistInfo.container.addChild(this.artistInfo.text);

    state.app.stage.addChild(this.artistInfo.container);

    if (!this.artistInfo.show) {
      this.artistInfo.container.pivot.y = this.artistInfo.height() * -2;
    }
  }

  static renderBottomBar() {
    const backgroundColor = COLORS.darkGray;
    const borderColor = COLORS.purple;
    const borderSize = 4;

    const width = isMobileSizedScreen()
      ? state.app.screen.width
      : state.app.screen.width / 2;

    const positionX = isMobileSizedScreen() ? 0 : state.app.screen.width / 4;

    const positionY =
      state.app.screen.height -
      this.navBar.height() / 2 +
      state.app.stage.pivot.y;

    // Background
    this.navBar.background.clear();
    this.navBar.background.beginFill(backgroundColor);
    this.navBar.background.drawRect(
      0,
      positionY - this.navBar.height() / 2,
      width,
      this.navBar.height()
    );

    // Top border
    this.navBar.background.beginFill(borderColor);
    this.navBar.background.drawRect(
      0,
      positionY - this.navBar.height() / 2 - borderSize,
      width + borderSize,
      borderSize
    );

    if (!isMobileSizedScreen()) {
      // Left border
      this.navBar.background.drawRect(
        positionX - state.app.screen.width / 4,
        positionY - this.navBar.height() / 2,
        borderSize,
        this.navBar.height()
      );

      // Right border
      this.navBar.background.drawRect(
        positionX + state.app.screen.width / 4,
        positionY - this.navBar.height() / 2,
        borderSize,
        this.navBar.height()
      );
    }

    this.navBar.background.endFill();
    this.navBar.container.addChild(this.navBar.background);
    this.navBar.container.position.x = positionX;

    // Nav Buttons
    const { about, artists, contact } = this.navBar.buttons;

    this.navBar.container.addChild(about.button);
    this.navBar.container.addChild(artists.button);
    this.navBar.container.addChild(contact.button);

    const buttonMargin = 8;
    const buttonWidth = this.navBar.background.width / 3 - buttonMargin;
    const buttonHeight = this.navBar.height() - borderSize - buttonMargin;
    const buttonPositionY = positionY - buttonHeight / 2 - borderSize / 4;

    // About
    about.width = buttonWidth;
    about.height = buttonHeight;
    about.position.y = buttonPositionY;
    about.position.x = isMobileSizedScreen()
      ? borderSize + buttonMargin * 0.2
      : borderSize + buttonMargin * 0.5;
    about.render();

    // Artists
    artists.width = buttonWidth;
    artists.height = buttonHeight;
    artists.position.y = buttonPositionY;
    artists.position.x = isMobileSizedScreen()
      ? buttonWidth + buttonMargin * 1.3
      : buttonWidth + buttonMargin * 1.5;
    artists.render();

    // Contact
    contact.width = buttonWidth;
    contact.height = buttonHeight;
    contact.position.y = buttonPositionY;
    contact.position.x = isMobileSizedScreen()
      ? buttonWidth * 2 + buttonMargin * 2.4 - borderSize
      : buttonWidth * 2 + buttonMargin * 2.5 - borderSize;
    contact.render();

    state.app.stage.addChild(this.navBar.container);

    if (!this.navBar.show) {
      this.navBar.container.pivot.y = this.navBar.height() * -1;
    }
  }

  static render() {
    this.renderTitle();
    this.renderArtistInfo();
    this.renderBottomBar();

    Modal.render();
  }
}
