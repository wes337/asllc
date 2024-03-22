import {
  ABOVE_GROUND_FLOOR_IDS,
  BASEMENT_FLOOR_IDS,
  FLOORS,
} from "./constants/floors.js";
import { randomNumberBetween } from "./utils.js";
import Interface from "./classes/interface.js";
import Background from "./classes/background.js";
import Building from "./classes/building.js";
import Elevator from "./classes/elevator.js";
import Person from "./classes/person.js";
import state from "./state.js";

function renderPerson(artistId, floorNumber) {
  const artist =
    state.people.find((person) => person.name === artistId) ||
    new Person(artistId);

  artist.startingPosition = randomNumberBetween(
    artist.boundaries.min(),
    artist.boundaries.max()
  );

  artist.floorNumber = floorNumber;

  state.people.push(artist);
}

function renderExtra(floorExtra, floorNumber) {
  const extra =
    state.people.find((person) => person.name === floorExtra.name) ||
    new Person(floorExtra.name);

  extra.startingPosition =
    extra.boundaries.min() + floorExtra.positionX * state.scale();

  if (floorExtra.positionY) {
    extra.offsetY = floorExtra.positionY * state.scale();
  }

  extra.floorNumber = floorNumber;
  extra.walkRandomly = floorExtra.moves;
  extra.character.play();
  state.people.push(extra);
}

export default function render() {
  state.app.renderer.resize(window.innerWidth, window.innerHeight);

  Background.render();
  Building.renderFloor(0, "lobby");
  Building.renderFoundation();

  for (let i = 1; i <= BASEMENT_FLOOR_IDS.length; i++) {
    const artistId = BASEMENT_FLOOR_IDS[i - 1];

    Building.renderBasementFloor(i, artistId);

    const floor = FLOORS[artistId];
    const hasExtras = floor && floor.extras && floor.extras.length > 0;

    if (hasExtras) {
      floor.extras.forEach((floorExtra) => {
        renderExtra(floorExtra, i * -1);
      });
    }

    renderPerson(artistId, i * -1);
  }

  for (let i = 1; i <= ABOVE_GROUND_FLOOR_IDS.length; i++) {
    const artistId = ABOVE_GROUND_FLOOR_IDS[i - 1];

    Building.renderFloor(i, artistId);

    const floor = FLOORS[artistId];
    const hasExtras = floor && floor.extras && floor.extras.length > 0;

    if (hasExtras) {
      floor.extras.forEach((floorExtra) => {
        renderExtra(floorExtra, i);
      });
    }

    renderPerson(artistId, i);
  }

  Building.renderRoof();

  Elevator.render();
  Interface.render();
}
