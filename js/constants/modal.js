import { ALL_ARTIST_IDS, OTHER_IDS, FLOORS } from "./floors.js";

export const MODALS = {
  about: {
    header: "About Artist Services",
    body: `
      <hr />
      <div class="info">Helping artists capitalize on and invest in their careers without compromising creative vision.</div>
      <hr />
      <div>Jay M.</div>
      <div>Brooklyn, New York</div>
      <div><a href="mailto:jay@artistservic.es">Jay [at] artistservic.es</a></div>
      <div><a href="mailto:wud@artistservic.es">Wud [at] artistservic.es</a></div>
    `,
  },
  artists: {
    id: "artists",
    header: "Artists",
    body: `
      <div class="artists">
        ${[...ALL_ARTIST_IDS]
          .sort((a, b) => a.localeCompare(b))
          .map((artistId) => {
            return `<button id="${artistId}-button" class="artist">${artistId.replace(
              "-",
              " "
            )}</button>`;
          })
          .join(" ")
          .trim()}
      </div>
    `,
    footer: `<button>Other</button>`,
  },
  other: {
    id: "other",
    header: "Other",
    body: `
      <div class="artists">
        ${[...OTHER_IDS]
          .sort((a, b) => a.localeCompare(b))
          .map((artistId) => {
            return `<button id="${artistId}-button" class="artist">${FLOORS[artistId].name}</button>`;
          })
          .join(" ")
          .trim()}
      </div>
    `,
    footer: `<button>Artists</button>`,
  },
};