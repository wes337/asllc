import Cache from "./cache.js";
import Background from "./classes/background.js";
import Building from "./classes/building.js";
import Interface from "./classes/interface.js";
import state from "./state.js";

export default function animate() {
  Background.animateClouds();

  state.people.forEach((person) => person.animate());

  if (state.skipIntro) {
    state.introFinished = true;
    Interface.showNavBar();
    state.app.stage.pivot.y = state.camera.start();
    Background.pivot();
  } else {
    animateIntro();
  }
}

function animateIntro() {
  const start = Building.roof.position.y - state.app.screen.height / 2;

  state.app.stage.pivot.y += start;

  Background.pivot();

  let delay = 60;
  let current = 0;

  const animation = (delta) => {
    current++;

    if (current < delay) {
      return;
    }

    const speed = 24 * delta;
    const scrollAmount = state.app.stage.pivot.y + speed;

    state.app.stage.pivot.y = Math.min(scrollAmount, state.camera.start());

    Background.pivot();
    Interface.render();

    if (state.app.stage.pivot.y === state.camera.start()) {
      state.app.ticker.remove(animation);
      state.camera.currentAnimation = null;

      Interface.showNavBar();
      state.introFinished = true;
      Cache.set("skipIntro", true, 300);
    }
  };

  state.camera.currentAnimation = animation;
  state.app.ticker.add(animation);
}

export function animateCamera(end, withDelta, instant) {
  if (end > state.camera.min()) {
    end = state.camera.min();
  }

  if (instant) {
    state.app.stage.pivot.y = end;

    Background.pivot();
    Interface.render();

    return;
  }

  state.busy = true;

  if (state.camera.currentAnimation) {
    state.app.ticker.remove(state.camera.currentAnimation);
    state.camera.currentAnimation = null;
  }

  const start = state.app.stage.pivot.y;
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

    const pivot = state.app.stage.pivot.y + amount * delta;

    state.app.stage.pivot.y = up ? Math.max(pivot, end) : Math.min(pivot, end);

    Background.pivot();
    Interface.render();

    if (state.app.stage.pivot.y === end) {
      state.app.ticker.remove(animation);
      state.camera.currentAnimation = null;
      state.busy = false;
    }
  };

  state.camera.currentAnimation = animation;
  state.app.ticker.add(animation);
}
