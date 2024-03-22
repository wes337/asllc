import { SPRITES } from "../constants/sprites.js";
import Floor from "./floor.js";
import state from "../state.js";

export default class Building {
  static roof = PIXI.Sprite.from(SPRITES.roof.src);
  static foundation = new PIXI.TilingSprite(
    PIXI.Texture.from(SPRITES.foundation.src),
    window.innerWidth,
    SPRITES.foundation.height
  );
  static floors = [];
  static basement = [];

  static get topFloor() {
    return this.floors[this.floors.length - 1];
  }

  static get lobby() {
    return this.floors[0];
  }

  static get bottomFloor() {
    if (this.basement.length <= 1) {
      return this.lobby;
    }

    return this.basement[this.basement.length];
  }

  static get activeFloor() {
    if (state.activeFloorNumber === null) {
      return this.lobby;
    }

    if (state.activeFloorNumber < 0) {
      return this.basement[state.activeFloorNumber * -1];
    }

    return this.floors[state.activeFloorNumber];
  }

  static renderFoundation() {
    const scale = state.scale();

    this.foundation.width = state.app.screen.width;
    this.foundation.height = SPRITES.foundation.height * scale;

    this.foundation.tileScale.x = scale;
    this.foundation.tileScale.y = scale;

    this.foundation.position.set(
      0,
      this.lobby.position.y() + this.lobby.height() / 2 + 26 * scale
    );

    this.basement[0] = this.foundation;

    state.app.stage.addChild(this.foundation);
  }

  static renderFloor(i, name) {
    if (!this.floors[i]) {
      const floor = new Floor(i, name);
      this.floors[i] = floor;
    }

    this.floors[i].render();
  }

  static renderBasementFloor(i, name) {
    if (!this.basement[i]) {
      const floor = new Floor(i, name, true);
      this.basement[i] = floor;
    }

    this.basement[i].render();
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

  static selectNextOrPreviousFloor(previous) {
    if (state.busy || !state.introFinished) {
      return;
    }

    const index = previous ? -1 : +1;

    let nextIndex = (state.activeFloorNumber || 0) + index;

    let floor;

    if (nextIndex < 0) {
      floor = this.basement[nextIndex * -1];
    } else {
      floor = this.floors[nextIndex];
    }

    if (!floor) {
      return;
    }

    floor.onClick();
  }
}
