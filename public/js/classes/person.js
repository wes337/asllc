import { SPRITES } from "../constants/sprites.js";
import { isLargeSizedScreen, randomNumberBetween } from "../utils.js";
import Interface from "./interface.js";
import Building from "./building.js";
import Elevator from "./elevator.js";
import state from "../state.js";

export default class Person {
  offsetY = 0;

  constructor(name) {
    this.name = name;
    this.floorNumber = 0;
    this.character = new PIXI.AnimatedSprite(
      SPRITES[name].src.map((img) => PIXI.Texture.from(img))
    );

    this.destination = null;
    this.walkRandomly = true;
    this.metadata = SPRITES[name].metadata;
    this.extra = this.metadata && this.metadata.extra;
    this.direction = this.extra
      ? "left"
      : Math.random() < 0.5
      ? "left"
      : "right";
  }

  set startingPosition(position) {
    const min = this.boundaries.min();
    const max = this.boundaries.max();

    if (position < min) {
      this.character.position.x = min;
    } else if (position > max) {
      this.character.position.x = max;
    } else {
      this.character.position.x = position;
    }
  }

  get width() {
    return () => SPRITES[this.name].width * state.scale();
  }

  get height() {
    return () => SPRITES[this.name].height * state.scale();
  }

  get walking() {
    return (
      this.destination &&
      this.destination !== Math.floor(this.character.position.x)
    );
  }

  get currentFloor() {
    if (this.floorNumber < 0) {
      return Building.basement[this.floorNumber * -1];
    }

    return Building.floors[this.floorNumber];
  }

  get boundaries() {
    const wallThickness = 100 * state.scale();

    return {
      min: () =>
        state.app.screen.width / 2 -
        (SPRITES.wall.width * state.scale()) / 2 +
        wallThickness * 4 +
        (this.extra ? 0 : 70 * state.scale()),

      max: () =>
        this.currentFloor.position.x() +
        this.currentFloor.width() / 2 +
        Elevator.width -
        this.width() * 2 -
        wallThickness,
    };
  }

  updateDirection() {
    this.direction =
      this.destination && this.destination < this.character.position.x
        ? "left"
        : "right";
  }

  goToRandomDestination() {
    if (this.walking || this.destination) {
      return;
    }

    const min = this.boundaries.min();
    const max = this.boundaries.max();

    const randomDestination = randomNumberBetween(min, max);

    this.destination = randomDestination;
  }

  animate() {
    state.app.ticker.add((delta) => {
      this.render(delta);

      const chance = 0.005;
      const walkRandomly = this.walkRandomly && Math.random() < chance * delta;

      if (walkRandomly) {
        this.goToRandomDestination();
      }

      Interface.render(); // Maybe not?
    });
  }

  render(delta) {
    const scale = state.scale();

    const min = this.boundaries.min();
    const max = this.boundaries.max();

    if (this.destination > max || this.destination < min) {
      this.destination = null;
    }

    let positionX = Math.max(this.character.position.x, min);

    if (this.walking) {
      this.updateDirection();
      const speed = randomNumberBetween(1, 5) / 10;
      const amount = this.direction === "right" ? speed : speed * -1;
      positionX += amount * delta;
      this.character.play();
    } else {
      this.character.stop();
      this.destination = null;
    }

    if (this.metadata && this.metadata.loop) {
      this.character.play();
    }

    positionX = Math.min(positionX, max);

    let positionY =
      this.currentFloor.separator.position.y -
      this.currentFloor.separator.height / 2 -
      this.height() / 2;

    if (this.offsetY) {
      positionY = positionY - this.offsetY;
    }

    if (this.extra) {
      positionY = positionY - this.height() / 2;
    }

    const isUpsideDown = this.metadata && this.metadata.upsideDown;
    if (isUpsideDown) {
      positionY =
        positionY -
        this.height() -
        this.currentFloor.separator.height +
        16 * scale;
    }

    this.character.position.set(positionX, positionY);

    this.character.scale.y = scale;
    this.character.scale.x = this.direction === "left" ? scale : scale * -1;
    this.character.anchor.set(this.extra && !this.walkRandomly ? 0 : 0.5);
    this.character.animationSpeed = 0.1;
    this.character.loop = true;

    state.app.stage.addChild(this.character);

    const highlight =
      !this.extra &&
      state.activeFloorNumber &&
      this.floorNumber === state.activeFloorNumber;

    const highlightSize = isLargeSizedScreen() ? 3 : 2;
    this.character.filters = highlight
      ? [state.filters.highlight(highlightSize)]
      : [];
  }
}
