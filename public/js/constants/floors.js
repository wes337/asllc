export const FLOORS = {
  wud: {
    name: "Artist Services",
  },
  "plague-blvd": {
    name: "Plague Blvd",
  },
  wendigo: {
    name: "Wendigo",
  },
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
  bvdlvd: {
    name: "BVDLVD",
  },
  skotskr: {
    name: "Skotskr",
  },
  mkultra: {
    name: "MKULTRA",
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

export const ALL_FLOOR_IDS = Object.keys(FLOORS);

export const ABOVE_GROUND_FLOOR_IDS = ALL_FLOOR_IDS.filter(
  (id) => !FLOORS[id].basement
);

export const BASEMENT_FLOOR_IDS = ALL_FLOOR_IDS.filter(
  (id) => FLOORS[id].basement
);
