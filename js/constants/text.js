import { isLargeSizedScreen, isMobileSizedScreen } from "../utils.js";
import { COLORS } from "./colors.js";

export const FONT_FAMILY = {
  name: "Tiny Tower",
  src: "./fonts/tiny-tower.ttf",
};

export const HEADER_FONT_FAMILY = {
  name: "Nokia",
  src: "./fonts/nokiafc22.ttf",
};

export const FONT_SIZES = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const TEXT_STYLES = {
  default: {
    fontFamily: FONT_FAMILY.name,
    fill: COLORS.white,
    fontSize: FONT_SIZES.md,
    dropShadow: true,
    dropShadowColor: COLORS.textShadow,
    dropShadowDistance: 4,
  },
  header: {
    fontFamily: HEADER_FONT_FAMILY.name,
    fill: COLORS.sun,
    fontSize: FONT_SIZES.xl,
    dropShadow: true,
    dropShadowColor: COLORS.sunDark,
    dropShadowDistance: 4,
  },
};

export const DEFAULT_FONT_SIZE = () => {
  if (isLargeSizedScreen()) {
    return FONT_SIZES.lg;
  }

  return FONT_SIZES.md;
};

export const DEFAULT_LINE_HEIGHT = (fontSize) => {
  if (isMobileSizedScreen()) {
    return fontSize - 4;
  }

  return fontSize;
};
