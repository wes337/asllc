import {
  isLargeSizedScreen,
  isMobileSizedScreen,
  isSmallMobileSizedScreen,
} from "../utils.js";
import Floor from "./floor.js";
import State from "./state.js";

export default class Building {
  static roof = null;
  static foundation = null;
  static undergroundFoundation = null;
  static floors = [];
  static basement = [];
  static crane = null;

  static get allFloors() {
    return [...this.floors, ...this.basement];
  }

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

    return this.basement[this.basement.length - 1];
  }

  static get activeFloor() {
    if (State.activeFloorNumber === null) {
      return this.lobby;
    }

    if (State.activeFloorNumber < 0) {
      return this.basement[State.activeFloorNumber * -1];
    }

    return this.floors[State.activeFloorNumber];
  }

  static renderFoundation() {
    const scale = State.scale();

    this.foundation = this.foundation
      ? this.foundation
      : new PIXI.TilingSprite(
          PIXI.Texture.from("cement.png"),
          window.innerWidth,
          160 * scale
        );

    this.foundation.width = State.app.screen.width;
    this.foundation.height = 160 * scale;

    this.foundation.tileScale.x = scale;
    this.foundation.tileScale.y = scale;

    this.foundation.position.set(
      0,
      this.lobby.position.y() + this.lobby.height() / 2
    );

    this.basement[0] = this.foundation;

    State.app.stage.addChild(this.foundation);
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
    const scale = State.scale();

    this.roof = this.roof ? this.roof : PIXI.Sprite.from("roof.png");

    this.roof.position.set(
      this.topFloor.position.x(),
      this.topFloor.room.position.y - this.topFloor.height() / 2 - 20 * scale
    );

    this.roof.scale.y = scale;
    this.roof.scale.x = scale;
    this.roof.anchor.set(0.5);

    this.roof.visible = false;

    State.app.stage.addChild(this.roof);
  }

  static renderCrane() {
    // Sorry for these magic numbers

    const scale = (() => {
      if (isSmallMobileSizedScreen()) {
        return 0.462;
      } else if (isMobileSizedScreen()) {
        return 0.5;
      } else if (isLargeSizedScreen()) {
        return 1;
      }

      return 0.625;
    })();

    this.crane = this.crane ? this.crane : State.spritesheets.crane;

    const offsetY = () => {
      if (isSmallMobileSizedScreen()) {
        return 103;
      }

      if (isMobileSizedScreen()) {
        return 112;
      }

      if (isLargeSizedScreen()) {
        return 224;
      }

      return 140;
    };

    const offsetX = () => {
      if (isSmallMobileSizedScreen()) {
        return 29;
      }

      if (isMobileSizedScreen()) {
        return 30;
      }

      if (isLargeSizedScreen()) {
        return 60;
      }

      return 38;
    };

    this.crane.position.set(
      this.roof.position.x + offsetX(),
      this.roof.position.y - offsetY()
    );

    this.crane.scale.y = scale;
    this.crane.scale.x = scale;
    this.crane.anchor.set(0.5);

    State.app.stage.addChild(this.crane);
  }

  static renderUndergroundFoundation() {
    const scale = State.scale();

    this.undergroundFoundation = this.undergroundFoundation
      ? this.undergroundFoundation
      : PIXI.Sprite.from("underground-foundation.png");

    this.undergroundFoundation.position.set(
      this.bottomFloor.position.x() - 5 * scale,
      this.bottomFloor.room.position.y + this.bottomFloor.height() + 150 * scale
    );

    this.undergroundFoundation.scale.y = scale;
    this.undergroundFoundation.scale.x = scale;
    this.undergroundFoundation.anchor.set(0.5);

    State.app.stage.addChild(this.undergroundFoundation);
  }

  static selectNextOrPreviousFloor(previous) {
    if (State.busy || !State.introFinished) {
      return;
    }

    const index = previous ? -1 : +1;

    let nextIndex = (State.activeFloorNumber || 0) + index;

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
