import { SPRITES } from "../constants/sprites.js";
import Building from "./building.js";
import State from "./state.js";

export default class Elevator {
  static shaft = new PIXI.AnimatedSprite(
    SPRITES["elevator-shaft"].src.map((img) => PIXI.Texture.from(img))
  );

  static wheel = new PIXI.AnimatedSprite(
    SPRITES["elevator-wheel"].src.map((img) => PIXI.Texture.from(img))
  );

  static bricks = PIXI.Sprite.from(SPRITES["elevator-bricks"].src);
  static connector = PIXI.Sprite.from(SPRITES["underground-connector"].src);
  static generator = PIXI.Sprite.from(SPRITES["elevator-generator"].src);
  static rope = [];
  static elevatorFloorNumber = 0;
  static busy = false;
  static moving = false;

  static get inBasement() {
    return this.elevatorFloorNumber < 0;
  }

  static get elevatorFloor() {
    if (this.elevatorFloorNumber < 0) {
      return Building.basement[this.elevatorFloorNumber * -1];
    }

    return Building.floors[this.elevatorFloorNumber];
  }

  static get width() {
    return 145 * State.scale();
  }

  static getFloorPosition(floor) {
    const scale = State.scale();

    const offsetY = floor.basement ? 60 * scale : 30 * scale;

    return floor.basement
      ? floor.position.y() + SPRITES.cement.height * scale + offsetY
      : floor.position.y() + offsetY;
  }

  static gotoFloor(floorNumber) {
    return new Promise((resolve) => {
      if (this.moving) {
        return;
      }

      this.moving = true;

      this.wheel.loop = true;
      this.wheel.play();

      const animation = (delta) => {
        const current = this.getFloorPosition(this.elevatorFloor);

        const targetFloor =
          floorNumber < 0
            ? Building.basement[floorNumber * -1]
            : Building.floors[floorNumber];

        const end = this.getFloorPosition(targetFloor);

        const goingDown = current <= end;

        const amount = goingDown ? 10 : -10;

        this.shaft.position.y += amount * delta;

        const finished = goingDown
          ? this.shaft.position.y >= end
          : this.shaft.position.y <= end;

        if (finished) {
          State.app.ticker.remove(animation);
          this.elevatorFloorNumber = floorNumber;
          this.wheel.loop = false;
          this.wheel.gotoAndPlay(0);
          this.moving = false;
          resolve();
        }
      };

      State.app.ticker.add(animation);
    });
  }

  static renderWheel() {
    const scaledWidth = SPRITES["elevator-wheel"].width * State.scale();
    const scaledHeight = SPRITES["elevator-wheel"].height * State.scale();

    const offsetX = 100 * State.scale();
    const offsetY = 110 * State.scale();

    const positionX =
      Building.topFloor.position.x() -
      Building.topFloor.width() / 2 +
      scaledWidth / 2 +
      offsetX;

    const positionY =
      Building.topFloor.position.y() -
      Building.topFloor.height() / 2 +
      scaledHeight +
      offsetY;

    this.wheel.position.set(positionX, positionY);
    this.wheel.scale.y = State.scale();
    this.wheel.scale.x = State.scale();
    this.wheel.anchor.set(0.5);
    this.wheel.animationSpeed = 0.5;

    State.app.stage.addChild(this.wheel);
  }

  static renderRope() {
    const scale = State.scale();

    const scaledWidth = SPRITES["elevator-rope"].width * scale;

    const offsetX = 70 * scale;

    Building.allFloors.forEach((floor, i) => {
      if (typeof floor.position.x !== "function") {
        return;
      }

      let rope = this.rope[i] || PIXI.Sprite.from(SPRITES["elevator-rope"].src);

      const positionX =
        floor.position.x() - floor.width() / 2 + scaledWidth / 2 + offsetX;

      let positionY = floor.position.y() + SPRITES.cement.height * scale;

      rope.position.set(positionX, positionY);
      rope.scale.y = scale;
      rope.scale.x = scale;
      rope.anchor.set(0.5);

      State.app.stage.addChild(rope);

      this.rope[i] = rope;
    });
  }

  static renderGenerator() {
    const scale = State.scale();

    const scaledWidth = SPRITES["elevator-generator"].width * scale;
    const scaledHeight = SPRITES["elevator-generator"].height * scale;

    const offsetX = 30 * scale;
    const offsetY = 0;

    const positionX =
      Building.topFloor.position.x() -
      Building.topFloor.width() / 2 +
      scaledWidth / 2 +
      offsetX;

    const positionY =
      Building.topFloor.position.y() -
      Building.topFloor.height() / 2 +
      scaledHeight / 2 +
      offsetY;

    this.generator.position.set(positionX, positionY);
    this.generator.scale.y = scale;
    this.generator.scale.x = scale;
    this.generator.anchor.set(0.5);

    State.app.stage.addChild(this.generator);
  }

  static renderShaft() {
    const scale = State.scale();

    const scaledWidth = SPRITES["elevator-shaft"].width * scale;

    const offsetX = 30 * scale;

    const positionX =
      this.elevatorFloor.position.x() -
      this.elevatorFloor.width() / 2 +
      scaledWidth / 2 +
      offsetX;

    const positionY = this.getFloorPosition(this.elevatorFloor);

    this.shaft.position.set(positionX, positionY);
    this.shaft.scale.y = scale;
    this.shaft.scale.x = scale;
    this.shaft.anchor.set(0.5);
    this.shaft.animationSpeed = 0.2;
    this.shaft.loop = false;

    State.app.stage.addChild(this.shaft);
  }

  static renderBricks() {
    const scale = State.scale();

    const scaledWidth = SPRITES["elevator-bricks"].width * scale;
    const scaledHeight = SPRITES["elevator-bricks"].height * scale;

    const offsetX = 10 * scale;

    const positionX =
      Building.topFloor.position.x() -
      Building.topFloor.width() / 2 +
      scaledWidth / 2 -
      offsetX;

    const positionY = Building.foundation.position.y + scaledHeight / 2;

    this.bricks.position.set(positionX, positionY);
    this.bricks.scale.y = scale;
    this.bricks.scale.x = scale;
    this.bricks.anchor.set(0.5);

    State.app.stage.addChild(this.bricks);
  }

  static renderConnector() {
    const scale = State.scale();

    const scaledWidth = SPRITES["underground-connector"].width * scale;
    const scaledHeight = SPRITES["underground-connector"].height * scale;

    const positionX =
      Building.topFloor.position.x() +
      Building.topFloor.width() / 2 -
      scaledWidth / 2;

    const positionY = Building.foundation.position.y + scaledHeight / 2 + 1;

    this.connector.position.set(positionX, positionY);
    this.connector.scale.y = scale;
    this.connector.scale.x = scale;
    this.connector.anchor.set(0.5);

    this.connector.height = scaledHeight + 2;

    State.app.stage.addChild(this.connector);
  }

  static animateDoor() {
    return new Promise((resolve) => {
      this.render();
      this.shaft.gotoAndPlay(0);

      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  static animateWheel() {
    this.render();
    this.wheel.gotoAndPlay(0);
  }

  static render() {
    this.renderWheel();
    this.renderBricks();
    this.renderConnector();
    this.renderRope();
    this.renderGenerator();
    this.renderShaft();
  }
}
