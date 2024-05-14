import { COLORS } from "../constants/colors.js";
import { randomNumberBetween, isMobileSizedScreen } from "../utils.js";
import Interface from "./interface.js";
import State from "./state.js";

export default class Background {
  static sky = new PIXI.Graphics();

  static sun = null;
  static clouds = [];
  static buildings = [];
  static mobileBackground = null;
  static ground = new PIXI.Graphics();
  static dirt = null;
  static moreDirt = null;
  static fossil = null;
  static plane = null;
  static car = null;
  static dinosaur = null;
  static blimp = null;

  static {
    window.addEventListener("resize", () => {
      if (State.app) {
        this.render();
      }
    });
  }

  static pivot() {
    this.sky.position.y = this.sky.initialPosition.y + State.app.stage.pivot.y;
    this.sun.position.y = this.sun.initialPosition.y + State.app.stage.pivot.y;
    this.plane.position.y =
      this.plane.initialPosition.y + State.app.stage.pivot.y;

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
    this.sun = this.sun ? this.sun : PIXI.Sprite.from("sun.png");

    const scale = State.scale();

    this.sun.scale.y = scale;
    this.sun.scale.x = scale;
    this.sun.anchor.set(0.5);

    const marginX = 16;
    const marginY = 8;
    const positionX = State.app.screen.width - this.sun.width / 2 - marginX;
    const positionY = this.sun.height / 2 + marginY;

    this.sun.position.set(positionX, positionY);
    this.sun.initialPosition = { x: positionX, y: positionY };

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
          const cloudSprite = (size) => {
            switch (size) {
              case "xs":
                return 1;
              case "sm":
                return 2;
              case "md":
                return 3;
              case "lg":
                return 4;
              case "xl":
                return 5;
              default:
                return 1;
            }
          };
          cloud = PIXI.Sprite.from(`cloud-${cloudSprite(size)}.png`);
          cloud.reverse = false;
          this.clouds[i][j] = cloud;
        }

        const numberOfClouds = ROWS[i];

        const marginX = 48 - ROW_OFFSET_X[i];
        const marginY = 32 - ROW_OFFSET_Y[i];
        const positionX =
          cloud.width +
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

  static renderMobileBackground() {
    if (this.mobileBackground) {
      this.mobileBackground.visible = isMobileSizedScreen();
    }

    if (!isMobileSizedScreen()) {
      return;
    }

    const mobileBackground =
      this.mobileBackground || PIXI.Sprite.from("./img/mobile-bg.png");

    mobileBackground.scale.y = 1;
    mobileBackground.scale.x = 1;
    mobileBackground.anchor.set(0.5);

    mobileBackground.width = window.innerWidth;

    const positionX = State.app.screen.width - mobileBackground.width / 2;
    const positionY =
      State.app.screen.height -
      1600 * State.scale() -
      Interface.navBar.height();

    mobileBackground.initialPosition = { x: positionX, y: positionY };
    mobileBackground.position.set(positionX, positionY);

    this.mobileBackground = mobileBackground;

    State.app.stage.addChild(mobileBackground);
  }

  static renderBuildings() {
    const scale = State.scale();

    const NUMBER_OF_BUILDINGS = 2;

    for (let i = 0; i < NUMBER_OF_BUILDINGS; i++) {
      const color = i === 0 ? "green" : "red";

      const building =
        this.buildings[i] || PIXI.Sprite.from(`${color}-building.png`);

      building.scale.y = scale;
      building.scale.x = scale;
      building.anchor.set(0.5);

      const margin = 24;
      const breakpointX =
        State.app.screen.width <= building.width * NUMBER_OF_BUILDINGS + margin;

      let positionX = 0;

      if (i === 0) {
        // Green building
        positionX = breakpointX
          ? (positionX = building.width / 4 - margin * 10)
          : building.width / 2 - margin;
      } else if (i === 1) {
        // Red building
        positionX = breakpointX
          ? State.app.screen.width - building.width / 4 + margin * 10
          : State.app.screen.width - building.width / 2 + margin;
      }

      const positionY =
        State.app.screen.height - building.height / 2 - 300 * scale;

      building.initialPosition = { x: positionX, y: positionY };
      building.visible = !isMobileSizedScreen();

      building.position.set(positionX, positionY);

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

    this.dirt = this.dirt
      ? this.dirt
      : new PIXI.TilingSprite(
          PIXI.Texture.from("dirt-1.png"),
          State.app.screen.width,
          320 * scale
        );

    this.dirt.width = State.app.screen.width;
    this.dirt.height = 320 * scale;

    this.dirt.tileScale.x = scale * 2;
    this.dirt.tileScale.y = scale * 2;

    this.dirt.position.set(0, positionY + this.dirt.height / 2);

    State.app.stage.addChild(this.dirt);
  }

  static renderFossil() {
    this.fossil = this.fossil ? this.fossil : PIXI.Sprite.from("distrokid.png");

    const scale = State.scale();

    this.fossil.scale.y = scale;
    this.fossil.scale.x = scale;
    this.fossil.anchor.set(0.5);

    const marginX = 16;
    const marginY = 16;
    const positionX = isMobileSizedScreen()
      ? this.fossil.width / 2 + marginX
      : this.fossil.width * 2;

    const positionY =
      State.app.screen.height * 2 - this.fossil.height * 4 + marginY;

    this.fossil.initialPosition = { x: positionX, y: positionY };

    this.fossil.position.set(positionX, positionY);

    State.app.stage.addChild(this.fossil);
  }

  static renderCar() {
    this.car = this.car ? this.car : PIXI.Sprite.from("wrecked-car.png");

    const scale = State.scale();

    this.car.scale.y = scale;
    this.car.scale.x = scale;
    this.car.anchor.set(0.5);

    const marginY = -32;
    const positionX = isMobileSizedScreen()
      ? State.app.screen.width - this.car.width / 2
      : State.app.screen.width - this.car.width * 2;

    const positionY =
      State.app.screen.height * 2 - this.car.height * 8 + marginY;

    this.car.initialPosition = { x: positionX, y: positionY };

    this.car.position.set(positionX, positionY);

    State.app.stage.addChild(this.car);
  }

  static renderDinosaur() {
    this.dinosaur = this.dinosaur
      ? this.dinosaur
      : PIXI.Sprite.from("dinosaur.png");

    const scale = State.scale();

    this.dinosaur.scale.y = scale;
    this.dinosaur.scale.x = scale;
    this.dinosaur.anchor.set(0.5);

    const positionX = State.app.screen.width / 2;
    const positionY = State.app.screen.height * 2 - this.dinosaur.height;

    this.dinosaur.initialPosition = { x: positionX, y: positionY };

    this.dinosaur.position.set(positionX, positionY);

    State.app.stage.addChild(this.dinosaur);
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

  static renderPlane() {
    this.plane = this.plane
      ? this.plane
      : new PIXI.AnimatedSprite(State.spritesheets.plane.animations["plane"]);

    this.plane.loop = true;
    this.plane.animationSpeed = 0.2;
    this.plane.play();

    const scale = State.scale();

    this.plane.scale.y = scale * 2;
    this.plane.scale.x = scale * 2;
    this.plane.anchor.set(0.5);

    const positionX = State.app.screen.width + this.plane.width;
    const positionY = this.plane.height;

    this.plane.position.set(positionX, positionY);
    this.plane.initialPosition = { x: positionX, y: positionY };

    State.app.stage.addChild(this.plane);
  }

  static animatePlane() {
    this.plane.flying = true;
    this.plane.position.x = State.app.screen.width + this.plane.width;

    const animation = (delta) => {
      this.plane.position.x -= 1 * delta;

      if (this.plane.position.x <= 0 - this.plane.width) {
        this.plane.flying = false;
        this.plane.position.x = State.app.screen.width + this.plane.width;
        State.app.ticker.remove(animation);
      }
    };

    State.app.ticker.add(animation);
  }

  static renderBlimp() {
    this.blimp = this.blimp
      ? this.blimp
      : new PIXI.AnimatedSprite(State.spritesheets.blimp.animations["blimp"]);

    this.blimp.loop = true;
    this.blimp.animationSpeed = 0.2;
    this.blimp.play();

    const scale = State.scale();

    this.blimp.scale.y = scale * 2;
    this.blimp.scale.x = scale * 2;
    this.blimp.anchor.set(0.5);

    const positionX = 0 - this.blimp.width;
    const positionY = this.blimp.height / 2;

    this.blimp.position.set(positionX, positionY);
    this.blimp.initialPosition = { x: positionX, y: positionY };

    State.app.stage.addChild(this.blimp);
  }

  static animateBlimp() {
    this.blimp.flying = true;
    this.blimp.position.x = 0 - this.blimp.width;

    const animation = (delta) => {
      this.blimp.position.x += 0.25 * delta;

      if (this.blimp.position.x >= State.app.screen.width + this.blimp.width) {
        this.blimp.flying = false;
        this.blimp.position.x = State.app.screen.width + this.blimp.width;
        State.app.ticker.remove(animation);
      }
    };

    State.app.ticker.add(animation);
  }

  static render() {
    this.renderSky();
    this.renderSun();
    this.renderClouds();
    this.renderPlane();
    this.renderBlimp();
    this.renderBuildings();
    this.renderMobileBackground();
    this.renderGround();
    this.renderFossil();
    this.renderCar();
    this.renderDinosaur();

    this.pivot();
  }
}
