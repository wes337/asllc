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

  static generator = PIXI.Sprite.from(SPRITES["elevator-generator"].src);
  static rope = [];

  static get inBasement() {
    return Building.activeFloor.number < 0;
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

    // Testing animation
    this.wheel.play();
  }

  static renderRope() {
    const scale = state.scale();

    const scaledWidth = SPRITES["elevator-rope"].width * scale;

    const offsetX = 90 * scale;
    const offsetY = 4;

    // How to animate this? Draw all and stack, or use scale
    [...Building.floors, ...Building.basement].forEach((floor, i) => {
      let rope = this.rope[i];

      if (Building.activeFloor.number <= floor.number) {
        rope = this.rope[i] || PIXI.Sprite.from(SPRITES["elevator-rope"].src);

        const positionX =
          floor.position.x() - floor.width() / 2 + scaledWidth / 2 + offsetX;

        let positionY = floor.position.y() + offsetY;

        if (Building.activeFloor.number === floor.number) {
          const overlap = 8;
          positionY = positionY - overlap;
        }

        if (this.inBasement) {
          positionY = positionY + SPRITES.foundation.height * scale;
        }

        rope.position.set(positionX, positionY);
        rope.scale.y = scale;
        rope.scale.x = scale;
        rope.anchor.set(0.5);

        // Hides the rope if the active floor is the top floor
        if (
          Building.activeFloor.number === floor.number &&
          Building.topFloor.number === floor.number
        ) {
          rope.scale.y = 0;
        }

        state.app.stage.addChild(rope);
      } else if (rope) {
        rope.scale.y = 0;
      }

      this.rope[i] = rope;
    });

    Building.renderFoundation();
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
    this.generator.scale.y = state.scale();
    this.generator.scale.x = state.scale();
    this.generator.anchor.set(0.5);

    state.app.stage.addChild(this.generator);
  }

  static renderShaft() {
    const scale = state.scale();

    const scaledWidth = SPRITES["elevator-shaft"].width * scale;
    const scaledHeight = SPRITES["elevator-shaft"].height * scale;

    const offsetX = 50 * scale;
    const offsetY = 112 * scale;

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
    const floorFromTop = Building.topFloor.number - Building.activeFloor.number;
    positionY = positionY + floorFromTop * Building.activeFloor.height();

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

  static animateDoor() {
    this.render();
    this.shaft.gotoAndPlay(0);
  }

  static render() {
    this.renderWheel();
    this.renderRope();
    this.renderGenerator();
    this.renderShaft();
  }
}
