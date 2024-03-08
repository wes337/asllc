import { MOBILE_BREAKPOINT } from "./constants/mobile.js";

export function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function uniqueID() {
  return String(Date.now().toString(32) + Math.random().toString(16)).replace(
    /\./g,
    ""
  );
}

export function shuffleArray(array) {
  const shuffledArray = [...array];

  for (var i = shuffledArray.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffledArray[i];
    shuffledArray[i] = shuffledArray[j];
    shuffledArray[j] = temp;
  }

  return shuffledArray;
}

export function isMobileSizedScreen(app) {
  if (!app) {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  return app.screen.width < MOBILE_BREAKPOINT;
}
