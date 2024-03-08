import { SPRITES } from "../constants/sprites.js";
import Floor from "./floor.js";
import state from "../state.js";

export default class Building {
  static roof = PIXI.Sprite.from(SPRITES.roof.src);
  static floors = [];
  static elavator;

  static get topFloor() {
    return this.floors[this.floors.length - 1];
  }

  static get activeFloor() {
    return this.floors[state.activeFloorNumber || 0];
  }

  static setFloor(i, floor) {
    this.floors[i] = floor;
  }

  static renderFloor(i, name) {
    if (this.floors[i]) {
      this.floors[i].render();
    } else {
      const floor = new Floor(i, name);
      this.floors[i] = floor;
      floor.render();
    }

    return this.floors[i];
  }

  static renderRoof() {
    const scale = state.scale();

    this.roof.position.set(
      this.topFloor.position.x(),
      this.topFloor.position.y() - this.topFloor.height() / 2
    );

    this.roof.scale.y = scale;
    this.roof.scale.x = scale;
    this.roof.anchor.set(0.5);

    state.app.stage.addChild(this.roof);
  }
}
