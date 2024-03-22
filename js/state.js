import Cache from "./cache.js";
import { isLargeSizedScreen, isMobileSizedScreen } from "./utils.js";
import { COLORS } from "./constants/colors.js";
import { SPRITES } from "./constants/sprites.js";
import Building from "./classes/building.js";
import Interface from "./classes/interface.js";

const state = {
  app: null,
  activeFloorNumber: null,
  people: [],
  scale: () => {
    if (isLargeSizedScreen()) {
      return 0.4;
    }

    return isMobileSizedScreen() ? 0.2 : 0.25;
  },
  busy: false,
  skipIntro: Cache.get("skipIntro") ?? false,
  introFinished: false,
  filters: {
    highlight: (size, color) =>
      new PIXI.filters.OutlineFilter(size || 2, color || COLORS.indicator),
  },
  camera: {
    currentAnimation: null,
    start: () => {
      const maxFloorsOnScreen = Math.floor(
        state.app.screen.height / Building.lobby.height()
      );

      let cameraPosition =
        maxFloorsOnScreen * Building.lobby.index * Building.lobby.height() * -1;
      cameraPosition = cameraPosition - Building.lobby.height() / 2;
      cameraPosition = cameraPosition + state.app.screen.height / 2;

      return cameraPosition;
    },
    max: () => Building.topFloor.position.y() - state.app.screen.height / 2,
    min: () =>
      Building.basement.length === 0
        ? 0
        : SPRITES.floor.height * Building.basement.length * state.scale() +
          Interface.bottomBar.height(),
  },
};

export default state;
