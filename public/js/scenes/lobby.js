import { getRandomElementFromArray } from "../utils.js";
import Elevator from "../classes/elevator.js";
import State from "../classes/state.js";
import Interface from "../classes/interface.js";

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
  const random = Math.random() < 0.5;

  if (random) {
    return;
  }

  Elevator.busy = true;
  await Elevator.gotoFloor(person.floorNumber);
  await person.enterElevator();
  await Elevator.animateDoor();

  Interface.notification.show = true;
  State.personWantsToGotoFloor = person.originalFloorNumber;
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
