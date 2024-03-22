import { isMobileSizedScreen } from "./utils.js";
import { animateCamera } from "./animate.js";
import Building from "./classes/building.js";
import Modal from "./classes/modal.js";
import render from "./render.js";
import state from "./state.js";

var hammer = new Hammer(document.body);

var debouncedResize = null;

function handleResize() {
  window.addEventListener("resize", () => {
    clearTimeout(debouncedResize);

    debouncedResize = setTimeout(() => {
      render();

      // Reposition camera if there is an active floor
      if (Building.activeFloor) {
        Building.activeFloor.onClick();
      }
    }, 25);
  });
}

function handleScroll() {
  const scrollAmount = 16;

  const scrollUp = (event) => {
    if (!state.introFinished || Modal.visible) {
      return;
    }

    const velocity =
      event.velocityY !== undefined ? event.velocityY : scrollAmount * -1;

    const amount = state.app.stage.pivot.y - scrollAmount * velocity;
    animateCamera(Math.min(amount, state.camera.min()), true);
  };

  const scrollDown = (event) => {
    if (!state.introFinished || Modal.visible) {
      return;
    }

    const velocity =
      event.velocityY !== undefined ? event.velocityY : scrollAmount;

    let amount = state.app.stage.pivot.y - scrollAmount * velocity;

    const max = state.camera.max();
    const limit = amount <= max;

    if (limit) {
      amount = max;
    }

    animateCamera(amount, true);
  };

  const scrollEnd = (event) => {
    if (!state.introFinished || Modal.visible) {
      return;
    }
    const velocity =
      event.velocityY !== undefined ? event.velocityY : scrollAmount;

    let amount =
      state.app.stage.pivot.y - scrollAmount - event.distance * velocity;

    const max = state.camera.max();
    const limit = amount <= max;

    if (limit) {
      amount = max;
    }

    const min = state.camera.min();
    amount = Math.min(amount, min);

    animateCamera(amount, true);
  };

  if (isMobileSizedScreen()) {
    // TODO: Make scrolling feel more natural on mobile devices...
    hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });
    hammer.on("panup", scrollUp);
    hammer.on("pandown", scrollDown);
    hammer.on("panend", scrollEnd);
  } else {
    window.addEventListener("wheel", (event) => {
      if (event.deltaY < 0) {
        scrollDown(event);
      } else if (event.deltaY > 0) {
        scrollUp(event);
      }
    });
  }
}

export default function events() {
  handleResize();
  handleScroll();
}
