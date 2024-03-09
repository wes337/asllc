import { COLORS } from "./constants/colors.js";
import { isMobileSizedScreen } from "./utils.js";

const state = {
  app: null,
  activeFloorNumber: null,
  people: [],
  scale: () => {
    return isMobileSizedScreen() ? 0.2 : 0.25;
  },
  shift: 0,
  busy: false,
  filters: {
    highlight: new PIXI.filters.OutlineFilter(2, COLORS.sky),
  },
  touch: {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  },
};

export default state;
