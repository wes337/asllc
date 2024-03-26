import { INTERFACE_SPRITES, SPRITES } from "../constants/sprites.js";
import { THANKS } from "../constants/chat.js";
import { getRandomElementFromArray, isMobileSizedScreen } from "../utils.js";
import Background from "./background.js";
import Building from "./building.js";
import Interface from "./interface.js";
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

  static movingAnimation = null;

  static controls = {
    show: false,
    downButton: PIXI.Sprite.from(INTERFACE_SPRITES["down-button"].src),
    upButton: PIXI.Sprite.from(INTERFACE_SPRITES["up-button"].src),
  };

  static {
    this.controls.downButton.id = "down";
    this.controls.downButton.eventMode = "static";
    this.controls.downButton.cursor = "pointer";
    this.controls.downButton.addListener(
      "pointerdown",
      this.startMoving.bind(this)
    );
    this.controls.downButton.addListener(
      "pointerup",
      this.stopMoving.bind(this)
    );

    this.controls.upButton.id = "up";
    this.controls.upButton.eventMode = "static";
    this.controls.upButton.cursor = "pointer";
    this.controls.upButton.addListener(
      "pointerdown",
      this.startMoving.bind(this)
    );
    this.controls.upButton.addListener("pointerup", this.stopMoving.bind(this));
  }

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

  static get personInside() {
    const personInElevator = State.people.find((person) => person.inElevator);
    return personInElevator || null;
  }

  static startMoving(event) {
    event.stopPropagation();

    if (!this.controls.show || this.moving || this.movingAnimation) {
      return;
    }

    this.moving = true;
    this.wheel.loop = true;
    this.wheel.play();

    const animation = (delta) => {
      const goingUp = event.target.id === "up";
      const amount = (goingUp ? -10 : 10) * delta;
      this.shaft.position.y += amount;

      const topFloorPosition = this.getFloorPosition(Building.topFloor);
      const bottomFloorPosition = this.getFloorPosition(Building.bottomFloor);

      if (this.shaft.position.y < topFloorPosition) {
        this.shaft.position.y = topFloorPosition;
      } else if (this.shaft.position.y > bottomFloorPosition) {
        this.shaft.position.y = bottomFloorPosition;
      } else {
        const pivot = State.app.stage.pivot.y + amount;
        State.app.stage.pivot.y = pivot;

        Background.pivot();
        Interface.render();
      }
    };

    this.movingAnimation = animation;
    State.app.ticker.add(this.movingAnimation);
  }

  static async stopMoving(event) {
    event.stopPropagation();
    const goingDown = event.target.id === "down";

    this.moving = false;
    this.wheel.loop = false;
    this.wheel.stop();

    if (this.movingAnimation) {
      State.app.ticker.remove(this.movingAnimation);
      this.movingAnimation = null;
    }

    let closestFloor = Building.floors[0];

    Building.allFloors.forEach((floor) => {
      const currentClosestFloorPosition = this.getFloorPosition(closestFloor);

      const offset = goingDown
        ? (this.shaft.height / 2) * -1
        : this.shaft.height / 2;

      const floorPosition = this.getFloorPosition(floor) + offset;

      if (
        Math.abs(this.shaft.position.y - floorPosition) <
        Math.abs(this.shaft.position.y - currentClosestFloorPosition)
      ) {
        closestFloor = floor;
      }
    });

    await this.gotoFloor(closestFloor.number);
    await this.elevatorFloor.moveCameraToFloor();

    if (
      this.personInside &&
      State.personWantsToGotoFloor &&
      State.personWantsToGotoFloor === this.elevatorFloorNumber
    ) {
      this.elevatorFloor.toggleIndicator(false);
      const thanks = getRandomElementFromArray(THANKS);
      this.personInside.chatBubble.show(thanks);
      await this.animateDoor();
      await this.personInside.enterRoom(this.elevatorFloorNumber);
      this.busy = false;
      State.personWantsToGotoFloor = null;
      this.controls.show = false;
    }
  }

  static getFloorPosition(floor) {
    try {
      const scale = State.scale();

      const offsetY = floor.basement ? 60 * scale : 30 * scale;

      return floor.basement
        ? floor.position.y() + SPRITES.cement.height * scale + offsetY
        : floor.position.y() + offsetY;
    } catch {
      // Do nothing
      return;
    }
  }

  static gotoFloor(floorNumber) {
    return new Promise((resolve) => {
      const targetFloor =
        floorNumber < 0
          ? Building.basement[floorNumber * -1]
          : Building.floors[floorNumber];

      const end = this.getFloorPosition(targetFloor);

      if (this.moving || this.elevatorFloorNumber === floorNumber) {
        this.shaft.position.y = end;
        resolve();
      } else {
        this.moving = true;

        this.wheel.loop = true;
        this.wheel.play();

        const animation = (delta) => {
          const current = this.getFloorPosition(this.elevatorFloor);

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
            this.shaft.position.y = end;
            resolve();
          }
        };

        State.app.ticker.add(animation);
      }
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

  static renderControls() {
    this.controls.upButton.visible = this.controls.show;
    this.controls.downButton.visible = this.controls.show;

    if (!this.controls.show) {
      return;
    }

    const scale = isMobileSizedScreen() ? State.scale() * 1.5 : State.scale();

    const scaledWidth = INTERFACE_SPRITES["down-button"].width * scale;
    const scaledHeight = INTERFACE_SPRITES["up-button"].height * scale;

    const margin = isMobileSizedScreen() ? 100 * scale : 50 * scale;

    const positionX = State.app.screen.width / 2;
    const positionY =
      State.app.screen.height -
      (Interface.artistInfo.show ? Interface.artistInfo.height() : 0) -
      Interface.navBar.height() -
      scaledHeight / 2 -
      margin +
      State.app.stage.pivot.y;

    const upButtonPositionX = positionX - scaledWidth / 2;
    this.controls.upButton.position.set(upButtonPositionX, positionY);
    this.controls.upButton.scale.y = scale;
    this.controls.upButton.scale.x = scale;
    this.controls.upButton.anchor.set(0.5);

    const downButtonPositionX = positionX + scaledWidth / 2;
    this.controls.downButton.position.set(downButtonPositionX, positionY);
    this.controls.downButton.scale.y = scale;
    this.controls.downButton.scale.x = scale;
    this.controls.downButton.anchor.set(0.5);

    State.app.stage.addChild(this.controls.upButton);
    State.app.stage.addChild(this.controls.downButton);
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
