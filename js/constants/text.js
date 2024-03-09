import { COLORS } from "./colors.js";

export const FONT_FAMILY = { name: "Nokia", src: "./fonts/nokiafc22.ttf" };

export const FONT_SIZES = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
};

export const TEXT_STYLES = {
  default: {
    fontFamily: FONT_FAMILY.name,
    fill: COLORS.white,
    fontSize: FONT_SIZES.md,
    dropShadow: true,
    dropShadowColor: COLORS.textShadow,
    dropShadowDistance: 2,
  },
};
