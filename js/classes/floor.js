import { SPRITES } from "../constants/sprites.js";
import { GREETINGS } from "../constants/chat.js";
import { FLOORS } from "../constants/floors.js";
import { DEFAULT_FONT_SIZE, TEXT_STYLES } from "../constants/text.js";
import { getRandomElementFromArray } from "../utils.js";
import { animateCamera } from "../animate.js";
import Elevator from "./elevator.js";
import Interface from "./interface.js";
import Modal from "./modal.js";
import State from "./state.js";

export default class Floor {
  constructor(index, id, basement) {
    this.id = id;
    this.name = FLOORS[id]?.name || id;
    this.index = index;
    this.basement = basement;
    this.container = new PIXI.Container();

    const sprites = SPRITES[id]?.floor || SPRITES[id]?.src || SPRITES.floor.src;
    const animated = Array.isArray(sprites);
    this.animated = animated;

    this.room = animated
      ? new PIXI.AnimatedSprite(
          sprites.map((_, i) => {
            return PIXI.Texture.from(`${id}-floor-${i + 1}.png`);
          })
        )
      : PIXI.Sprite.from(`${id}-floor.png`);

    this.leftWall = PIXI.Sprite.from("left-wall.png");
    this.rightWall = basement
      ? PIXI.Sprite.from("underground-wall.png")
      : PIXI.Sprite.from("right-wall.png");
    this.separator = PIXI.Sprite.from("separator.png");
    this.numberText = new PIXI.Text("", {
      ...TEXT_STYLES.default,
    });

    this.indicator = PIXI.Sprite.from("indicator.png");

    this.container.eventMode = "static";
    this.container.cursor = "pointer";
    this.container.addListener("pointertap", this.onClick.bind(this));
  }

  get number() {
    if (this.basement) {
      return this.index * -1;
    }

    return this.index;
  }

  personOnFloor() {
    return State.people.find(
      (person) => person.floorNumber === this.number && person.name === this.id
    );
  }

  get width() {
    return () => 1720 * State.scale();
  }

  get height() {
    return () => 550 * State.scale();
  }

  get position() {
    return {
      x: () => State.app.screen.width / 2,
      y: () => {
        return (
          State.app.screen.height -
          this.height() / 2 -
          (SPRITES.separator.height / 2) * State.scale() -
          this.height() * this.number -
          Interface.navBar.height()
        );
      },
    };
  }

  get isActive() {
    return State.activeFloorNumber && this.number === State.activeFloorNumber;
  }

  // This is really hacky but it's working...
  get positionYOffset() {
    const scale = State.scale();

    let positionY = this.position.y();

    if (this.basement) {
      const offset = Math.floor(32 * scale);
      positionY = positionY + SPRITES.cement.height * scale + offset;
    } else {
      // positionY = positionY + (SPRITES.cement.height / 2) * scale;
    }

    return positionY;
  }

  async moveCameraToFloor(instant) {
    const maxFloorsOnScreen = Math.floor(
      State.app.screen.height / this.room.height
    );

    const section = this.number / maxFloorsOnScreen;

    let cameraPosition = maxFloorsOnScreen * section * this.room.height * -1;
    cameraPosition = cameraPosition - this.room.height / 2;
    cameraPosition = cameraPosition + State.app.screen.height / 2;

    if (this.basement) {
      cameraPosition = cameraPosition * 1;
    }

    await animateCamera(cameraPosition, instant);
  }

  async onClick() {
    if (State.busy || !State.introFinished || Modal.visible) {
      return;
    }

    await this.moveCameraToFloor();

    State.activeFloorNumber = this.number;

    const person = this.personOnFloor();
    if (person) {
      const randomMessage = getRandomElementFromArray(GREETINGS.all);
      person.chatBubble.show(randomMessage);
    }

    Interface.setArtistInfo(this.id);
  }

  toggleIndicator(visible) {
    if (!State.personWantsToGotoFloor) {
      this.indicator.visible = false;
      this.indicator.filters = [State.filters.adjustment({ opacity: 0 })];
    } else {
      this.indicator.visible = visible;
      this.indicator.filters = [];
    }
  }

  renderSeparator() {
    const scale = State.scale();

    let positionY = this.positionYOffset;

    this.separator.position.set(
      this.position.x() - 5 * scale,
      positionY + this.height() / 2
    );

    this.separator.scale.y = scale;
    this.separator.scale.x = scale;
    this.separator.anchor.set(0.5);
    this.container.addChild(this.separator);
  }

  render() {
    const scale = State.scale();

    let positionY = this.positionYOffset;

    // Room
    this.room.position.set(
      this.position.x() + Elevator.width - 10 * scale,
      positionY - 30 * scale
    );
    this.room.scale.y = scale;
    this.room.scale.x = scale;
    this.room.anchor.set(0.5);
    this.container.addChild(this.room);

    // Left wall
    const leftWallOffset = 680 * scale;
    this.leftWall.position.set(
      this.position.x() - leftWallOffset,
      positionY - 30 * scale
    );
    this.leftWall.scale.y = scale;
    this.leftWall.scale.x = scale;
    this.leftWall.anchor.set(0.5);
    this.container.addChild(this.leftWall);

    // Right wall
    const rightWallOffset = 810 * scale;
    this.rightWall.position.set(
      this.position.x() + rightWallOffset,
      positionY - 30 * scale
    );
    this.rightWall.scale.y = scale;
    this.rightWall.scale.x = scale;
    this.rightWall.anchor.set(0.5);
    this.container.addChild(this.rightWall);

    this.renderSeparator();

    // Floor number
    const floorNumber = this.basement ? this.number : this.number + 1;

    this.numberText.text = floorNumber;
    this.numberText.style.fontSize = DEFAULT_FONT_SIZE();

    let floorNumberPositionX =
      this.position.x() - this.width() / 2 + Elevator.width;

    if (floorNumber < 10 && floorNumber >= 0) {
      const amount = 20;
      floorNumberPositionX = floorNumberPositionX + amount * scale;
    } else if (floorNumber < 0) {
      const amount = -10;
      floorNumberPositionX = floorNumberPositionX + amount * scale;
    }

    const floorNumberPositionY = positionY + 85 * scale;
    this.numberText.position.set(floorNumberPositionX, floorNumberPositionY);
    this.container.addChild(this.numberText);

    // Indicator
    let indicatorPositionY = this.positionYOffset + 85 * scale - 30 * scale;
    let indicatorPositionX = floorNumberPositionX + 30 * scale;

    if (floorNumber < 10 && floorNumber >= 0) {
      const amount = -20;
      indicatorPositionX = indicatorPositionX + amount * scale;
    } else if (floorNumber < 0) {
      const amount = 10;
      indicatorPositionX = indicatorPositionX + amount * scale;
    }

    this.indicator.position.set(indicatorPositionX, indicatorPositionY);
    this.indicator.scale.y = scale;
    this.indicator.scale.x = scale;
    this.indicator.anchor.set(0.5);
    this.indicator.visible = this.isActive;

    this.container.addChild(this.indicator);

    State.app.stage.addChild(this.container);

    if (this.animated) {
      this.room.animationSpeed = 0.05;
      this.room.play();
    }
  }
}
