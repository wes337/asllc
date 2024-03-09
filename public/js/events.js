import Building from "./classes/building.js";
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

export default function events() {
  handleResize();
  handleScroll();
}
