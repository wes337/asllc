import { ALL_ARTIST_IDS, OTHER_IDS, FLOORS } from "./floors.js";
import {
  LEAD_TEXT as ABOUT_LEAD_TEXT,
  FOOTER_TEXT,
  EMAILS,
} from "../content/about.js";
import { LEAD_TEXT as TOURING_LEAD_TEXT, TOURS } from "../content/touring.js";
import { LEAD_TEXT as MERCHANDISE_LEAD_TEXT } from "../content/merchandise.js";

export const MODALS = {
  about: {
    id: "about",
    header: "About Artist Services",
    body: `
      <div class="modal-links">
        <button id="touring-button" class="modal-button">Touring</button>
        <button id="merchandise-button" class="modal-button">Merchandise</button>
      </div>
      <hr />
      <div class="lead">${ABOUT_LEAD_TEXT}</div>
      <hr />
      ${FOOTER_TEXT.map((text) => `<div>${text}</div>`).join("\n")}
      ${EMAILS.map(
        (email) =>
          `<div><a href="mailto:${email.value}">${email.label}</a></div>`
      ).join("\n")}
    `,
  },
  touring: {
    id: "touring",
    header: "Touring",
    body: `
      <div class="modal-links">
        <button id="back-button" class="modal-button">Back</button>
      </div>
      <div class="modal-art">
        <img src="./img/misc/touring.gif" alt="" />
      </div>
      <hr />
      <div class="touring">
        <div class="lead">${TOURING_LEAD_TEXT}</div>
        <ul class="tours">
         ${TOURS.map((tour) => {
           return `<li><a class="tour" href="${tour.value}"} target="_blank">${tour.label}</a></li>`;
         }).join("\n")}
        </ul>
      </div>
    `,
  },
  merchandise: {
    id: "merchandise",
    header: "Merchandise",
    body: `
      <div class="modal-links">
        <button id="back-button" class="modal-button">Back</button>
      </div>
      <div class="modal-art">
      <img src="./img/misc/merch.gif" alt="" />
    </div>
      <hr />
      <div class="merchandise">
        <div class="lead">${MERCHANDISE_LEAD_TEXT}</div>
      </div>
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
          .join("\n")}
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
          .join("\n")}
      </div>
    `,
    footer: `<button>Artists</button>`,
  },
};
