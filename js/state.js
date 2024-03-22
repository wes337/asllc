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
      return 0.35;
    }

    return isMobileSizedScreen() ? 0.2 : 0.25;
  },
  busy: false,
  skipIntro: false,
  introFinished: false,
  filters: {
    highlight: (size, color) =>
      new PIXI.filters.OutlineFilter(size || 2, color || COLORS.sky),
  },
  camera: {
    currentAnimation: null,
    start: () => state.app.screen.height / 4,
    max: () => Building.topFloor.position.y() - state.app.screen.height / 2,
    min: () =>
      Building.basement.length === 0
        ? 0
        : SPRITES.floor.height * Building.basement.length * state.scale() +
          Interface.bottomBar.height(),
  },
};

export default state;
