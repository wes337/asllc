import { SPRITES } from "../constants/sprites.js";
import { isLargeSizedScreen, randomNumberBetween } from "../utils.js";
import Interface from "./interface.js";
import Building from "./building.js";
import Elevator from "./elevator.js";
import ChatBubble from "./chat-bubble.js";
import state from "../state.js";

export default class Person {
  offsetY = 0;

  constructor(name) {
    this.name = name;
    this.floorNumber = 0;
    this.inElevator = false;
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

    this.chatBubble = new ChatBubble(this);
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

  get position() {
    return () => this.character.position;
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

  get inBasement() {
    return this.floorNumber < 0;
  }

  get boundaries() {
    return {
      min: () =>
        this.currentFloor.position.x() -
        this.currentFloor.width() / 2 +
        (this.extra ? 0 : this.width() / 2) +
        this.currentFloor.leftWall.width,

      max: () =>
        this.currentFloor.position.x() +
        this.currentFloor.width() / 2 -
        this.width() / 2 -
        this.currentFloor.rightWall.width,
    };
  }

  updateDirection() {
    if (this.inElevator || this.extra) {
      this.direction = "left";
    }

    this.direction =
      this.destination && this.destination < this.character.position.x
        ? "left"
        : "right";
  }

  enterLobby() {
    return new Promise((resolve) => {
      this.inElevator = false;
      this.floorNumber = 0;
      this.destination = null;

      const scale = state.scale();
      const doorWidth = 60 * scale;
      const doorPosition = state.app.screen.width / 2 - doorWidth;
      this.character.position.x = doorPosition;

      setTimeout(() => {
        this.walkRandomly = true;
        resolve();
      }, 200);
    });
  }

  leaveRoom() {
    return new Promise((resolve) => {
      this.walkRandomly = false;

      const animation = (delta) => {
        const scale = state.scale();
        const doorWidth = 60 * scale;
        const doorPosition = state.app.screen.width / 2 - doorWidth;
        this.destination = doorPosition;

        if (doorPosition !== Math.floor(this.character.position.x)) {
          const min = this.boundaries.min();
          let positionX = Math.max(this.character.position.x, min);
          this.updateDirection();
          const speed = randomNumberBetween(4, 5) / 10;
          const amount = this.direction === "right" ? speed : speed * -1;
          positionX += amount * delta;
          this.character.play();
        } else {
          this.destination = null;
          this.character.stop();
          this.inElevator = true;
          this.updateDirection();
          state.app.ticker.remove(animation);
          resolve();
        }
      };

      state.app.ticker.add(animation);
    });
  }

  goToRandomDestination() {
    if (this.walking || this.destination || this.inElevator) {
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
      this.height() / 2 -
      10 * scale;

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

    if (this.inElevator) {
      this.character.position.x =
        Building.lobby.position.x() -
        Building.lobby.width() / 2 +
        this.character.width +
        Elevator.width / 2;

      this.character.position.y =
        Elevator.shaft.position.y + 120 * scale - this.character.height / 8;

      this.character.loop = false;
      this.destination = null;
    }
  }
}
