import { MOBILE_BREAKPOINT } from "./constants/mobile.js";

const state = {
  app: null,
  activeFloorNumber: null,
  people: [],
  scale: () => (window.innerWidth < MOBILE_BREAKPOINT ? 0.2 : 0.25),
  shift: 0,
};

export default state;
