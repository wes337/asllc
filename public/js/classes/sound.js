export default class SoundPlayer {
  static audio;

  static play(soundEffect, quiet) {
    try {
      if (this.audio && typeof this.audio.remove === "function") {
        this.audio.remove();
      }

      const audio = new Audio(`/sounds/${soundEffect}`);
      this.audio = audio;
      audio.volume = quiet ? 0.1 : 0.3;

      const playPromise = audio.play().catch(() => {
        // Do nothing
      });

      if (playPromise !== undefined) {
        audio
          .play()
          .then(() => {
            audio.remove();
          })
          .catch(() => {
            // Do nothing
            return;
          });
      }
    } catch {
      // Do nothing
    }
  }
}
