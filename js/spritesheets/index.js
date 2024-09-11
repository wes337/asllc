import State from "../classes/state.js";
import people from "./people.js";
import misc from "./misc.js";
import floors1 from "./floors-1.js";
import floors2 from "./floors-2.js";
import underground from "./underground.js";
import elevator from "./elevator.js";
import ui from "./ui.js";
import ui2 from "./ui-2.js";
import greenBuilding from "./green-building.js";
import redBuilding from "./red-building.js";
import plane from "./plane.js";
import dirt from "./dirt.js";
import blimp from "./blimp.js";

const SPRITESHEETS = [
  { key: "people", value: people },
  { key: "green-building", value: greenBuilding },
  { key: "red-building", value: redBuilding },
  { key: "floors-1", value: floors1 },
  { key: "floors-2", value: floors2 },
];

const SECONDARY_SPRITESHEETS = [
  { key: "misc", value: misc },
  { key: "underground", value: underground },
  { key: "elevator", value: elevator },
  { key: "ui", value: ui },
  { key: "ui-2", value: ui2 },
  { key: "plane", value: plane },
  { key: "dirt", value: dirt },
  { key: "blimp", value: blimp },
];

export async function loadSpritesheets() {
  await Promise.all(
    SPRITESHEETS.map(async ({ key, value }) => {
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

export async function loadSecondarySpritesheets() {
  await Promise.all(
    SECONDARY_SPRITESHEETS.map(async ({ key, value }) => {
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

  const crane = await PIXI.Assets.load(
    "https://w-img.b-cdn.net/asllc/spritesheets/crane.gif"
  );
  State.spritesheets.crane = crane;

  const creeper = await PIXI.Assets.load("./img/sprites/misc/creeper.gif");
  State.spritesheets.creeper = creeper;
}
