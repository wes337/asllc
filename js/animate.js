import State from "./classes/state.js";
import Background from "./classes/background.js";
import Interface from "./classes/interface.js";
import introScene from "./scenes/intro.js";

export default function animate() {
  Background.animateClouds();

  State.people.forEach((person) => person.animate());

  introScene();
}

export function animateCamera(end, withDelta, instant) {
  if (end > State.camera.min()) {
    end = State.camera.min();
  }

  if (instant) {
    State.app.stage.pivot.y = end;

    Background.pivot();
    Interface.render();

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

    if (withDelta) {
      amount = amount * delta;
    }

    if (up) {
      amount = amount * -1;
    }

    const pivot = State.app.stage.pivot.y + amount * delta;

    State.app.stage.pivot.y = up ? Math.max(pivot, end) : Math.min(pivot, end);

    Background.pivot();
    Interface.render();

    if (State.app.stage.pivot.y === end) {
      State.app.ticker.remove(animation);
      State.camera.currentAnimation = null;
      State.busy = false;
    }
  };

  State.camera.currentAnimation = animation;
  State.app.ticker.add(animation);
}
