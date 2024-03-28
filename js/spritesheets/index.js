import State from "../classes/state.js";
import characters from "./characters.js";
import extras from "./extras.js";
import misc from "./misc.js";
import rooms1 from "./rooms-1.js";
import rooms2 from "./rooms-2.js";
import rooms3 from "./rooms-3.js";
import rooms4 from "./rooms-4.js";
import rooms5 from "./rooms-5.js";
import rooms6 from "./rooms-6.js";
import rooms7 from "./rooms-7.js";
import rooms8 from "./rooms-8.js";
import elevator from "./elevator.js";
import ui from "./ui.js";

export default async function loadSpritesheets() {
  const spritesheets = [
    { key: "characters", value: characters },
    { key: "extras", value: extras },
    { key: "misc", value: misc },
    { key: "rooms-1", value: rooms1 },
    { key: "rooms-2", value: rooms2 },
    { key: "rooms-3", value: rooms3 },
    { key: "rooms-4", value: rooms4 },
    { key: "rooms-5", value: rooms5 },
    { key: "rooms-6", value: rooms6 },
    { key: "rooms-7", value: rooms7 },
    { key: "rooms-8", value: rooms8 },
    { key: "elevator", value: elevator },
    { key: "ui", value: ui },
  ];

  await Promise.all(
    spritesheets.map(async ({ key, value }) => {
      const spritesheet = new PIXI.Spritesheet(
        PIXI.BaseTexture.from(value.meta.image),
        value
      );

      await spritesheet.parse();

      State.spritesheets = {
        ...State.spritesheets,
        [key]: spritesheet,
      };
    })
  );
}
