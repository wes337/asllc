import { COLORS } from "../constants/colors.js";
import { TEXT_STYLES, FONT_SIZES } from "../constants/text.js";
import { isLargeSizedScreen } from "../utils.js";
import SoundPlayer from "./sound.js";
import State from "./state.js";

export default class ChatBubble {
  background = new PIXI.Graphics();
  text = new PIXI.Text("", {
    ...TEXT_STYLES.chat,
    align: "center",
  });
  visible = false;
  timeout = null;

  width = 400;
  height = 150;

  constructor(target) {
    this.target = target;
  }

  show(text, duration = 3 * 1000) {
    this.visible = true;

    this.text.text = text;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    if (duration > 0) {
      this.timeout = setTimeout(() => {
        this.hide();
      }, duration);
    }

    this.render();
    SoundPlayer.play("speech-bubble.mp3", true);
  }

  hide() {
    this.visible = false;
    this.text.text = "";

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.render();
  }

  render() {
    this.background.clear();

    if (!this.visible) {
      return;
    }

    const scale = State.scale();

    const margin = 40 * scale;

    this.text.style.fontSize = FONT_SIZES.lg;

    let width = this.text.width + margin;
    this.text.style.wordWrap = true;
    this.text.style.wordWrapWidth = State.app.screen.width / 2;
    this.text.style.lineHeight =
      (isLargeSizedScreen() ? FONT_SIZES.lg : FONT_SIZES.md) + 20 * scale;

    const height = this.text.height + margin / 2;
    const targetHeight = this.target.height();
    const targetPosition = this.target.position();
    const targetWidth = this.target.width();
    const arrowSize = 20 * scale;
    const offsetX = this.text.width / 8;

    let positionX = targetPosition.x - width / 2 + offsetX;
    let positionY =
      targetPosition.y - targetHeight / 2 - arrowSize * 4 - height;

    const isUpsideDown =
      this.target.metadata && this.target.metadata.upsideDown;
    if (isUpsideDown) {
      positionY = targetPosition.y + targetHeight / 2 + arrowSize * 4;
    }

    if (this.target.inElevator) {
      positionY = positionY + targetHeight / 2;
      positionX = positionX + targetWidth / 2;
    }

    const backgroundColor = COLORS.lightGray;
    const shadowColor = COLORS.gray;
    const borderSize = 20 * scale;

    // Main background
    this.background.beginFill(backgroundColor);
    this.background.drawRect(
      positionX + borderSize,
      positionY - borderSize,
      width - borderSize * 2,
      height + borderSize * 2
    );
    this.background.drawRect(positionX, positionY, width, height);
    this.background.endFill();

    // Arrow
    this.background.beginFill(COLORS.lightGray);

    let arrowPositionX = targetPosition.x;
    let arrowPositionY = targetPosition.y - targetHeight / 2 - arrowSize * 3;

    if (isUpsideDown) {
      arrowPositionY = targetPosition.y + targetHeight / 2 + arrowSize * 2;
    }

    if (this.target.inElevator) {
      arrowPositionY = arrowPositionY + targetHeight / 2;
      arrowPositionX = arrowPositionX + targetWidth / 2;
    }

    this.background.drawRect(
      arrowPositionX,
      arrowPositionY,
      arrowSize * 2,
      arrowSize
    );
    this.background.drawRect(
      arrowPositionX,
      arrowPositionY + (isUpsideDown ? arrowSize * -1 : arrowSize),
      arrowSize,
      arrowSize
    );

    this.background.endFill();

    // Text
    this.text.position.x = positionX + borderSize;
    this.text.position.y = positionY + borderSize / 4;

    if (isUpsideDown) {
      this.text.position.x = positionX + this.text.width + borderSize / 2;
      this.text.position.y = positionY + this.text.height + borderSize;
      this.text.scale.y = -1;
      this.text.scale.x = -1;
    }

    State.app.stage.addChild(this.background);
    State.app.stage.addChild(this.text);
  }
}
