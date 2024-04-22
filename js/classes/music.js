export default class MusicPlayer {
  static audio = new Audio();
  static tracks = ["track-1.mp3", "track-2.mp3", "track-3.mp3", "track-4.mp3"];
  static currentTrackNumber = 0;

  static get currentTrack() {
    const trackFileName = this.tracks[this.currentTrackNumber];

    return trackFileName ? `./sounds/${trackFileName}` : null;
  }

  static get isPlaying() {
    return !!(this.audio && this.audio.duration > 0 && !this.audio.paused);
  }

  static toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  static gotoNextTrack() {
    const nextTrackNumber = this.currentTrackNumber + 1;
    const nextTrack = this.tracks[nextTrackNumber];

    if (nextTrack) {
      this.currentTrackNumber = nextTrackNumber;
    } else {
      this.currentTrackNumber = 0;
    }
  }

  static gotoPreviousTrack() {
    const previousTrackNumber = this.currentTrackNumber - 1;
    const previousTrack = this.tracks[previousTrackNumber];

    if (previousTrack) {
      this.currentTrackNumber = previousTrackNumber;
    } else {
      this.currentTrackNumber = this.tracks.length - 1;
    }
  }

  static play() {
    if (!this.currentTrack) {
      return;
    }

    this.audio.src = this.currentTrack;
    this.audio.volume = 0.2;

    this.audio.onended = () => {
      this.gotoNextTrack();
      this.play();
    };

    const playPromise = this.audio.play().catch(() => {
      // Do nothing
    });

    if (playPromise !== undefined) {
      this.audio.play().catch(() => {
        // Do nothing
        return;
      });
    }
  }

  static stop() {
    if (!this.audio) {
      return;
    }

    this.audio.pause();
    this.audio.currentTime = 0;
  }
}
