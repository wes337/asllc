export const FLOORS = {
  wud: {
    name: "Artist Services",
  },
  "plague-blvd": {
    name: "Plague BLVD",
  },
  wendigo: {
    name: "Wendigo",
    extras: [
      {
        name: "fishmonger",
        moves: false,
        positionX: 480,
      },
    ],
  },
  afourteen: {
    name: "Afourteen",
  },
  biv: {
    name: "Biv",
  },
  blckk: {
    name: "Blckk",
    extras: [
      {
        name: "corona",
        moves: false,
        positionX: 10,
        positionY: 300,
      },
      {
        name: "cigar",
        moves: false,
        positionX: 1120,
        positionY: 110,
      },
    ],
  },
  bruhmanegod: {
    name: "BRUHMANEGOD",
  },
  changeline: {
    name: "Changeline",
    extras: [
      {
        name: "flying-book",
        moves: true,
        positionX: 800,
        positionY: 180,
      },
    ],
  },
  cherry: {
    name: "Cherry Ills",
  },
  cubensis: {
    name: "Cubensis",
  },
  cxrpse: {
    name: "CXRPSE",
    extras: [
      {
        name: "hand",
        moves: false,
        positionX: 80,
      },
    ],
  },
  deerdeath: {
    name: "Deer Death",
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
    name: "SKOTSKR",
  },
  mkultra: {
    name: "MKULTRA",
  },
  "gregory-diamond": {
    name: "Greg",
    basement: true,
  },
  "jake-zimmerman": {
    name: "Jake",
    basement: true,
  },
  sorbet: {
    name: "sorbet",
    basement: true,
    extras: [
      {
        name: "cat",
        moves: false,
        positionX: 950,
      },
      {
        name: "computer",
        moves: false,
        positionX: 20,
      },
    ],
  },
  steel: {
    name: "SteelSoldier",
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
