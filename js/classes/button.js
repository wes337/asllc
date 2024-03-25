import { TEXT_STYLES, FONT_SIZES } from "../constants/text.js";
import { COLORS } from "../constants/colors.js";
import { isMobileSizedScreen } from "../utils.js";

export default class Button {
  button = new PIXI.Container();
  label = new PIXI.Text("", {
    ...TEXT_STYLES.default,
    fontSize: FONT_SIZES.xl,
    lineHeight: FONT_SIZES.xl,
    wordWrap: false,
  });
  background = new PIXI.Graphics();
  position = {
    x: 0,
    y: 0,
  };
  width = null;
  height = null;
  backgroundColor = COLORS.purple;
  textColor = COLORS.white;
  callback = () => {};

  constructor(id, label) {
    this.id = id;

    this.button.id = id;
    this.button.eventMode = "static";
    this.button.cursor = "pointer";

    this.label.text = label;

    this.button.addListener("pointerdown", this.onClick.bind(this));
    this.button.addListener("pointerenter", this.onHover.bind(this));
    this.button.addListener("pointerleave", this.offHover.bind(this));
  }

  onClick(event) {
    this.callback(event);
  }

  onHover() {
    this.backgroundColor = COLORS.lightPurple;
    this.textColor = COLORS.yellow;
  }

  offHover() {
    this.backgroundColor = COLORS.purple;
    this.textColor = COLORS.white;
  }

  render() {
    this.button.position.x = this.position.x;
    this.button.position.y = this.position.y;

    const width = this.width || this.label.width;
    const height = this.height || this.label.height;

    this.background.clear();
    this.background.beginFill(this.backgroundColor);
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();

    this.label.position.y = height / 2 - this.label.height / 2;
    this.label.position.x = width / 2 - this.label.width / 2;
    this.label.style.fill = this.textColor;

    this.label.style.fontSize = isMobileSizedScreen()
      ? FONT_SIZES.lg
      : FONT_SIZES.xl;

    this.label.style.lineHeight = isMobileSizedScreen()
      ? FONT_SIZES.lg
      : FONT_SIZES.xl;

    this.button.addChild(this.background);
    this.button.addChild(this.label);
  }
}
