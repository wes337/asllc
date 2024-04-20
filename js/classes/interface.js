import { INTERFACE_SPRITES } from "../constants/sprites.js";
import { FLOORS } from "../constants/floors.js";
import { COLORS } from "../constants/colors.js";
import { MODALS } from "../constants/modal.js";
import { TEXT_STYLES, FONT_SIZES } from "../constants/text.js";
import { isLargeSizedScreen, isMobileSizedScreen } from "../utils.js";
import Building from "./building.js";
import Elevator from "./elevator.js";
import Modal from "./modal.js";
import State from "./state.js";
import SoundPlayer from "./sound.js";
import MusicPlayer from "./music.js";

export default class Interface {
  static title = null;

  static socialMediaLinks = {
    apple: PIXI.Sprite.from(INTERFACE_SPRITES.apple.src),
    spotify: PIXI.Sprite.from(INTERFACE_SPRITES.spotify.src),
    ig: PIXI.Sprite.from(INTERFACE_SPRITES.ig.src),
  };

  static navBar = {
    container: new PIXI.Container(),
    height: () => 300 * State.scale(),
    background: new PIXI.Graphics(),
    show: false,
    buttons: {
      about: null,
      artists: null,
      music: null,
      initialized: false,
      hover: null,
    },
  };

  static artistInfo = {
    artistId: "",
    container: new PIXI.Container(),
    background: new PIXI.Graphics(),
    height: () =>
      isMobileSizedScreen() ? 400 * State.scale() : 350 * State.scale(),
    show: false,
    margin: () => (isMobileSizedScreen() ? 12 : 16),
    text: new PIXI.Text("", {
      ...TEXT_STYLES.default,
      fill: COLORS.yellow,
      wordWrap: true,
      align: "center",
    }),
  };

  static notification = {
    show: false,
    button: PIXI.Sprite.from(INTERFACE_SPRITES.notification.src),
  };

  static musicPlayer = {
    playing: false,
  };

  static onToggleMusicPlayer() {
    MusicPlayer.toggle();
    this.musicPlayer.playing = !this.musicPlayer.playing;
    this.navBar.buttons.music.filters = this.musicPlayer.playing
      ? [State.filters.adjustment({ brightness: 1.5 })]
      : [];
  }

  static setupNavbarEventListeners() {
    if (this.navBar.buttons.initialized) {
      return;
    }

    ["about", "artists", "music"].forEach((button) => {
      this.navBar.buttons[button].eventMode = "static";
      this.navBar.buttons[button].cursor = "pointer";
      this.navBar.buttons[button].addListener("pointerdown", () => {
        if (Modal.visible) {
          return;
        }

        if (MODALS[button]) {
          Modal.show(MODALS[button]);
        } else if (button === "music") {
          // Find a better way to do this
          this.onToggleMusicPlayer();
        }

        this.navBar.buttons.hover = null;
        SoundPlayer.play("click.wav");
      });

      this.navBar.buttons[button].addListener("pointerenter", () => {
        if (Modal.visible) {
          return;
        }

        this.navBar.buttons.hover = button;
      });

      this.navBar.buttons[button].addListener("pointerleave", () => {
        if (Modal.visible) {
          return;
        }

        this.navBar.buttons.hover = null;
      });
    });

    this.navBar.buttons.initialized = true;
  }

  static {
    this.notification.button.eventMode = "static";
    this.notification.button.cursor = "pointer";
    this.notification.button.addListener(
      "pointertap",
      this.onNotificationClick.bind(this)
    );

    Object.entries(this.socialMediaLinks).forEach(([name, socialMediaLink]) => {
      socialMediaLink.eventMode = "static";
      socialMediaLink.cursor = "pointer";

      socialMediaLink.addListener("pointerenter", () => {
        socialMediaLink.filters = [State.filters.highlight(4, COLORS.purple)];
      });

      socialMediaLink.addListener("pointerleave", () => {
        socialMediaLink.filters = [];
      });

      socialMediaLink.addListener("pointertap", (event) => {
        event.stopPropagation();

        const link = FLOORS[this.artistId]?.links?.[name];

        if (link) {
          window.open(link, "_blank");
        }
      });
    });
  }

  static renderTitle() {
    this.title = this.title ? this.title : PIXI.Sprite.from("logo.gif");

    const margin = 8;
    const minWidth = 360;

    const positionY = Math.max(
      State.app.stage.pivot.y + this.title.height / 2 + margin,
      Building.topFloor.position.y() - this.title.height * 3
    );

    this.title.position.set(State.app.screen.width / 2, positionY);

    if (
      this.title.width >= State.app.screen.width &&
      this.title.width !== minWidth
    ) {
      this.title.width = Math.max(State.app.screen.width - 10, minWidth);
      this.title.scale.y = this.title.scale.y - 0.1;
    }

    this.title.anchor.set(0.5);

    State.app.stage.addChild(this.title);
  }

  static showBar(bar) {
    State.busy = true;

    this[bar].show = true;
    this[bar].container.pivot.y = this[bar].height() * -1;

    const animation = (delta) => {
      const speed = 8 * delta;
      this[bar].container.pivot.y += speed;

      if (this[bar].container.pivot.y >= -2) {
        State.app.ticker.remove(animation);
        State.busy = false;
        this[bar].container.pivot.y = -2;
      }
    };

    State.app.ticker.add(animation);
  }

  static hideBar(bar) {
    State.busy = true;

    this[bar].container.pivot.y = -2;

    const animation = (delta) => {
      const speed = 8 * delta;
      this[bar].container.pivot.y -= speed;

      if (this[bar].container.pivot.y <= this[bar].height() * -1) {
        State.app.ticker.remove(animation);
        State.busy = false;
        this[bar].container.pivot.y = this[bar].height() * -1;
        this[bar].show = false;
      }
    };

    State.app.ticker.add(animation);
  }

  static showNavBar() {
    this.showBar("navBar");
  }

  static setArtistInfo(artistId) {
    this.artistId = artistId || "";
    const artistName = FLOORS[artistId]?.name;
    this.artistInfo.text.text = artistName || "";

    if (!artistName || ["Lobby", "Artist Services"].includes(artistName)) {
      this.hideBar("artistInfo");
    } else if (artistId && !this.artistInfo.show) {
      this.showBar("artistInfo");
    }
  }

  static renderArtistInfo() {
    const backgroundColor = COLORS.darkGray;
    const borderColor = COLORS.darkSlateBlue;
    const borderSize = 4;

    const scale = State.scale();

    const width = isMobileSizedScreen() ? State.app.screen.width : 1800 * scale;

    const positionX = isMobileSizedScreen()
      ? 0
      : State.app.screen.width / 2 - width / 2;

    const positionY =
      State.app.screen.height -
      this.artistInfo.height() / 2 -
      this.navBar.height() +
      State.app.stage.pivot.y;

    // Background
    this.artistInfo.background.clear();
    this.artistInfo.background.beginFill(backgroundColor);
    this.artistInfo.background.drawRect(
      0,
      positionY -
        (isMobileSizedScreen()
          ? this.artistInfo.height() / 3
          : this.artistInfo.height()),
      width,
      isMobileSizedScreen()
        ? this.artistInfo.height() * 2
        : this.artistInfo.height() * 4
    );

    this.artistInfo.background.endFill();
    this.artistInfo.container.addChild(this.artistInfo.background);
    this.artistInfo.container.position.x = positionX;

    // Top border
    this.artistInfo.background.beginFill(borderColor);
    this.artistInfo.background.drawRect(
      0,
      positionY -
        (isMobileSizedScreen()
          ? this.artistInfo.height() / 3
          : this.artistInfo.height()) -
        borderSize,
      width + borderSize,
      borderSize
    );

    if (!isMobileSizedScreen()) {
      // Left border
      this.artistInfo.background.drawRect(
        0,
        positionY - this.artistInfo.height(),
        borderSize,
        this.artistInfo.height() * 4
      );

      // Right border
      this.artistInfo.background.drawRect(
        1800 * scale,
        positionY - this.artistInfo.height(),
        borderSize,
        this.artistInfo.height() * 4
      );
    }

    // Text

    this.artistInfo.text.style.wordWrapWidth = width;

    const hasSocialMediaLinks = this.artistId && FLOORS[this.artistId]?.links;

    if (isMobileSizedScreen()) {
      this.artistInfo.text.position.y =
        positionY - this.artistInfo.text.height / 3;
    } else if (hasSocialMediaLinks) {
      this.artistInfo.text.position.y =
        positionY - this.artistInfo.text.height * 2 + 20 * scale;
    } else {
      this.artistInfo.text.position.y = positionY - this.artistInfo.text.height;
    }

    this.artistInfo.text.style.letterSpacing = isLargeSizedScreen() ? 0 : -2;
    this.artistInfo.text.style.fontSize = isMobileSizedScreen()
      ? FONT_SIZES.xl
      : FONT_SIZES.xxl;

    if (isLargeSizedScreen()) {
      this.artistInfo.text.style.fontSize = FONT_SIZES.xxxl;
    }

    this.artistInfo.text.position.x = isMobileSizedScreen()
      ? this.artistInfo.margin()
      : 900 * scale - this.artistInfo.text.width / 2;

    if (!hasSocialMediaLinks && isMobileSizedScreen()) {
      this.artistInfo.text.position.x =
        State.app.screen.width / 2 - this.artistInfo.text.width / 2;
    }

    this.artistInfo.container.addChild(this.artistInfo.text);

    this.renderSocialMediaLinks();

    State.app.stage.addChild(this.artistInfo.container);

    if (!this.artistInfo.show) {
      this.artistInfo.container.pivot.y = this.artistInfo.height() * -2;
    }
  }

  static renderSocialMediaLinks() {
    const links = this.artistId && FLOORS[this.artistId]?.links;

    Object.entries(this.socialMediaLinks).forEach(([name, socialMediaLink]) => {
      socialMediaLink.visible = !!(links && links[name]);
    });

    if (!links) {
      return;
    }

    const scale = State.scale();

    const linkWidth = INTERFACE_SPRITES.spotify.width * scale;

    const positionX = isMobileSizedScreen()
      ? State.app.screen.width - linkWidth / 2
      : (1800 * scale) / 2 +
        (linkWidth * Object.keys(links).length - 1) / 2 -
        100 * scale;

    const positionY =
      State.app.screen.height -
      this.artistInfo.height() / 2 -
      this.navBar.height() -
      2 +
      State.app.stage.pivot.y;

    Object.keys(links).forEach((icon, i) => {
      this.socialMediaLinks[icon].position.x =
        positionX - linkWidth * i - (this.artistInfo.margin() / 2) * (i + 1);
      this.socialMediaLinks[icon].position.y = isMobileSizedScreen()
        ? positionY + 40 * scale
        : positionY;
      this.socialMediaLinks[icon].scale.x = scale;
      this.socialMediaLinks[icon].scale.y = scale;
      this.socialMediaLinks[icon].anchor.set(0.5);

      this.artistInfo.container.addChild(this.socialMediaLinks[icon]);
    });
  }

  static renderBottomBar() {
    const scale = State.scale();

    const positionY =
      State.app.screen.height -
      this.navBar.height() / 2 +
      State.app.stage.pivot.y;

    // About
    this.navBar.buttons.about =
      this.navBar.buttons.about || PIXI.Sprite.from("settings.png");
    this.navBar.buttons.about.scale.x = isMobileSizedScreen()
      ? scale * 1.2
      : scale;
    this.navBar.buttons.about.scale.y = isMobileSizedScreen()
      ? scale * 1.2
      : scale;
    this.navBar.buttons.about.position.y =
      positionY - this.navBar.buttons.about.height / 2;
    this.navBar.buttons.about.position.x = isMobileSizedScreen()
      ? this.navBar.buttons.about.width
      : State.app.screen.width / 2 - this.navBar.buttons.about.width;
    this.navBar.container.addChild(this.navBar.buttons.about);

    // Artists
    this.navBar.buttons.artists =
      this.navBar.buttons.artists || PIXI.Sprite.from("music.png");
    this.navBar.buttons.artists.scale.x = isMobileSizedScreen()
      ? scale * 1.2
      : scale;
    this.navBar.buttons.artists.scale.y = isMobileSizedScreen()
      ? scale * 1.2
      : scale;
    this.navBar.buttons.artists.position.y =
      positionY - this.navBar.buttons.artists.height / 2;
    this.navBar.buttons.artists.position.x = isMobileSizedScreen()
      ? State.app.screen.width / 2
      : State.app.screen.width / 2;
    this.navBar.container.addChild(this.navBar.buttons.artists);

    // Music
    this.navBar.buttons.music =
      this.navBar.buttons.music || PIXI.Sprite.from("music-gray.png");
    this.navBar.buttons.music.scale.x = isMobileSizedScreen()
      ? scale * 0.8
      : scale;
    this.navBar.buttons.music.scale.y = isMobileSizedScreen()
      ? scale * 0.8
      : scale;
    this.navBar.buttons.music.position.y = isMobileSizedScreen()
      ? positionY - this.navBar.buttons.music.height * 0.6
      : positionY - this.navBar.buttons.music.height;
    this.navBar.buttons.music.position.x = isMobileSizedScreen()
      ? this.navBar.buttons.music.width / 8
      : this.navBar.buttons.music.width / 2;
    this.navBar.container.addChild(this.navBar.buttons.music);

    const hover = this.navBar.buttons.hover;
    if (hover) {
      this.navBar.buttons[hover].position.y -=
        this.navBar.buttons[hover].height / 8;
    }

    State.app.stage.addChild(this.navBar.container);

    if (!this.navBar.show) {
      this.navBar.container.pivot.y = this.navBar.height() * -1;
    }

    this.setupNavbarEventListeners();
  }

  static async onNotificationClick(event) {
    if (!this.notification.show) {
      return;
    }

    event.stopPropagation();

    this.stopHighlight(this.notification.button);

    this.notification.show = false;

    // Get person in elevator
    const person = Elevator.personInside;
    if (!person) {
      return;
    }

    await Building.lobby.moveCameraToFloor();
    Elevator.controls.show = true;
    this.setArtistInfo("");

    person.chatBubble.show(
      `${
        person.originalFloorNumber < 0
          ? person.originalFloorNumber
          : person.originalFloorNumber + 1
      }`,
      0
    );

    Building.allFloors.forEach((floor) => {
      if (typeof floor.toggleIndicator !== "function") {
        return;
      }

      floor.toggleIndicator(floor.number === person.originalFloorNumber);
    });
  }

  static renderNotification() {
    this.notification.button.visible = this.notification.show;

    if (!this.notification.show) {
      return;
    }

    const scale = isMobileSizedScreen() ? State.scale() * 1.5 : State.scale();

    const scaledWidth = INTERFACE_SPRITES.notification.width * scale;
    const scaledHeight = INTERFACE_SPRITES.notification.height * scale;

    const margin = 50 * scale;

    const positionX = isMobileSizedScreen()
      ? scaledWidth / 2 + margin * 2
      : State.app.screen.width / 2 - 800 * scale;

    const positionY =
      State.app.screen.height -
      (this.artistInfo.show ? this.artistInfo.height() : 0) -
      this.navBar.height() -
      scaledHeight / 2 +
      State.app.stage.pivot.y -
      margin;

    this.notification.button.position.set(positionX, positionY);
    this.notification.button.scale.y = scale;
    this.notification.button.scale.x = scale;
    this.notification.button.anchor.set(0.5);

    State.app.stage.addChild(this.notification.button);
  }

  static flashHighlightAnimation = null;

  static stopHighlight(sprite) {
    if (this.flashHighlightAnimation) {
      State.app.ticker.remove(this.flashHighlightAnimation);
    }

    if (typeof sprite.highlight === "undefined") {
      sprite.filters = [];
    } else {
      sprite.highlight = false;
    }
  }

  static startHighlight(sprite, times = 5) {
    try {
      if (this.flashHighlightAnimation) {
        State.app.ticker.remove(this.flashHighlightAnimation);
      }

      let start = State.app.ticker.lastTime;
      let count = 0;

      this.flashHighlightAnimation = (delta) => {
        if (State.app.ticker.lastTime >= start + 1000 * delta) {
          count++;
          start = State.app.ticker.lastTime;
        }

        const show = count % 2;

        if (typeof sprite.highlight === "undefined") {
          sprite.filters = show ? [State.filters.highlight(4)] : [];
        } else {
          sprite.highlight = !!show;
        }

        if (count >= times * 2) {
          State.app.ticker.remove(this.flashHighlightAnimation);
          if (typeof sprite.highlight === "undefined") {
            sprite.filters = [];
          } else {
            sprite.highlight = false;
          }
        }
      };

      State.app.ticker.add(this.flashHighlightAnimation);
    } catch (error) {
      if (this.flashHighlightAnimation) {
        State.app.ticker.remove(this.flashHighlightAnimation);
      }

      console.error(error);
    }
  }

  static render() {
    // Need to reverse so the chat bubble draws
    // on top of the floors above the person
    [...State.people].reverse().forEach((person) => {
      if (person.chatBubble) {
        person.chatBubble.render();
      }
    });

    this.renderTitle();
    this.renderArtistInfo();
    this.renderBottomBar();
    this.renderNotification();

    Elevator.renderControls();
  }
}
