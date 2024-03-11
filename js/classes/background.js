import { COLORS } from "../constants/colors.js";
import { SPRITES } from "../constants/sprites.js";
import { randomNumberBetween, isMobileSizedScreen } from "../utils.js";
import Interface from "./interface.js";
import state from "../state.js";

export default class Background {
  static sky = new PIXI.Graphics();
  static sun = PIXI.Sprite.from(SPRITES.sun.src);
  static clouds = [];
  static buildings = [];
  static ground = new PIXI.Graphics();

  static pivot() {
    this.sky.position.y = this.sky.initialPosition.y + state.app.stage.pivot.y;
    this.sun.position.y = this.sun.initialPosition.y + state.app.stage.pivot.y;

    [...this.clouds].flat().forEach((cloud) => {
      cloud.position.y = cloud.initialPosition.y + state.app.stage.pivot.y;
    });
  }

  static renderSky() {
    this.sky.clear();

    const width = state.app.screen.width;
    const height = state.app.screen.height;

    const skySize = height / 4;
    const skyMidSize = skySize / 2;
    const stroke = 4;

    this.sky.beginFill(COLORS.skyDark);
    this.sky.drawRect(0, 0, width, skySize);

    this.sky.beginFill(COLORS.sky);
    this.sky.drawRect(0, skySize - stroke * 2, width, stroke);
    this.sky.drawRect(0, skySize - stroke * 5, width, stroke);
    this.sky.drawRect(0, skySize, width, skyMidSize);

    this.sky.beginFill(COLORS.skyLight);
    this.sky.drawRect(0, skySize + skyMidSize - stroke * 2, width, stroke);
    this.sky.drawRect(0, skySize + skyMidSize - stroke * 5, width, stroke);

    this.sky.endFill();

    this.sky.initialPosition = { x: 0, y: 0 };

    state.app.stage.addChild(this.sky);
  }

  static renderSun() {
    const scale = state.scale();

    const marginX = 16;
    const marginY = 8;
    const positionX =
      state.app.screen.width - (SPRITES.sun.width * scale) / 2 - marginX;
    const positionY = (SPRITES.sun.height * scale) / 2 + marginY;

    this.sun.initialPosition = { x: positionX, y: positionY };

    this.sun.position.set(positionX, positionY);
    this.sun.scale.y = scale;
    this.sun.scale.x = scale;
    this.sun.anchor.set(0.5);

    state.app.stage.addChild(this.sun);
  }

  static renderClouds() {
    const scale = state.scale();

    const ROWS = isMobileSizedScreen(state.app)
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
          (state.app.screen.width / numberOfClouds) * j +
          1 -
          marginX;
        const positionY = state.app.screen.height / 4 - marginY;

        cloud.initialPosition = { x: positionX, y: positionY };

        cloud.position.set(positionX, positionY);
        cloud.scale.y = scale;
        cloud.scale.x = scale;
        cloud.anchor.set(0.5);

        state.app.stage.addChild(cloud);
      }
    }
  }

  static renderBuildings() {
    const scale = state.scale();

    const NUMBER_OF_BUILDINGS = 2;

    for (let i = 0; i < NUMBER_OF_BUILDINGS; i++) {
      const image =
        i === 0 ? SPRITES["building-green"] : SPRITES["building-red"];

      const building = this.buildings[i] || PIXI.Sprite.from(image.src);

      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;
      const margin = 24;
      const breakpointX =
        state.app.screen.width <= scaledWidth * NUMBER_OF_BUILDINGS + margin;
      const breakpointY = state.app.screen.height < scaledHeight + margin;

      let positionX = 0;

      if (i === 0) {
        positionX = breakpointX
          ? (positionX = scaledWidth / 4 - margin * 10)
          : scaledWidth / 2 - margin;
      } else if (i === 1) {
        positionX = breakpointX
          ? state.app.screen.width - scaledWidth / 4 + margin * 10
          : state.app.screen.width - scaledWidth / 2 + margin;
      }

      let positionY =
        state.app.screen.height -
        (image.height / 2) * scale -
        Interface.bottomBar.height();

      if (breakpointY) {
        positionY = state.app.screen.height + margin;
      }

      building.initialPosition = { x: positionX, y: positionY };

      building.position.set(positionX, positionY);
      building.scale.y = scale;
      building.scale.x = scale;
      building.anchor.set(0.5);

      state.app.stage.addChild(building);

      this.buildings[i] = building;
    }
  }

  static renderGround() {
    this.ground.clear();

    const width = state.app.screen.width;
    const height = state.app.screen.height * 2;
    const positionY = state.app.screen.height - Interface.bottomBar.height();

    this.ground.beginFill(COLORS.dirt);
    this.ground.drawRect(0, positionY, width, height);
    this.ground.endFill();

    this.ground.initialPosition = { x: 0, y: 0 };

    state.app.stage.addChild(this.ground);
  }

  static animateClouds() {
    const clouds = this.clouds.flat();

    clouds.forEach((cloud) => {
      state.app.ticker.add((delta) => {
        if (cloud.position.x >= state.app.screen.width) {
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
