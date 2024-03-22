import { INTERFACE_SPRITES } from "../constants/sprites.js";
import { COLORS } from "../constants/colors.js";
import {
  TEXT_STYLES,
  DEFAULT_FONT_SIZE,
  DEFAULT_LINE_HEIGHT,
} from "../constants/text.js";
import { CONTENT } from "../constants/content.js";
import { isLargeSizedScreen, isMobileSizedScreen } from "../utils.js";
import Building from "./building.js";
import Modal from "./modal.js";
import Button from "./button.js";
import state from "../state.js";

export default class Interface {
  static title = PIXI.Sprite.from(INTERFACE_SPRITES.logo.src);

  static bottomBar = {
    container: new PIXI.Container(),
    upButton: PIXI.Sprite.from(INTERFACE_SPRITES.upButton.src),
    downButton: PIXI.Sprite.from(INTERFACE_SPRITES.downButton.src),
    height: () => (INTERFACE_SPRITES.downButton.height + 4) * state.scale(),
    text: new PIXI.Text(CONTENT.interface.bottomBar.default, {
      ...TEXT_STYLES.default,
      fontSize: DEFAULT_FONT_SIZE(),
      lineHeight: DEFAULT_LINE_HEIGHT(DEFAULT_FONT_SIZE()),
      wordWrap: true,
    }),
    background: new PIXI.Graphics(),
    show: false,
    buttons: {
      about: new Button("about", "About"),
      artists: new Button("artists", "Artists"),
      contact: new Button("contact", "Contact"),
    },
  };

  static {
    this.bottomBar.buttons.about.callback = () => {
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

    this.bottomBar.buttons.artists.callback = () => {
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

    this.bottomBar.buttons.contact.callback = () => {
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

  static showBottomBar() {
    state.busy = true;

    this.bottomBar.show = true;
    this.bottomBar.container.pivot.y = this.bottomBar.height() * -1;

    const animation = (delta) => {
      const speed = 4 * delta;
      this.bottomBar.container.pivot.y += speed;

      if (this.bottomBar.container.pivot.y >= -2) {
        state.app.ticker.remove(animation);
        state.busy = false;
        this.bottomBar.container.pivot.y = -2;
      }
    };

    state.app.ticker.add(animation);
  }

  static updateBottomBarText({ text, size, color }) {
    // if (text) {
    //   this.bottomBar.text.text = text;
    // }
    // if (size) {
    //   this.bottomBar.text.style.fontSize = size;
    //   this.bottomBar.text.style.lineHeight = DEFAULT_LINE_HEIGHT(size);
    // }
    // if (color) {
    //   this.bottomBar.text.style.fill = color;
    // }
  }

  static renderBottomBar() {
    const scale = state.scale();

    const bottomBarHeight = isLargeSizedScreen() ? 200 * scale : 300 * scale;
    const backgroundColor = COLORS.darkGray;
    const borderColor = COLORS.purple;
    const borderSize = 4;

    const width = isMobileSizedScreen()
      ? state.app.screen.width
      : state.app.screen.width / 2;

    const positionX = isMobileSizedScreen() ? 0 : state.app.screen.width / 4;

    const positionY =
      state.app.screen.height - bottomBarHeight / 2 + state.app.stage.pivot.y;

    // Background
    this.bottomBar.background.clear();
    this.bottomBar.background.beginFill(backgroundColor);
    this.bottomBar.background.drawRect(
      0,
      positionY - bottomBarHeight / 2,
      width,
      bottomBarHeight
    );

    // Top border
    this.bottomBar.background.beginFill(borderColor);
    this.bottomBar.background.drawRect(
      0,
      positionY - bottomBarHeight / 2 - borderSize,
      width + borderSize,
      borderSize
    );

    if (!isMobileSizedScreen()) {
      // Left border
      this.bottomBar.background.drawRect(
        positionX - state.app.screen.width / 4,
        positionY - bottomBarHeight / 2,
        borderSize,
        bottomBarHeight
      );

      // Right border
      this.bottomBar.background.drawRect(
        positionX + state.app.screen.width / 4,
        positionY - bottomBarHeight / 2,
        borderSize,
        bottomBarHeight
      );
    }

    this.bottomBar.background.endFill();
    this.bottomBar.container.addChild(this.bottomBar.background);
    this.bottomBar.container.position.x = positionX;

    // Nav Buttons
    const { about, artists, contact } = this.bottomBar.buttons;

    this.bottomBar.container.addChild(about.button);
    this.bottomBar.container.addChild(artists.button);
    this.bottomBar.container.addChild(contact.button);

    const buttonMargin = 8;
    const buttonWidth = this.bottomBar.background.width / 3 - buttonMargin;
    const buttonHeight = bottomBarHeight - borderSize - buttonMargin;
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

    state.app.stage.addChild(this.bottomBar.container);

    if (!this.bottomBar.show) {
      this.bottomBar.container.pivot.y = this.bottomBar.height() * -1;
    }
  }

  static render() {
    this.renderTitle();
    this.renderBottomBar();
    Modal.render();
  }
}
