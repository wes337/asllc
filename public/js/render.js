import { ALL_ARTIST_IDS } from "./constants/artists.js";
import { randomNumberBetween } from "./utils.js";
import Background from "./classes/background.js";
import Building from "./classes/building.js";
import Elevator from "./classes/elevator.js";
import Person from "./classes/person.js";
import state from "./state.js";

export default function render() {
  state.app.renderer.resize(window.innerWidth, window.innerHeight);

  Background.render();
  Building.renderFloor(0, "lobby");

  for (let i = 1; i <= ALL_ARTIST_IDS.length; i++) {
    const artistId = ALL_ARTIST_IDS[i - 1];

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
}
