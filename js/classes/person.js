import { SPRITE_METADATA } from "../constants/sprites.js";
import { randomNumberBetween } from "../utils.js";
import Interface from "./interface.js";
import Building from "./building.js";
import Elevator from "./elevator.js";
import ChatBubble from "./chat-bubble.js";
import State from "./state.js";

const getMetadata = (name) => {
  return SPRITE_METADATA[name] || null;
};

export default class Person {
  offsetY = 0;

  constructor(name) {
    this.name = name;
    this.floorNumber = null;
    this.originalFloorNumber = 0;
    this.inElevator = false;

    const sprites = State.spritesheets.people.animations[name];
    this.character = new PIXI.AnimatedSprite(sprites);
    this.highlight = false;

    this.destination = null;
    this.walkRandomly = true;
    this.metadata = getMetadata(name);
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
    return () => this.character.width;
  }

  get height() {
    return () => this.character.height;
  }

  get position() {
    return () => this.character.position;
  }

  get walking() {
    return (
      this.destination &&
      Math.floor(this.destination) !== Math.floor(this.character.position.x)
    );
  }

  get floor() {
    return Building.allFloors.find((floor) => floor && floor.id === this.name);
  }

  get currentFloor() {
    if (!this.floorNumber) {
      return Building.lobby;
    }

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

  enterRoom(floorNumber) {
    return new Promise((resolve) => {
      this.inElevator = false;
      this.floorNumber = floorNumber;
      this.destination = null;

      const scale = State.scale();
      const doorWidth = 60 * scale;
      const doorPosition = State.app.screen.width / 2 - doorWidth;
      this.character.position.x = doorPosition;

      setTimeout(() => {
        this.walkRandomly = true;
        resolve();
      }, 200);
    });
  }

  enterElevator() {
    return new Promise((resolve) => {
      this.walkRandomly = false;

      const animation = (delta) => {
        const scale = State.scale();
        const doorWidth = 60 * scale;
        const doorPosition = State.app.screen.width / 2 - doorWidth;
        this.destination = doorPosition;

        if (
          Math.floor(doorPosition) !== Math.floor(this.character.position.x)
        ) {
          this.updateDirection();
          this.character.play();
        } else {
          this.destination = null;
          this.character.stop();
          this.inElevator = true;
          this.updateDirection();
          State.app.ticker.remove(animation);
          resolve();
        }
      };

      State.app.ticker.add(animation);
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
    State.app.ticker.add((delta) => {
      this.render(delta);

      const chance = 0.005;
      const walkRandomly = this.walkRandomly && Math.random() < chance * delta;

      if (walkRandomly) {
        this.goToRandomDestination();
      }

      Interface.render(); // Maybe not?
    });
  }

  getCharacterHeightOffset() {
    const scale = State.scale();

    let offset = 0;

    const characterHeight = this.character.texture.height * 2;

    if (characterHeight === 260) {
      offset = 55 * scale;
    } else if (characterHeight === 240) {
      offset = 35 * scale;
    } else if (characterHeight === 220) {
      offset = 15 * scale;
    } else if (characterHeight === 200) {
      offset = -5 * scale;
    }

    return offset;
  }

  render(delta) {
    const scale = State.scale();

    if (this.inElevator) {
      this.character.scale.y = scale * 2;
      this.character.scale.x = scale * 2;
      this.character.anchor.set(0);
      this.character.position.x =
        Elevator.shaft.position.x - this.character.width / 2;

      let offset = this.getCharacterHeightOffset();

      this.character.position.y = Elevator.shaft.position.y - offset;
      this.destination = null;
      this.character.filters = this.filters || [];
      State.app.stage.addChild(this.character);
      return;
    }

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

    const groundHeight = 10 * scale;

    let positionY =
      this.currentFloor.room.position.y +
      this.currentFloor.room.height / 2 -
      this.height() / 2 -
      groundHeight;

    if (this.offsetY) {
      positionY = positionY - this.offsetY;
    }

    if (this.extra) {
      positionY = positionY - this.height() / 2;
    }

    const isUpsideDown = this.metadata && this.metadata.upsideDown;
    if (isUpsideDown) {
      positionY = positionY - this.height() * 1.5 + groundHeight * 3;
    }

    this.character.position.set(positionX, positionY);

    this.character.scale.y = scale * 2;
    this.character.scale.x =
      (this.direction === "left" ? scale : scale * -1) * 2;
    this.character.anchor.set(this.extra && !this.walkRandomly ? 0 : 0.5);
    this.character.animationSpeed = 0.1;
    this.character.loop = true;

    State.app.stage.addChild(this.character);

    this.character.filters = this.filters || [];
  }
}
