import Background from "./background.js";
import MusicPlayer from "./music.js";

export default class Settings {
  static settings = {
    sfx: true,
    music: true,
    night: false,
  };

  static elements = {
    container: document.getElementById("settings-container"),
    close: document.getElementById("settings-close"),
  };

  static {
    Settings.elements.close.addEventListener("click", Settings.close);

    Object.keys(Settings.settings).forEach((setting) => {
      const button = document.getElementById(`settings-${setting}`);
      button.addEventListener("click", () => Settings.toggle(setting));
    });
  }

  static check() {
    // Sync music player setting with settings
    if (MusicPlayer.playing && !Settings.settings.music) {
      Settings.set("music", true);
    }
  }

  static open() {
    Settings.elements.container.classList.add("show");
    Settings.check();
  }

  static close() {
    Settings.elements.container.classList.remove("show");
  }

  static set(setting, enabled) {
    if (Settings.settings[setting] === undefined) {
      return;
    }

    Settings.settings[setting] = enabled;

    const button = document.getElementById(`settings-${setting}`);
    const checkbox = button.querySelector(".checkbox");

    if (enabled) {
      checkbox.classList.add("on");
    } else {
      checkbox.classList.remove("on");
    }

    Settings.handle(setting, enabled);
  }

  static toggle(setting) {
    if (Settings.settings[setting] === undefined) {
      return;
    }

    const nextValue = !Settings.settings[setting];
    Settings.settings[setting] = nextValue;

    const button = document.getElementById(`settings-${setting}`);
    const checkbox = button.querySelector(".checkbox");

    if (nextValue) {
      checkbox.classList.add("on");
    } else {
      checkbox.classList.remove("on");
    }

    Settings.handle(setting, nextValue);
  }

  static handle(setting, enabled) {
    switch (setting) {
      case "music": {
        if (!enabled) {
          MusicPlayer.stop();
        }

        break;
      }

      case "night": {
        Background.toggleNightMode(enabled);
        break;
      }

      default:
        break;
    }
  }
}
