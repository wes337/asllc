import Background from "./classes/background.js";
import lobbyScene from "./scenes/lobby.js";

const ONE_MINUTE = 1000 * 60;

export default function interval() {
  setInterval(() => {
    lobbyScene();

    const flyPlane = Math.random() < 0.5;
    if (flyPlane && !Background.plane.flying) {
      Background.animatePlane();
    }

    const flyBlimp = Math.random() < 0.25;
    if (flyBlimp && !Background.blimp.flying) {
      Background.animateBlimp();
    }
  }, ONE_MINUTE / 3);
}
