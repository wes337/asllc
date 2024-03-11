import { SPRITES } from "../constants/sprites.js";
import { FLOORS } from "../constants/floors.js";
import { DEFAULT_FONT_SIZE, FONT_SIZES } from "../constants/text.js";
import { CONTENT } from "../constants/content.js";
import { animateCamera } from "../animate.js";
import Elevator from "./elevator.js";
import Building from "./building.js";
import Interface from "./interface.js";
import state from "../state.js";

export default class Floor {
  constructor(index, id, basement) {
    this.name = FLOORS[id]?.name || id;
    this.index = index;
    this.basement = basement;
    this.container = new PIXI.Container();
    this.room = PIXI.Sprite.from(
      SPRITES[id]?.floor || SPRITES[id]?.src || SPRITES.floor.src
    );
    this.wall = PIXI.Sprite.from(SPRITES.wall.src);
    this.separator = PIXI.Sprite.from(SPRITES.separator.src);

    this.container.eventMode = "static";
    this.container.cursor = "pointer";

    this.container.addListener("pointertap", this.onClick.bind(this));

    this.rendered = false;
  }

  get number() {
    if (this.basement) {
      return this.index * -1;
    }

    return this.index;
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
      y: () => {
        return (
          state.app.screen.height -
          (SPRITES.wall.height / 2) * state.scale() -
          (SPRITES.separator.height / 2) * state.scale() -
          SPRITES.wall.height * state.scale() * this.number -
          Interface.bottomBar.height()
        );
      },
    };
  }

  get isActive() {
    return (
      state.activeFloorNumber && this.number === state.activeFloorNumber - 1
    );
  }

  onClick() {
    if (
      state.activeFloorNumber === this.number ||
      state.busy ||
      !state.introFinished
    ) {
      return;
    }

    if (this.name === "lobby") {
      animateCamera(state.camera.start());
    } else {
      const maxRoomsOnScreen = Math.floor(
        state.app.screen.height / this.room.height
      );

      let section = this.number / maxRoomsOnScreen;

      if (section >= 0 && section < 0.8) {
        section = 0;
      }

      let cameraPosition = Math.min(
        maxRoomsOnScreen *
          section *
          (this.room.height / (maxRoomsOnScreen / 4)) *
          -1,
        state.camera.min()
      );

      const numberFromTop = Building.floors.length - 1 - this.number;
      if (numberFromTop < maxRoomsOnScreen) {
        cameraPosition = cameraPosition - (this.room.height / 2) * this.number;
        cameraPosition =
          cameraPosition + state.app.screen.height * state.scale() * 4;
      }

      if (this.basement) {
        cameraPosition = cameraPosition * 1 + state.app.screen.height;
      }

      cameraPosition = Math.min(cameraPosition, state.camera.min());

      animateCamera(cameraPosition);
    }

    state.activeFloorNumber = this.number;

    Elevator.animateDoor();

    Interface.updateBottomBarText({
      text:
        this.name === "lobby" ? CONTENT.interface.bottomBar.default : this.name,
      size: this.name === "lobby" ? DEFAULT_FONT_SIZE() : FONT_SIZES.lg,
    });
  }

  render() {
    const scale = state.scale();

    let positionY = this.position.y();

    // This is really hacky but it's working...
    if (this.basement) {
      const offset = Math.floor(32 * state.scale());
      positionY =
        positionY + SPRITES.foundation.height * state.scale() + offset;
    }

    this.room.position.set(this.position.x() + Elevator.width, positionY);
    this.room.scale.y = scale;
    this.room.scale.x = scale;
    this.room.anchor.set(0.5);

    this.container.addChild(this.room);

    this.wall.position.set(this.position.x(), positionY);
    this.wall.scale.y = scale;
    this.wall.scale.x = scale;
    this.wall.anchor.set(0.5);

    this.container.addChild(this.wall);

    this.separator.position.set(
      this.position.x() + 1,
      positionY + this.height() / 2
    );
    this.separator.scale.y = scale;
    this.separator.scale.x = scale;
    this.separator.anchor.set(0.5);

    this.container.addChild(this.separator);

    state.app.stage.addChild(this.container);

    this.rendered = true;
  }
}
