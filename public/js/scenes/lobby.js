import { getRandomElementFromArray } from "../utils.js";
import Elevator from "../classes/elevator.js";
import State from "../classes/state.js";

export default async function lobbyScene() {
  if (!State.introFinished || Elevator.busy) {
    return;
  }

  const peopleInLobby = State.people.filter(
    (person) => person.floorNumber === 0
  );

  if (peopleInLobby.length > 0) {
    const person = getRandomElementFromArray(peopleInLobby);
    await returnToRoomScene(person);
  } else {
    const person = getRandomElementFromArray(
      State.people.filter(
        (person) =>
          !person.extra && person.floorNumber !== 0 && !person.inElevator
      )
    );

    if (person) {
      await sendToLobbyScene(person);
    }
  }
}

async function returnToRoomScene(person) {
  sendPersonToFloorScene(person, person.originalFloorNumber);
}

async function sendToLobbyScene(person) {
  sendPersonToFloorScene(person, 0);
}

async function sendPersonToFloorScene(person, floorNumber) {
  Elevator.busy = true;
  await Elevator.gotoFloor(person.floorNumber);
  await person.enterElevator();
  await Elevator.animateDoor();
  await Elevator.gotoFloor(floorNumber);
  await Elevator.animateDoor();
  await person.enterRoom(floorNumber);
  Elevator.busy = false;
}
