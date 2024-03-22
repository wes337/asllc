import { ALL_SPRITE_IMAGES } from "./constants/sprites.js";
import { COLORS } from "./constants/colors.js";
import { FONT_FAMILY, HEADER_FONT_FAMILY } from "./constants/text.js";
import render from "./render.js";
import animate from "./animate.js";
import events from "./events.js";
import state from "./state.js";

async function loadAssets() {
  const loading = document.getElementById("loading");
  const message = loading.querySelector("h1");

  message.innerHTML = "Loading fonts...";

  PIXI.Assets.addBundle("fonts", [
    { alias: FONT_FAMILY.name, src: FONT_FAMILY.src },
    { alias: HEADER_FONT_FAMILY.name, src: HEADER_FONT_FAMILY.src },
  ]);

  await PIXI.Assets.loadBundle("fonts");

  message.innerHTML = "Loading sprites...";

  await PIXI.Assets.load(ALL_SPRITE_IMAGES, (progress) => {
    message.innerHTML = `Loading sprites... ${Math.round(progress * 100)}%`;
  });

  loading.remove();
}

async function main() {
  await loadAssets();

  const app = new PIXI.Application({
    background: COLORS.skyLight,
    resizeTo: window,
    useContextAlpha: false,
    antialias: true,
  });

  PIXI.settings.RESOLUTION = window.devicePixelRatio;
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  document.body.appendChild(app.view);

  state.app = app;

  render();
  animate();
  events();
}

main();
