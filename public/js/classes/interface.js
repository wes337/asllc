import { INTERFACE_SPRITES } from "../constants/sprites.js";
import { COLORS } from "../constants/colors.js";
import {
  TEXT_STYLES,
  DEFAULT_FONT_SIZE,
  FONT_SIZES,
} from "../constants/text.js";
import { CONTENT } from "../constants/content.js";
import { isMobileSizedScreen } from "../utils.js";
import Building from "./building.js";
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
      wordWrap: true,
    }),
    background: new PIXI.Graphics(),
    show: false,
  };

  static modal = {
    show: false,
    container: new PIXI.Container(),
    background: new PIXI.Graphics(),
    headerText: new PIXI.Text("", {
      ...TEXT_STYLES.header,
      fontVariant: "small-caps",
      wordWrap: true,
      align: "center",
    }),
    bodyText: new PIXI.Text("", {
      ...TEXT_STYLES.default,
      fontSize: FONT_SIZES.md,
      wordWrap: true,
      align: "center",
    }),
    button: {
      text: new PIXI.Text("", {
        ...TEXT_STYLES.default,
        fontSize: FONT_SIZES.xl,
        wordWrap: false,
      }),
      container: new PIXI.Container(),
      background: new PIXI.Graphics(),
    },

    callback: null,
  };

  static {
    this.bottomBar.upButton.id = "up-button";
    this.bottomBar.upButton.eventMode = "static";
    this.bottomBar.upButton.cursor = "pointer";

    this.bottomBar.upButton.addListener(
      "pointerdown",
      this.onClickUpButton.bind(this)
    );

    this.bottomBar.downButton.id = "down-button";
    this.bottomBar.downButton.eventMode = "static";
    this.bottomBar.downButton.cursor = "pointer";

    this.bottomBar.downButton.addListener(
      "pointerdown",
      this.onClickDownButton.bind(this)
    );
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
    if (text) {
      this.bottomBar.text.text = text;
    }

    if (size) {
      this.bottomBar.text.style.fontSize = size;
    }

    if (color) {
      this.bottomBar.text.style.fill = color;
    }
  }

  static renderModal() {
    this.modal.background.clear();
    this.modal.button.background.clear();

    if (!this.modal.show) {
      return;
    }

    const margin = 32;
    const width = isMobileSizedScreen() ? state.app.screen.width - margin : 550;
    const height = 250;

    const positionX = state.app.screen.width / 2 - width / 2;
    const positionY =
      state.app.stage.pivot.y + state.app.screen.height / 2 - height / 2;

    this.modal.background.beginFill(COLORS.interfaceBackground);
    this.modal.background.drawRect(positionX, positionY, width, height);
    this.modal.background.endFill();
    this.modal.background.filters = [state.filters.highlight(4)];
    this.modal.container.addChild(this.modal.background);

    // Text
    const textMargin = 8;
    const textPositionX = positionX + width / 2;

    // Header Text
    const headerTextPositionY =
      positionY + this.modal.headerText.height / 2 + margin;

    this.modal.headerText.style.fontSize = isMobileSizedScreen()
      ? FONT_SIZES.lg
      : FONT_SIZES.xl;
    this.modal.headerText.position.set(textPositionX, headerTextPositionY);
    this.modal.headerText.anchor.set(0.5);
    this.modal.headerText.style.wordWrapWidth = this.modal.container.width;

    this.modal.container.addChild(this.modal.headerText);

    // Body Text
    const bodyTextPositionY = positionY + height / 2 - textMargin;

    this.modal.bodyText.position.set(textPositionX, bodyTextPositionY);
    this.modal.bodyText.anchor.set(0.5);

    this.modal.bodyText.style.wordWrapWidth = this.modal.container.width * 0.95;

    this.modal.container.addChild(this.modal.bodyText);

    // Button
    const buttonPadding = 8;
    const buttonPositionY =
      positionY + height - this.modal.button.text.height / 2 - margin;

    this.modal.button.container.position.set(textPositionX, buttonPositionY);
    this.modal.button.container.eventMode = "static";
    this.modal.button.container.cursor = "pointer";
    this.modal.button.container.addListener("pointerdown", () =>
      this.modal.callback()
    );

    this.modal.button.background.beginFill(COLORS.button);
    this.modal.button.background.drawRect(
      (this.modal.button.text.width / 2) * -1 - buttonPadding - 4,
      this.modal.button.text.height * -1 + buttonPadding,
      this.modal.button.text.width + buttonPadding * 2,
      this.modal.button.text.height + buttonPadding * 2
    );
    this.modal.button.background.endFill();
    this.modal.button.container.addChild(this.modal.button.background);

    this.modal.button.text.style.wordWrapWidth =
      this.modal.container.width - textMargin;
    this.modal.button.text.anchor.set(0.5);
    this.modal.button.container.addChild(this.modal.button.text);

    this.modal.button.container.filters = [
      state.filters.highlight(4, COLORS.textShadow),
    ];

    this.modal.container.addChild(this.modal.button.container);

    state.app.stage.addChild(this.modal.container);
  }

  static showModal({ headerText, bodyText, buttonText, callback }) {
    this.modal.headerText.text = headerText;
    this.modal.bodyText.text = bodyText;
    this.modal.button.text.text = buttonText.toUpperCase();
    this.modal.callback = callback;
    this.modal.show = true;
  }

  static hideModal() {
    this.modal.headerText.text = "";
    this.modal.bodyText.text = "";
    this.modal.button.text.text = "";
    this.modal.callback = () => {};
    this.modal.show = false;
  }

  static renderBottomBar() {
    const scale = state.scale();

    const width = isMobileSizedScreen()
      ? state.app.screen.width
      : state.app.screen.width / 2;

    const positionX = isMobileSizedScreen() ? 0 : state.app.screen.width / 4;

    const positionY =
      state.app.screen.height -
      this.bottomBar.height() / 2 +
      state.app.stage.pivot.y;

    // Up button
    this.bottomBar.upButton.position.set(
      width -
        this.bottomBar.upButton.width * 2 +
        this.bottomBar.upButton.width / 2,
      positionY
    );
    this.bottomBar.upButton.scale.y = scale;
    this.bottomBar.upButton.scale.x = scale;
    this.bottomBar.upButton.anchor.set(0.5);

    // Down button
    this.bottomBar.downButton.position.set(
      width - this.bottomBar.downButton.width / 2,
      positionY
    );
    this.bottomBar.downButton.scale.y = scale;
    this.bottomBar.downButton.scale.x = scale;
    this.bottomBar.downButton.anchor.set(0.5);

    // Background
    this.bottomBar.background.clear();
    this.bottomBar.background.beginFill(COLORS.interfaceBackground);
    this.bottomBar.background.drawRect(
      0,
      positionY - this.bottomBar.downButton.height / 2,
      width,
      this.bottomBar.height()
    );

    // Top border
    const borderSize = 4;
    this.bottomBar.background.beginFill(COLORS.sky);
    this.bottomBar.background.drawRect(
      0,
      positionY - this.bottomBar.downButton.height / 2 - borderSize,
      width + borderSize,
      borderSize
    );

    if (!isMobileSizedScreen()) {
      // Left border
      this.bottomBar.background.drawRect(
        positionX - state.app.screen.width / 4,
        positionY - this.bottomBar.downButton.height / 2,
        borderSize,
        this.bottomBar.downButton.height
      );

      // Right border
      this.bottomBar.background.drawRect(
        positionX + state.app.screen.width / 4,
        positionY - this.bottomBar.downButton.height / 2,
        borderSize,
        this.bottomBar.downButton.height
      );
    }

    this.bottomBar.background.endFill();

    this.bottomBar.container.addChild(this.bottomBar.background);
    this.bottomBar.container.addChild(this.bottomBar.upButton);
    this.bottomBar.container.addChild(this.bottomBar.downButton);

    this.bottomBar.container.position.x = positionX;

    // Text
    const textMargin = isMobileSizedScreen() ? 8 : 16;
    const textPositionX = this.bottomBar.text.width / 2 + textMargin;

    this.bottomBar.text.style.wordWrapWidth =
      this.bottomBar.container.width -
      this.bottomBar.upButton.width -
      this.bottomBar.downButton.width -
      textMargin;

    this.bottomBar.text.position.set(textPositionX, positionY);
    this.bottomBar.text.anchor.set(0.5);
    this.bottomBar.text.style.fontSize = DEFAULT_FONT_SIZE();

    this.bottomBar.container.addChild(this.bottomBar.text);

    state.app.stage.addChild(this.bottomBar.container);

    if (!this.bottomBar.show) {
      this.bottomBar.container.pivot.y = this.bottomBar.height() * -1;
    }
  }

  static render() {
    this.renderTitle();
    this.renderBottomBar();
    this.renderModal();
  }
}
