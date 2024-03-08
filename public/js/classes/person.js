import { SPRITES } from "../constants/sprites.js";
import { randomNumberBetween } from "../utils.js";
import Interface from "./interface.js";
import Building from "./building.js";
import Elevator from "./elevator.js";
import state from "../state.js";

export default class Person {
  constructor(name) {
    this.name = name;
    this.floorNumber = 0;
    this.character = new PIXI.AnimatedSprite(
      SPRITES[name].src.map((img) => PIXI.Texture.from(img))
    );

    this.direction = Math.random() < 0.5 ? "left" : "right";
    this.destination = null;
    this.walkRandomly = true;
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
    return Building.floors[this.floorNumber];
  }

  get boundaries() {
    const wallThickness = 10;

    return {
      min: () =>
        this.currentFloor.position.x() -
        this.currentFloor.width() / 2 +
        Elevator.width +
        this.width() * 2 +
        wallThickness,

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

    positionX = Math.min(positionX, max);

    const positionY =
      this.currentFloor.separator.position.y -
      this.currentFloor.separator.height / 2 -
      this.height() / 2;

    this.character.position.set(positionX, positionY);

    this.character.scale.y = scale;
    this.character.scale.x = this.direction === "left" ? scale : scale * -1;
    this.character.anchor.set(0.5);
    this.character.animationSpeed = 0.1;
    this.character.loop = true;

    state.app.stage.addChild(this.character);

    const highlight =
      state.activeFloorNumber && this.floorNumber === state.activeFloorNumber;

    this.character.filters = highlight ? [state.filters.highlight] : [];
  }
}
