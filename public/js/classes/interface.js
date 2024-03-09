import { INTERFACE_SPRITES } from "../constants/sprites.js";
import { COLORS } from "../constants/colors.js";
import { TEXT_STYLES, FONT_SIZES } from "../constants/text.js";
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
    height: INTERFACE_SPRITES.downButton.height,
    text: new PIXI.Text(CONTENT.interface.bottomBar.default, {
      ...TEXT_STYLES.default,
      fontSize: isMobileSizedScreen() ? FONT_SIZES.sm : FONT_SIZES.md,
      wordWrap: true,
    }),
    background: new PIXI.Graphics(),
    show: false,
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
    this.bottomBar.container.pivot.y = this.bottomBar.container.height * -1;

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

  static renderBottomBar() {
    const scale = state.scale();

    const width = isMobileSizedScreen()
      ? state.app.screen.width
      : state.app.screen.width / 2;

    const positionX = isMobileSizedScreen() ? 0 : state.app.screen.width / 4;

    const positionY =
      state.app.screen.height -
      this.bottomBar.container.height / 2 +
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
    this.bottomBar.background.beginFill(COLORS.bottomBar);
    this.bottomBar.background.drawRect(
      0,
      positionY - this.bottomBar.downButton.height / 2,
      width,
      this.bottomBar.container.height
    );
    this.bottomBar.background.endFill();

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

    this.bottomBar.container.addChild(this.bottomBar.text);

    state.app.stage.addChild(this.bottomBar.container);

    if (!this.bottomBar.show) {
      this.bottomBar.container.pivot.y = this.bottomBar.container.height * -1;
    }
  }

  static render() {
    this.renderTitle();
    this.renderBottomBar();
  }
}
