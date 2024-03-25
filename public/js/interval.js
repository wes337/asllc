import lobbyScene from "./scenes/lobby.js";

const ONE_MINUTE = 1000 * 60;

export default function interval() {
  setInterval(() => {
    lobbyScene();
  }, Math.floor(ONE_MINUTE / 3));
}
