import { COLORS } from "./constants/colors.js";
import { FONT_FAMILY, HEADER_FONT_FAMILY } from "./constants/text.js";
import loadSpritesheets from "./spritesheets/index.js";
import State from "./classes/state.js";
import MusicPlayer from "./classes/music.js";
import render from "./render.js";
import animate from "./animate.js";
import events from "./events.js";
import interval from "./interval.js";

async function loadAssets() {
  return new Promise(async (resolve) => {
    const loading = document.getElementById("loading");
    const message = loading.querySelector("h1");
    const enterButton = document.getElementById("enter-button");

    enterButton.style.display = "none";
    message.innerHTML = "Loading fonts...";

    PIXI.Assets.addBundle("fonts", [
      { alias: FONT_FAMILY.name, src: FONT_FAMILY.src },
      { alias: HEADER_FONT_FAMILY.name, src: HEADER_FONT_FAMILY.src },
    ]);

    await PIXI.Assets.loadBundle("fonts");

    message.innerHTML = "Loading sprites...";

    await loadSpritesheets();

    message.remove();
    enterButton.style.display = "flex";

    enterButton.addEventListener("click", () => {
      loading.remove();
      MusicPlayer.toggle();
      resolve();
    });
  });
}

async function main() {
  await loadAssets();

  const app = new PIXI.Application({
    background: COLORS.lightBlue,
    resizeTo: window,
    useContextAlpha: false,
    antialias: true,
  });

  PIXI.settings.RESOLUTION = window.devicePixelRatio;
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  document.body.appendChild(app.view);

  State.app = app;

  render();
  animate();
  events();
  interval();
}

main();
