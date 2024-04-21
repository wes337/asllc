import Background from "./classes/background.js";
import lobbyScene from "./scenes/lobby.js";

const ONE_MINUTE = 1000 * 60;

export default function interval() {
  setInterval(() => {
    lobbyScene();

    const random = Math.random() < 0.5;
    if (random && !Background.planeFlying) {
      Background.animatePlane();
    }
  }, ONE_MINUTE / 3);
}
