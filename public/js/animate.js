import State from "./classes/state.js";
import Background from "./classes/background.js";
import Interface from "./classes/interface.js";
import introScene from "./scenes/intro.js";
import lobbyScene from "./scenes/lobby.js";

export default async function animate() {
  Background.animateClouds();

  State.people.forEach((person) => person.animate());

  await introScene();

  setTimeout(() => {
    lobbyScene();
  }, 5000);
}

export function animateCamera(end, instant) {
  return new Promise((resolve) => {
    if (end > State.camera.min()) {
      end = State.camera.min();
    }

    if (instant) {
      State.app.stage.pivot.y = end;

      Background.pivot();
      Interface.render();

      resolve();
      return;
    }

    State.busy = true;

    if (State.camera.currentAnimation) {
      State.app.ticker.remove(State.camera.currentAnimation);
      State.camera.currentAnimation = null;
    }

    const start = State.app.stage.pivot.y;
    const up = start > end;

    Interface.render();

    const animation = (delta) => {
      let amount = 25;

      if (up) {
        amount = amount * -1;
      }

      const pivot = State.app.stage.pivot.y + amount * delta;

      State.app.stage.pivot.y = up
        ? Math.max(pivot, end)
        : Math.min(pivot, end);

      Background.pivot();
      Interface.render();

      if (State.app.stage.pivot.y === end) {
        State.app.ticker.remove(animation);
        State.camera.currentAnimation = null;
        State.busy = false;
        resolve();
      }
    };

    State.camera.currentAnimation = animation;
    State.app.ticker.add(animation);
  });
}
