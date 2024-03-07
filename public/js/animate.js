import Background from "./classes/background.js";
import state from "./state.js";

export default function animate() {
  Background.animateClouds();

  state.people.forEach((person) => person.animate());
}
