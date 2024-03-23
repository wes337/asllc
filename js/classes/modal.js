import { COLORS } from "../constants/colors.js";
import { TEXT_STYLES, FONT_SIZES } from "../constants/text.js";
import { isMobileSizedScreen } from "../utils.js";
import state from "../state.js";

export default class Modal {
  static visible = false;
  static height = 250;
  static width = 800;
  static container = new PIXI.Container();
  static background = new PIXI.Graphics();
  static backdrop = new PIXI.Graphics();
  static headerText = new PIXI.Text("", {
    ...TEXT_STYLES.header,
    fontVariant: "small-caps",
    wordWrap: true,
    align: "center",
  });

  static bodyText = new PIXI.Text("", {
    ...TEXT_STYLES.default,
    fontSize: FONT_SIZES.md,
    wordWrap: true,
    align: "center",
  });
  static button = {
    text: new PIXI.Text("", {
      ...TEXT_STYLES.default,
      fontSize: FONT_SIZES.xl,
      wordWrap: false,
    }),
    container: new PIXI.Container(),
    background: new PIXI.Graphics(),
  };

  static callback = null;

  static animateIn() {
    this.container.scale.y = 0;

    const animation = (delta) => {
      const amount = 0.25 * delta;
      this.container.scale.y += amount;

      if (this.container.scale.y >= 1) {
        this.container.scale.y = 1;
        state.app.ticker.remove(animation);
      }
    };

    state.app.ticker.add(animation);
  }

  static renderModal() {
    this.background.clear();
    this.button.background.clear();

    if (!this.visible) {
      return;
    }

    const margin = 32;
    const width = isMobileSizedScreen()
      ? state.app.screen.width - margin
      : this.width;

    const positionX = state.app.screen.width / 2 - width / 2;
    const positionY =
      state.app.stage.pivot.y + state.app.screen.height / 2 - this.height / 2;

    this.background.beginFill(COLORS.darkGray);
    this.background.drawRect(positionX, positionY, width, this.height);
    this.background.endFill();
    this.background.filters = [state.filters.highlight(4, COLORS.darkPurple)];
    this.container.addChild(this.background);

    // Text
    const textMargin = 8;
    const textPositionX = positionX + width / 2;

    // Header Text
    const headerTextPositionY = positionY + this.headerText.height / 2 + margin;

    this.headerText.style.fontSize = isMobileSizedScreen()
      ? FONT_SIZES.lg
      : FONT_SIZES.xl;
    this.headerText.position.set(textPositionX, headerTextPositionY);
    this.headerText.anchor.set(0.5);
    this.headerText.style.wordWrapWidth = this.container.width;

    this.container.addChild(this.headerText);

    // Body Text
    const bodyTextPositionY = positionY + this.height / 2 - textMargin;

    this.bodyText.position.set(textPositionX, bodyTextPositionY);
    this.bodyText.anchor.set(0.5);

    this.bodyText.style.wordWrapWidth = this.container.width * 0.95;

    this.container.addChild(this.bodyText);

    // Button
    const buttonPadding = 8;
    const buttonPositionY =
      positionY + this.height - this.button.text.height / 2 - margin;

    this.button.container.position.set(textPositionX, buttonPositionY);
    this.button.container.eventMode = "static";
    this.button.container.cursor = "pointer";
    this.button.container.addListener("pointerdown", () => this.callback());

    this.button.background.beginFill(COLORS.purple);
    this.button.background.drawRect(
      (this.button.text.width / 2) * -1 - buttonPadding - 4,
      this.button.text.height * -1 + buttonPadding,
      this.button.text.width + buttonPadding * 2,
      this.button.text.height + buttonPadding * 2
    );
    this.button.background.endFill();
    this.button.container.addChild(this.button.background);

    this.button.text.style.wordWrapWidth = this.container.width - textMargin;
    this.button.text.anchor.set(0.5);
    this.button.text.position.y = -2;
    this.button.container.addChild(this.button.text);

    this.button.container.filters = [
      state.filters.highlight(4, COLORS.darkPurple),
    ];

    this.container.addChild(this.button.container);

    state.app.stage.addChild(this.container);
  }

  static show({ headerText, bodyText, buttonText, callback }) {
    this.headerText.text = headerText;
    this.bodyText.text = bodyText;
    this.button.text.text = buttonText.toUpperCase();
    this.callback = callback;
    this.visible = true;

    this.animateIn();
  }

  static hide() {
    this.headerText.text = "";
    this.bodyText.text = "";
    this.button.text.text = "";
    this.callback = () => {};
    this.visible = false;
  }

  static renderBackdrop() {
    this.backdrop.clear();

    if (!this.visible) {
      return;
    }

    this.backdrop.beginFill(COLORS.black);

    this.backdrop.drawRect(
      0,
      state.app.stage.pivot.y,
      state.app.screen.width,
      state.app.screen.height
    );
    this.backdrop.endFill();

    this.backdrop.filters = [state.filters.opacity(0.5)];

    state.app.stage.addChild(this.backdrop);
  }

  static render() {
    this.renderBackdrop();
    this.renderModal();
  }
}
