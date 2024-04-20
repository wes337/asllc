import {
  isLargeSizedScreen,
  isMobileSizedScreen,
  isSmallMobileSizedScreen,
} from "../utils.js";
import { COLORS } from "../constants/colors.js";
import { SPRITES } from "../constants/sprites.js";
import Cache from "./cache.js";
import Building from "./building.js";
import Interface from "./interface.js";

export default class State {
  static app = null;
  static activeFloorNumber = null;
  static people = [];
  static personWantsToGotoFloor = null;
  static scale = () => {
    if (isLargeSizedScreen()) {
      return 0.4;
    }

    if (isSmallMobileSizedScreen()) {
      return 0.185;
    }

    return isMobileSizedScreen() ? 0.2 : 0.25;
  };
  static busy = false;
  static skipIntro = Cache.get("skipIntro") ?? false;
  static introFinished = false;
  static filters = {
    highlight: (size, color) =>
      new PIXI.filters.OutlineFilter(size || 2, color || COLORS.red),
    opacity: (alpha) => new PIXI.filters.AlphaFilter(alpha || 0.5),
    adjustment: (options) => new PIXI.filters.AdjustmentFilter(options),
  };
  static spritesheets = {};
  static getSpritesheet = (spritesheet) => {
    return this.spritesheets[spritesheet];
  };
  static camera = {
    currentAnimation: null,
    start: () => {
      const maxFloorsOnScreen = Math.floor(
        this.app.screen.height / Building.lobby.height()
      );

      let cameraPosition =
        maxFloorsOnScreen * Building.lobby.index * Building.lobby.height() * -1;
      cameraPosition = cameraPosition - Building.lobby.height() / 2;
      cameraPosition = cameraPosition + this.app.screen.height / 2;

      return cameraPosition;
    },
    max: () => Building.topFloor.position.y() - this.app.screen.height / 2,
    min: () =>
      Building.basement.length === 0
        ? 0
        : SPRITES.floor.height * Building.basement.length * this.scale() +
          Interface.navBar.height() +
          350 * this.scale(),
  };
}
