import Building from "./classes/building.js";
import state from "./state.js";
import render from "./render.js";
import { isMobileSizedScreen } from "./utils.js";

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

function handleSwipe() {
  const disabled = true; // Until I can figure out a good way to do this

  if (!isMobileSizedScreen() || disabled) {
    return;
  }

  window.addEventListener("touchstart", (event) => {
    const touch =
      (event.changedTouches.length !== 0 && event.changedTouches[0]) ||
      (event.touches.length !== 0 && event.touches[0]);

    if (!touch) {
      return;
    }

    state.busy = true;

    state.touch.start = {
      x: touch.screenX,
      y: touch.screenY,
    };
  });

  window.addEventListener("touchend", (event) => {
    const touch =
      (event.changedTouches.length !== 0 && event.changedTouches[0]) ||
      (event.touches.length !== 0 && event.touches[0]);

    if (!touch) {
      return;
    }

    state.touch.end = {
      x: touch.screenX,
      y: touch.screenY,
    };

    handleGesture();

    state.busy = false;
  });

  const handleGesture = () => {
    if (state.touch.end.y < state.touch.start.y) {
      Building.selectNextOrPreviousFloor(true);
    } else if (state.touch.end.y > state.touch.start.y) {
      Building.selectNextOrPreviousFloor(false);
    }
  };
}

export default function events() {
  handleResize();
  handleScroll();
  handleSwipe();
}
