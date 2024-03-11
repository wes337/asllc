import { isMobileSizedScreen } from "./utils.js";
import { animateCamera } from "./animate.js";
import Building from "./classes/building.js";
import state from "./state.js";
import render from "./render.js";

function handleResize() {
  window.addEventListener("resize", () => {
    render();
  });
}

const hammer = new Hammer(document.body);

function handleScroll() {
  const scrollAmount = 16;

  const scrollUp = (event) => {
    if (!state.introFinished) {
      return;
    }

    const velocity =
      event.velocityY !== undefined ? event.velocityY : scrollAmount * -1;

    const amount = state.app.stage.pivot.y - scrollAmount * velocity;
    animateCamera(Math.min(amount, 0), true);
  };

  const scrollDown = (event) => {
    if (!state.introFinished) {
      return;
    }

    const velocity =
      event.velocityY !== undefined ? event.velocityY : scrollAmount;

    let amount = state.app.stage.pivot.y - scrollAmount * velocity;

    const limit =
      amount <= Building.topFloor.position.y() - state.app.screen.height / 2;

    if (limit) {
      return;
    }

    animateCamera(amount, true);
  };

  const scrollEnd = (event) => {
    if (!state.introFinished) {
      return;
    }
    const velocity =
      event.velocityY !== undefined ? event.velocityY : scrollAmount;

    let amount =
      state.app.stage.pivot.y - scrollAmount - event.distance * velocity;

    const top = Building.topFloor.position.y() - state.app.screen.height / 2;
    const limit = amount <= top;

    if (limit) {
      amount = top;
    }

    animateCamera(Math.min(amount, 0), true);
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
