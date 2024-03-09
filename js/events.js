import { animateCamera } from "./animate.js";
import Building from "./classes/building.js";
import state from "./state.js";
import render from "./render.js";

function handleResize() {
  window.addEventListener("resize", () => {
    render();
  });
}

function handleScroll() {
  window.addEventListener("wheel", (event) => {
    if (event.deltaY < 0) {
      Building.selectNextOrPreviousFloor(false);
    } else if (event.deltaY > 0) {
      Building.selectNextOrPreviousFloor(true);
    }
  });
}

const hammer = new Hammer(document.body);

function handlePan() {
  const panAmount = 16;

  hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });

  hammer.on("panend", (event) => {
    if (!state.introFinished) {
      return;
    }

    let amount =
      state.app.stage.pivot.y - panAmount - event.distance * event.velocityY;

    const top = Building.topFloor.position.y() - state.app.screen.height / 2;
    const limit = amount <= top;

    if (limit) {
      amount = top;
    }

    animateCamera(Math.min(amount, 0), true);
  });

  hammer.on("panup", (event) => {
    if (!state.introFinished) {
      return;
    }

    const amount = state.app.stage.pivot.y - panAmount * event.velocityY;
    animateCamera(Math.min(amount, 0), true);
  });

  hammer.on("pandown", (event) => {
    if (!state.introFinished) {
      return;
    }

    let amount = state.app.stage.pivot.y - panAmount * event.velocityY;

    const limit =
      amount <= Building.topFloor.position.y() - state.app.screen.height / 2;

    if (limit) {
      return;
    }

    animateCamera(amount, true);
  });
}

export default function events() {
  handleResize();
  handleScroll();
  handlePan();
}
