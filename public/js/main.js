import { ALL_SPRITE_IMAGES } from "./constants/sprites.js";
import { COLORS } from "./constants/colors.js";
import render from "./render.js";
import animate from "./animate.js";
import state from "./state.js";

async function loadAssets() {
  await Promise.all(
    ALL_SPRITE_IMAGES.map(async (image) => {
      await PIXI.Assets.load(image);
    })
  );

  const loading = document.getElementById("loading");
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

  window.addEventListener("resize", render);
}

main();
