import { getRandomElementFromArray } from "./utils.js";
import Elevator from "./classes/elevator.js";
import state from "./state.js";

export default function interval() {
  setInterval(async () => {
    if (!state.introFinished || state.headingToLobby) {
      return;
    }

    const randomPerson = getRandomElementFromArray(
      state.people.filter(
        (person) =>
          !person.extra && person.floorNumber !== 0 && !person.inElevator
      )
    );

    if (!randomPerson) {
      return;
    }

    state.headingToLobby = randomPerson.name;
    await Elevator.gotoFloor(randomPerson.floorNumber);
    await randomPerson.leaveRoom();
    await Elevator.animateDoor();
    await Elevator.gotoFloor(0);
    await Elevator.animateDoor();
    await randomPerson.enterLobby();
    state.headingToLobby = null;
  }, 60000);
}
