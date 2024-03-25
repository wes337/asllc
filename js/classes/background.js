import { COLORS } from "../constants/colors.js";
import { SPRITES } from "../constants/sprites.js";
import { randomNumberBetween, isMobileSizedScreen } from "../utils.js";
import Interface from "./interface.js";
import State from "./state.js";

export default class Background {
  static sky = new PIXI.Graphics();
  static sun = PIXI.Sprite.from(SPRITES.sun.src);
  static clouds = [];
  static buildings = [];
  static ground = new PIXI.Graphics();
  static dirt = new PIXI.TilingSprite(
    PIXI.Texture.from(SPRITES.dirt.src),
    SPRITES.dirt.width,
    SPRITES.dirt.height
  );

  static pivot() {
    this.sky.position.y = this.sky.initialPosition.y + State.app.stage.pivot.y;
    this.sun.position.y = this.sun.initialPosition.y + State.app.stage.pivot.y;

    [...this.clouds].flat().forEach((cloud) => {
      cloud.position.y = cloud.initialPosition.y + State.app.stage.pivot.y;
    });
  }

  static renderSky() {
    this.sky.clear();

    const width = State.app.screen.width;
    const height = State.app.screen.height;

    const skySize = height / 4;
    const skyMidSize = skySize / 2;
    const stroke = 4;

    this.sky.beginFill(COLORS.darkBlue);
    this.sky.drawRect(0, 0, width, skySize);

    this.sky.beginFill(COLORS.blue);
    this.sky.drawRect(0, skySize - stroke * 2, width, stroke);
    this.sky.drawRect(0, skySize - stroke * 5, width, stroke);
    this.sky.drawRect(0, skySize, width, skyMidSize);

    this.sky.beginFill(COLORS.lightBlue);
    this.sky.drawRect(0, skySize + skyMidSize - stroke * 2, width, stroke);
    this.sky.drawRect(0, skySize + skyMidSize - stroke * 5, width, stroke);

    this.sky.endFill();

    this.sky.initialPosition = { x: 0, y: 0 };

    State.app.stage.addChild(this.sky);
  }

  static renderSun() {
    const scale = State.scale();

    const marginX = 16;
    const marginY = 8;
    const positionX =
      State.app.screen.width - (SPRITES.sun.width * scale) / 2 - marginX;
    const positionY = (SPRITES.sun.height * scale) / 2 + marginY;

    this.sun.initialPosition = { x: positionX, y: positionY };

    this.sun.position.set(positionX, positionY);
    this.sun.scale.y = scale;
    this.sun.scale.x = scale;
    this.sun.anchor.set(0.5);

    State.app.stage.addChild(this.sun);
  }

  static renderClouds() {
    const scale = State.scale();

    const ROWS = isMobileSizedScreen(State.app)
      ? [2, 2, 3, 2, 1, 1]
      : [4, 4, 3, 4, 3, 3];
    const ROW_OFFSET_X = [0, 128, 56, 8, 120, 288];
    const ROW_OFFSET_Y = [0, 28, 48, 72, 88, 72];
    const ROW_SIZES = ["xs", "xs", "sm", "md", "lg", "xl"];

    for (let i = 0; i < ROWS.length; i++) {
      this.clouds[i] = this.clouds[i] || [];

      for (let j = 0; j < ROWS[i]; j++) {
        let cloud;

        if (this.clouds[i][j]) {
          cloud = this.clouds[i][j];
        } else {
          const size = ROW_SIZES[i];
          cloud = PIXI.Sprite.from(SPRITES[`cloud-${size}`].src);
          cloud.reverse = false;
          this.clouds[i][j] = cloud;
        }

        const numberOfClouds = ROWS[i];

        const marginX = 48 - ROW_OFFSET_X[i];
        const marginY = 32 - ROW_OFFSET_Y[i];
        const positionX =
          SPRITES["cloud-xs"].width +
          (State.app.screen.width / numberOfClouds) * j +
          1 -
          marginX;
        const positionY = State.app.screen.height / 4 - marginY;

        cloud.initialPosition = { x: positionX, y: positionY };

        cloud.position.set(positionX, positionY);
        cloud.scale.y = scale;
        cloud.scale.x = scale;
        cloud.anchor.set(0.5);

        State.app.stage.addChild(cloud);
      }
    }
  }

  static renderBuildings() {
    const scale = State.scale();

    const NUMBER_OF_BUILDINGS = 2;

    for (let i = 0; i < NUMBER_OF_BUILDINGS; i++) {
      const image =
        i === 0 ? SPRITES["building-green"] : SPRITES["building-red"];

      const building = this.buildings[i] || PIXI.Sprite.from(image.src);

      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;
      const margin = 24;
      const breakpointX =
        State.app.screen.width <= scaledWidth * NUMBER_OF_BUILDINGS + margin;
      const breakpointY = State.app.screen.height < scaledHeight + margin;

      let positionX = 0;

      if (i === 0) {
        positionX = breakpointX
          ? (positionX = scaledWidth / 4 - margin * 10)
          : scaledWidth / 2 - margin;
      } else if (i === 1) {
        positionX = breakpointX
          ? State.app.screen.width - scaledWidth / 4 + margin * 10
          : State.app.screen.width - scaledWidth / 2 + margin;
      }

      let positionY =
        State.app.screen.height -
        (image.height / 2) * scale -
        Interface.navBar.height();

      if (breakpointY) {
        positionY = State.app.screen.height + margin;
      }

      building.initialPosition = { x: positionX, y: positionY };

      building.position.set(positionX, positionY);
      building.scale.y = scale;
      building.scale.x = scale;
      building.anchor.set(0.5);

      State.app.stage.addChild(building);

      this.buildings[i] = building;
    }
  }

  static renderGround() {
    const scale = State.scale();

    this.ground.clear();

    const width = State.app.screen.width;
    const height = State.app.screen.height * 2;
    const positionY = State.app.screen.height - Interface.navBar.height();

    this.ground.beginFill(COLORS.brown);
    this.ground.drawRect(0, positionY, width, height);
    this.ground.endFill();

    State.app.stage.addChild(this.ground);

    this.dirt.width = State.app.screen.width;
    this.dirt.height = SPRITES.dirt.height * scale;

    this.dirt.tileScale.x = scale;
    this.dirt.tileScale.y = scale;

    this.dirt.position.set(0, positionY + SPRITES.dirt.height * scale);

    State.app.stage.addChild(this.dirt);
  }

  static animateClouds() {
    const clouds = this.clouds.flat();

    clouds.forEach((cloud) => {
      State.app.ticker.add((delta) => {
        if (cloud.position.x >= State.app.screen.width) {
          cloud.reverse = true;
        } else if (cloud.position.x <= 0) {
          cloud.reverse = false;
        }

        let movement = (randomNumberBetween(1, 10) / 1000) * delta;

        if (cloud.reverse) {
          movement = movement * -1;
        }

        cloud.position.x += movement;
      });
    });
  }

  static render() {
    this.renderSky();
    this.renderSun();
    this.renderClouds();
    this.renderBuildings();
    this.renderGround();
    this.pivot();
  }
}
