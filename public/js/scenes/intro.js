import Cache from "../classes/cache.js";
import Background from "../classes/background.js";
import Building from "../classes/building.js";
import Interface from "../classes/interface.js";
import State from "../classes/state.js";

export default function introScene() {
  if (State.skipIntro) {
    State.introFinished = true;
    Interface.showNavBar();
    State.app.stage.pivot.y = State.camera.start();
    Background.pivot();
    return;
  }

  const start = Building.roof.position.y - State.app.screen.height / 2;

  State.app.stage.pivot.y += start;

  Background.pivot();

  let delay = 60;
  let current = 0;

  const animation = (delta) => {
    current++;

    if (current < delay) {
      return;
    }

    const speed = 24 * delta;
    const scrollAmount = State.app.stage.pivot.y + speed;

    State.app.stage.pivot.y = Math.min(scrollAmount, State.camera.start());

    Background.pivot();
    Interface.render();

    if (State.app.stage.pivot.y === State.camera.start()) {
      State.app.ticker.remove(animation);
      State.camera.currentAnimation = null;

      Interface.showNavBar();
      State.introFinished = true;
      Cache.set("skipIntro", true, 300);
    }
  };

  State.camera.currentAnimation = animation;
  State.app.ticker.add(animation);
}
