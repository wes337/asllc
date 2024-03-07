import { shuffleArray } from "../utils.js";

export const ARTISTS = {
  afourteen: {
    name: "Afourteen",
  },
  biv: {
    name: "Biv",
  },
  blckk: {
    name: "Blckk",
  },
  // bruhmanegod: {
  //   name: "BRUHMANEGOD",
  // },
  bvdlvd: {
    name: "BVDLVD",
  },
  changeline: {
    name: "Changeline",
  },
  "cherry-ills": {
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
  "gregory-diamond": {
    name: "Gregory Diamond",
  },
  "jake-zimmerman": {
    name: "Jake Zimmerman",
  },
  kamaara: {
    name: "KAMAARA",
  },
};

export const ALL_ARTIST_IDS = (() => shuffleArray(Object.keys(ARTISTS)))();
