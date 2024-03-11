import { shuffleArray } from "../utils.js";

export const FLOORS = {
  afourteen: {
    name: "Afourteen",
  },
  biv: {
    name: "Biv",
  },
  blckk: {
    name: "Blckk",
  },
  bruhmanegod: {
    name: "BRUHMANEGOD",
  },
  bvdlvd: {
    name: "BVDLVD",
  },
  changeline: {
    name: "Changeline",
  },
  cherry: {
    name: "Cherry Ills",
  },
  cubensis: {
    name: "Cubensis",
  },
  cxrpse: {
    name: "CXRPSE",
  },
  deerdeath: {
    name: "deer death",
  },
  dirtybutt: {
    name: "DIRTYBUTT",
  },
  kamaara: {
    name: "KAMAARA",
  },
  mkultra: {
    name: "MKULTRA",
  },
  "plague-blvd": {
    name: "Plague Blvd",
  },
  skotskr: {
    name: "Skotskr",
  },
  wendigo: {
    name: "Wendigo",
  },
  "gregory-diamond": {
    name: "Gregory Diamond",
    basement: true,
  },
  "jake-zimmerman": {
    name: "Jake Zimmerman",
    basement: true,
  },
  sorbet: {
    name: "Sorbet",
    basement: true,
  },
  steel: {
    name: "Steel",
    basement: true,
  },
};

export const ALL_ARTIST_IDS = (() => shuffleArray(Object.keys(FLOORS)))();
