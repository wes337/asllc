import Building from "./building.js";
import state from "../state.js";

export default class Interface {
  static title = PIXI.Sprite.from("./img/logo.gif");

  static renderTitle() {
    const margin = 8;

    const positionY = Math.max(
      state.app.stage.pivot.y + this.title.height / 2 + margin,
      Building.topFloor.position.y() - this.title.height * 3
    );

    this.title.position.set(state.app.screen.width / 2, positionY);

    if (this.title.width >= state.app.screen.width) {
      this.title.width = state.app.screen.width - 10;
      this.title.scale.y = this.title.scale.y - 0.1;
    }

    this.title.anchor.set(0.5);

    state.app.stage.addChild(this.title);
  }

  static render() {
    this.renderTitle();
  }
}
