const TRACKS = [
  { fileName: "track-1.mp3", title: "Peaceful Street - Brahman" },
  { fileName: "track-2.mp3", title: "Header - Skotskr" },
  { fileName: "track-3.mp3", title: "Lo_fi - Skotskr" },
  { fileName: "track-4.mp3", title: "Very Lush and Swag Loop" },
];

export default class MusicPlayer {
  static audio = new Audio();
  static currentTrackNumber = 0;
  static paused = false;
  static elements = {
    container: document.getElementById("music-player-container"),
    trackInfo: document.getElementById("music-player-track-info"),
    play: document.getElementById("music-player-play"),
    nextTrack: document.getElementById("music-player-next-track"),
    prevTrack: document.getElementById("music-player-prev-track"),
    close: document.getElementById("music-player-close"),
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
    MusicPlayer.elements.trackInfo.innerHTML = MusicPlayer.currentTrackTitle;
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
    MusicPlayer.audio.onended = () => {
      MusicPlayer.next();
    };

    const playPromise = MusicPlayer.audio.play().catch(() => {
      // Do nothing
    });

    if (playPromise !== undefined) {
      MusicPlayer.audio.play().catch(() => {
        // Do nothing
      });
    }
  }

  static stop() {
    if (!MusicPlayer.audio) {
      return;
    }

    MusicPlayer.audio.pause();
    MusicPlayer.audio.currentTime = 0;
    MusicPlayer.elements.play.classList.add("paused");
    MusicPlayer.paused = true;
  }
}
