import lobbyScene from "./scenes/lobby.js";

const ONE_MINUTE = 1000 * 60;

export default function interval() {
  setInterval(() => {
    lobbyScene();
  }, 1000);
}
