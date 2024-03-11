import {
  ABOVE_GROUND_FLOOR_IDS,
  BASEMENT_FLOOR_IDS,
} from "./constants/floors.js";
import { randomNumberBetween } from "./utils.js";
import Interface from "./classes/interface.js";
import Background from "./classes/background.js";
import Building from "./classes/building.js";
import Elevator from "./classes/elevator.js";
import Person from "./classes/person.js";
import state from "./state.js";

export default function render() {
  state.app.renderer.resize(window.innerWidth, window.innerHeight);

  Background.render();

  Building.renderFloor(0, "lobby");

  Building.renderFoundation();

  for (let i = 1; i <= BASEMENT_FLOOR_IDS.length; i++) {
    const artistId = BASEMENT_FLOOR_IDS[i - 1];

    Building.renderBasementFloor(i, artistId);

    const artist =
      state.people.find((person) => person.name === artistId) ||
      new Person(artistId);

    artist.startingPosition = randomNumberBetween(
      artist.boundaries.min(),
      artist.boundaries.max()
    );

    artist.floorNumber = i * -1;

    state.people.push(artist);
  }

  for (let i = 1; i <= ABOVE_GROUND_FLOOR_IDS.length; i++) {
    const artistId = ABOVE_GROUND_FLOOR_IDS[i - 1];

    Building.renderFloor(i, artistId);

    const artist =
      state.people.find((person) => person.name === artistId) ||
      new Person(artistId);

    artist.startingPosition = randomNumberBetween(
      artist.boundaries.min(),
      artist.boundaries.max()
    );

    artist.floorNumber = i;

    state.people.push(artist);
  }

  Building.renderRoof();

  Elevator.render();
  Interface.render();
}
