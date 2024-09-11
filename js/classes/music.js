const TRACKS = [
  {
    fileName: "000017_-_peaceful_street_90_bpm_prod._brahman.mp3",
    title: "000017_-_peaceful_street_90_bpm_prod._brahman.wav",
  },
  { fileName: "HEADER - skotskr.mp3", title: "HEADER - skotskr.wav" },
  { fileName: "lo_fi - skotskr.mp3", title: "lo_fi - skotskr.wav" },
  {
    fileName: "very-lush-and-swag-loop-74140.mp3",
    title: "very-lush-and-swag-loop-74140.mp3",
  },
  {
    fileName: "calder - pastel 10 mastered.mp3",
    title: "calder - pastel 10 mastered.mp3",
  },
  {
    fileName: "calder - pastel 12 mastered.mp3",
    title: "calder - pastel 12 mastered.mp3",
  },
  {
    fileName: "calder - pastel 15 mastered.mp3",
    title: "calder - pastel 15 mastered.mp3",
  },
  {
    fileName: "calder - pastel 25 mastered.mp3",
    title: "calder - pastel 25 mastered.mp3",
  },
];

const calculateTime = (secs) => {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${returnedSeconds}`;
};

export default class MusicPlayer {
  static audio = new Audio();
  static currentTrackNumber = 0;
  static paused = false;
  static pauseTime = 0;
  static animation = null;
  static elements = {
    container: document.getElementById("music-player-container"),
    trackInfo: document.getElementById("music-player-track-info"),
    play: document.getElementById("music-player-play"),
    nextTrack: document.getElementById("music-player-next-track"),
    prevTrack: document.getElementById("music-player-prev-track"),
    close: document.getElementById("music-player-close"),
    duration: document.getElementById("music-player-duration"),
  };

  static {
    MusicPlayer.elements.close.addEventListener("click", MusicPlayer.close);
    MusicPlayer.elements.play.addEventListener("click", MusicPlayer.toggle);
    MusicPlayer.elements.nextTrack.addEventListener("click", MusicPlayer.next);
    MusicPlayer.elements.prevTrack.addEventListener("click", MusicPlayer.prev);
  }

  static get currentTrackTitle() {
    const trackTitle = TRACKS[MusicPlayer.currentTrackNumber]?.title;
    return trackTitle || "Unknown Track";
  }

  static get currentTrackFileName() {
    const trackFileName = TRACKS[MusicPlayer.currentTrackNumber]?.fileName;
    return trackFileName ? `./sounds/${trackFileName}` : null;
  }

  static get playing() {
    return !!(
      MusicPlayer.audio &&
      MusicPlayer.audio.duration > 0 &&
      !MusicPlayer.audio.paused
    );
  }

  static open() {
    MusicPlayer.elements.container.classList.add("show");
  }

  static close() {
    MusicPlayer.elements.container.classList.remove("show");
  }

  static updateTrackInfo() {
    const marquee = MusicPlayer.elements.trackInfo.querySelector(".marquee");
    marquee.innerHTML = `
      <ul class="marquee-content">
        ${`<li>${MusicPlayer.currentTrackTitle}</li>`.repeat(2)}
      </ul>
    `;
  }

  static whilePlaying() {
    const current = MusicPlayer.elements.duration.querySelector("#current");
    const seek = MusicPlayer.elements.duration.querySelector("#seek");

    seek.value = Math.floor(MusicPlayer.audio.currentTime);
    current.innerHTML = calculateTime(seek.value);

    MusicPlayer.animation = requestAnimationFrame(MusicPlayer.whilePlaying);
  }

  static updateDuration() {
    const current = MusicPlayer.elements.duration.querySelector("#current");
    const total = MusicPlayer.elements.duration.querySelector("#total");
    const seek = MusicPlayer.elements.duration.querySelector("#seek");

    seek.max = Math.floor(MusicPlayer.audio.duration);
    total.innerHTML = calculateTime(MusicPlayer.audio.duration);

    seek.oninput = () => {
      current.innerHTML = calculateTime(seek.value);

      if (!MusicPlayer.audio.paused) {
        cancelAnimationFrame(MusicPlayer.animation);
      }
    };

    seek.onchange = () => {
      MusicPlayer.audio.currentTime = seek.value;

      if (!audio.paused) {
        requestAnimationFrame(MusicPlayer.whilePlaying);
      }
    };

    MusicPlayer.audio.ontimeupdate = () => {
      seek.value = Math.floor(MusicPlayer.audio.currentTime);
      current.innerHTML = calculateTime(seek.value);
    };
  }

  static toggle() {
    if (MusicPlayer.playing) {
      MusicPlayer.stop();
    } else {
      MusicPlayer.play();
    }

    MusicPlayer.updateTrackInfo();
  }

  static next() {
    MusicPlayer.pauseTime = 0;

    const nextTrackNumber = MusicPlayer.currentTrackNumber + 1;
    const nextTrack = TRACKS[nextTrackNumber];

    if (nextTrack) {
      MusicPlayer.currentTrackNumber = nextTrackNumber;
    } else {
      MusicPlayer.currentTrackNumber = 0;
    }

    MusicPlayer.updateTrackInfo();

    if (!MusicPlayer.paused) {
      MusicPlayer.play();
    }
  }

  static prev() {
    MusicPlayer.pauseTime = 0;

    const previousTrackNumber = MusicPlayer.currentTrackNumber - 1;
    const previousTrack = TRACKS[previousTrackNumber];

    if (previousTrack) {
      MusicPlayer.currentTrackNumber = previousTrackNumber;
    } else {
      MusicPlayer.currentTrackNumber = TRACKS.length - 1;
    }

    MusicPlayer.updateTrackInfo();

    if (!MusicPlayer.paused) {
      MusicPlayer.play();
    }
  }

  static play() {
    if (!MusicPlayer.currentTrackFileName) {
      return;
    }

    MusicPlayer.paused = false;
    MusicPlayer.elements.play.classList.remove("paused");
    MusicPlayer.audio.src = MusicPlayer.currentTrackFileName;
    MusicPlayer.audio.volume = 0.2;

    MusicPlayer.audio.onloadedmetadata = () => {
      MusicPlayer.updateDuration();
    };

    MusicPlayer.audio.onended = () => {
      MusicPlayer.next();
    };

    if (MusicPlayer.pauseTime) {
      MusicPlayer.audio.currentTime = MusicPlayer.pauseTime;
    }

    MusicPlayer.audio.play();
  }

  static stop() {
    if (!MusicPlayer.audio) {
      return;
    }

    MusicPlayer.pauseTime = MusicPlayer.audio.currentTime;
    MusicPlayer.audio.pause();
    MusicPlayer.elements.play.classList.add("paused");
    MusicPlayer.paused = true;
  }
}
