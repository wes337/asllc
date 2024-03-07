import { SPRITES } from "../constants/sprites.js";
import Elevator from "./elevator.js";
import state from "../state.js";

export default class Floor {
  constructor(index, name) {
    this.index = index;
    this.room = PIXI.Sprite.from(
      SPRITES[name]?.floor || SPRITES[name]?.src || SPRITES.floor.src
    );
    this.wall = PIXI.Sprite.from(SPRITES.wall.src);
    this.separator = PIXI.Sprite.from(SPRITES.separator.src);

    this.room.eventMode = "static";
    this.room.cursor = "pointer";

    this.room.addListener("pointerdown", this.onClick.bind(this));
  }

  get width() {
    return () => SPRITES.wall.width * state.scale();
  }

  get height() {
    return () => SPRITES.wall.height * state.scale();
  }

  get position() {
    return {
      x: () => state.app.screen.width / 2,
      y: () =>
        state.app.screen.height -
        (SPRITES.wall.height / 2) * state.scale() -
        (SPRITES.separator.height / 2) * state.scale() -
        SPRITES.wall.height * state.scale() * this.index,
    };
  }

  onClick() {
    state.activeFloorNumber = this.index;
    Elevator.animateDoor();

    state.container.pivot.y += 1;
  }

  render() {
    const scale = state.scale();

    this.room.position.set(
      this.position.x() + Elevator.width,
      this.position.y()
    );
    this.room.scale.y = scale;
    this.room.scale.x = scale;
    this.room.anchor.set(0.5);

    state.app.stage.addChild(this.room);

    this.wall.position.set(this.position.x(), this.position.y());
    this.wall.scale.y = scale;
    this.wall.scale.x = scale;
    this.wall.anchor.set(0.5);

    state.app.stage.addChild(this.wall);

    this.separator.position.set(
      this.position.x() + 1,
      this.position.y() + this.height() / 2
    );
    this.separator.scale.y = scale;
    this.separator.scale.x = scale;
    this.separator.anchor.set(0.5);

    state.app.stage.addChild(this.separator);
  }
}
