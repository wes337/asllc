import { SPRITES } from "../constants/sprites.js";
import Building from "./building.js";
import state from "../state.js";

export default class Elevator {
  static shaft = new PIXI.AnimatedSprite(
    SPRITES["elevator-shaft"].src.map((img) => PIXI.Texture.from(img))
  );

  static wheel = new PIXI.AnimatedSprite(
    SPRITES["elevator-wheel"].src.map((img) => PIXI.Texture.from(img))
  );

  static bricks = PIXI.Sprite.from(SPRITES["elevator-bricks"].src);
  static generator = PIXI.Sprite.from(SPRITES["elevator-generator"].src);
  static rope = [];
  static elevatorFloorNumber = 0;

  static get inBasement() {
    return this.elevatorFloorNumber < 0;
  }

  static get elevatorFloor() {
    return Building.floors[this.elevatorFloorNumber];
  }

  static get width() {
    return 145 * state.scale();
  }

  static renderWheel() {
    const scaledWidth = SPRITES["elevator-wheel"].width * state.scale();
    const scaledHeight = SPRITES["elevator-wheel"].height * state.scale();

    const offsetX = 120 * state.scale();
    const offsetY = 140 * state.scale();

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
    this.wheel.scale.y = state.scale();
    this.wheel.scale.x = state.scale();
    this.wheel.anchor.set(0.5);
    this.wheel.animationSpeed = 0.5;

    state.app.stage.addChild(this.wheel);
  }

  static renderRope() {
    const scale = state.scale();

    const scaledWidth = SPRITES["elevator-rope"].width * scale;

    const offsetX = 90 * scale;

    // How to animate this? Draw all and stack, or use scale
    Building.allFloors.forEach((floor, i) => {
      if (typeof floor.position.x !== "function") {
        return;
      }

      let rope = this.rope[i] || PIXI.Sprite.from(SPRITES["elevator-rope"].src);

      const positionX =
        floor.position.x() - floor.width() / 2 + scaledWidth / 2 + offsetX;

      let positionY = floor.position.y() + SPRITES.foundation.height * scale;

      const isTopFloor = Building.topFloor.number === floor.number;
      if (isTopFloor) {
        positionY = positionY + 8;
      }

      rope.position.set(positionX, positionY);
      rope.scale.y = scale;
      rope.scale.x = scale;
      rope.anchor.set(0.5);

      state.app.stage.addChild(rope);

      this.rope[i] = rope;
    });
  }

  static renderGenerator() {
    const scale = state.scale();

    const scaledWidth = SPRITES["elevator-generator"].width * scale;
    const scaledHeight = SPRITES["elevator-generator"].height * scale;

    const offsetX = 50 * scale;
    const offsetY = 4;

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

    state.app.stage.addChild(this.generator);
  }

  static renderShaft() {
    const scale = state.scale();

    const scaledWidth = SPRITES["elevator-shaft"].width * scale;
    const scaledHeight = SPRITES["elevator-shaft"].height * scale;

    const offsetX = 50 * scale;
    const offsetY = 124 * scale;

    const positionX =
      Building.topFloor.position.x() -
      Building.topFloor.width() / 2 +
      scaledWidth / 2 +
      offsetX;

    let positionY =
      Building.topFloor.position.y() -
      Building.topFloor.height() / 2 +
      scaledHeight -
      offsetY;

    // Animate this
    const floorFromTop = Building.topFloor.number - this.elevatorFloorNumber;
    positionY = positionY + floorFromTop * this.elevatorFloor.height();

    if (this.inBasement) {
      positionY = positionY + SPRITES.foundation.height * scale + 4;
    }

    this.shaft.position.set(positionX, positionY);
    this.shaft.scale.y = scale;
    this.shaft.scale.x = scale;
    this.shaft.anchor.set(0.5);
    this.shaft.animationSpeed = 0.5;
    this.shaft.loop = false;

    state.app.stage.addChild(this.shaft);
  }

  static renderBricks() {
    const scale = state.scale();

    const scaledWidth = SPRITES["elevator-bricks"].width * scale;
    const scaledHeight = SPRITES["elevator-bricks"].height * scale;

    const offsetX = 10 * scale;

    const positionX =
      Building.topFloor.position.x() -
      Building.topFloor.width() / 2 +
      scaledWidth / 2 +
      offsetX;

    const positionY = Building.foundation.position.y + scaledHeight / 2;

    this.bricks.position.set(positionX, positionY);
    this.bricks.scale.y = scale;
    this.bricks.scale.x = scale;
    this.bricks.anchor.set(0.5);

    state.app.stage.addChild(this.bricks);
  }

  static animateDoor() {
    this.render();
    this.shaft.gotoAndPlay(0);
  }

  static animateWheel() {
    this.render();
    this.wheel.gotoAndPlay(0);
  }

  static render() {
    this.renderWheel();
    this.renderBricks();
    this.renderRope();
    this.renderGenerator();
    this.renderShaft();
  }
}
