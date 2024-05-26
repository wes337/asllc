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
import Settings from "./settings.js";

export default class Interface {
  static title = null;

  static socialMediaLinks = {
    apple: PIXI.Sprite.from(INTERFACE_SPRITES.apple.src),
    spotify: PIXI.Sprite.from(INTERFACE_SPRITES.spotify.src),
    ig: PIXI.Sprite.from(INTERFACE_SPRITES.ig.src),
    web: PIXI.Sprite.from(INTERFACE_SPRITES.web.src),
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
      settings: null,
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
      fill: COLORS.white,
      dropShadowColor: COLORS.black,
      wordWrap: false,
    }),
  };

  static notification = {
    show: false,
    button: PIXI.Sprite.from(INTERFACE_SPRITES.notification.src),
  };

  static spotlight = {
    background: new PIXI.Graphics(),
    target: null,
  };

  static setupNavbarEventListeners() {
    if (this.navBar.buttons.initialized) {
      return;
    }

    ["about", "artists", "music", "settings"].forEach((button) => {
      this.navBar.buttons[button].eventMode = "static";
      this.navBar.buttons[button].cursor = "pointer";
      this.navBar.buttons[button].addListener("pointerdown", () => {
        if (Modal.visible) {
          return;
        }

        if (MODALS[button]) {
          Modal.show(MODALS[button]);
        } else if (button === "music") {
          MusicPlayer.open();
        } else if (button === "settings") {
          Settings.open();
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
      this.artistInfo.text.text = "";
      this.hideBar("artistInfo");
    } else if (artistId && !this.artistInfo.show) {
      this.showBar("artistInfo");
    }

    this.renderSocialMediaLinks();
  }

  static renderArtistInfo() {
    if (!this.artistId || !this.artistInfo.show) {
      this.artistInfo.background.clear();
      this.artistInfo.container.pivot.y = this.artistInfo.height() * -2;

      this.spotlight.target = null;

      return;
    }

    const scale = State.scale();

    const floor = Building.allFloors.find(
      (floor) => floor.id === this.artistId
    );

    // Text
    const marginX = 40 * scale;
    this.artistInfo.text.style.fontSize = isLargeSizedScreen()
      ? FONT_SIZES.xxl
      : FONT_SIZES.xl;

    if (this.artistInfo.text.text.length > 11) {
      this.artistInfo.text.style.letterSpacing = -2;
    }

    let positionY;

    if (floor.basement) {
      const offset = isMobileSizedScreen() ? 20 : -20;

      positionY =
        floor.position.y() +
        floor.height() +
        this.artistInfo.text.height * -1 +
        offset * scale;
    } else {
      const offset = isMobileSizedScreen() ? 110 : 150;

      positionY =
        floor.position.y() + this.artistInfo.text.height + offset * scale;
      this.artistInfo.text.position.y = positionY;
    }

    if (isLargeSizedScreen()) {
      const amount = floor.basement ? -20 : 30;
      positionY = positionY + amount * scale;
    }

    this.artistInfo.text.position.y = positionY;

    this.artistInfo.text.position.x =
      floor.position.x() - floor.width() / 2 + Elevator.shaft.width + marginX;

    // Background
    this.artistInfo.background.clear();

    // Border
    this.artistInfo.background.beginFill(COLORS.black);
    this.artistInfo.background.drawRect(
      this.artistInfo.text.position.x - 20 * scale,
      this.artistInfo.text.position.y - 20 * scale,
      floor.width() - Elevator.shaft.width,
      this.artistInfo.text.height
    );
    this.artistInfo.background.endFill();

    this.artistInfo.background.beginFill(COLORS.black);
    this.artistInfo.background.drawRect(
      this.artistInfo.text.position.x - 60 * scale,
      this.artistInfo.text.position.y - 20 * scale,
      floor.width() - Elevator.shaft.width + 40 * scale,
      this.artistInfo.text.height + 40 * scale
    );
    this.artistInfo.background.endFill();

    // Main background
    this.artistInfo.background.beginFill(COLORS.slateBlue);
    this.artistInfo.background.drawRect(
      this.artistInfo.text.position.x - marginX,
      this.artistInfo.text.position.y,
      floor.width() - Elevator.shaft.width,
      this.artistInfo.text.height
    );
    this.artistInfo.background.endFill();

    this.artistInfo.container.addChild(this.artistInfo.background);
    this.artistInfo.container.addChild(this.artistInfo.text);

    this.renderSocialMediaLinks();

    State.app.stage.addChild(this.artistInfo.container);
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

    const numberOfLinks = Object.keys(links).length;
    const positionX = State.app.screen.width / 2 + numberOfLinks * 310 * scale;

    const positionY =
      this.artistInfo.text.position.y +
      this.artistInfo.text.height * 1 +
      (isMobileSizedScreen() ? 40 : 80) * scale;

    Object.keys(links).forEach((icon, i) => {
      this.socialMediaLinks[icon].position.x =
        numberOfLinks === 1
          ? this.artistInfo.text.position.x +
            this.artistInfo.background.width -
            240 * scale
          : positionX -
            linkWidth * i -
            (this.artistInfo.margin() / 3) * (i + 1);

      this.socialMediaLinks[icon].position.y = isMobileSizedScreen()
        ? positionY + 50 * scale
        : positionY - 100 * scale;

      this.socialMediaLinks[icon].scale.x = scale / 1.2;
      this.socialMediaLinks[icon].scale.y = scale / 1.2;
      this.socialMediaLinks[icon].anchor.set(0.5);

      this.socialMediaLinks[icon].filters = [
        State.filters.highlight(isLargeSizedScreen() ? 6 : 4, COLORS.black),
      ];

      this.artistInfo.container.addChild(this.socialMediaLinks[icon]);
    });
  }

  static renderBottomBar() {
    const scale = State.scale();

    const positionY =
      State.app.screen.height -
      this.navBar.height() / 2 +
      State.app.stage.pivot.y;

    const offsetX = 25 * scale;

    // About
    this.navBar.buttons.about =
      this.navBar.buttons.about || PIXI.Sprite.from("about.png");
    this.navBar.buttons.about.scale.x = scale;
    this.navBar.buttons.about.scale.y = scale;
    this.navBar.buttons.about.position.y =
      positionY - this.navBar.buttons.about.height / 2 - 50 * scale;
    this.navBar.buttons.about.position.x =
      State.app.screen.width / 2 - this.navBar.buttons.about.width + offsetX;
    this.navBar.buttons.about.filters = [];
    this.navBar.container.addChild(this.navBar.buttons.about);

    // Artists
    this.navBar.buttons.artists =
      this.navBar.buttons.artists || PIXI.Sprite.from("artists.png");
    this.navBar.buttons.artists.scale.x = scale;
    this.navBar.buttons.artists.scale.y = scale;
    this.navBar.buttons.artists.position.y =
      positionY - this.navBar.buttons.artists.height / 2 - 50 * scale;
    this.navBar.buttons.artists.position.x =
      State.app.screen.width / 2 - 70 * scale + offsetX;
    this.navBar.buttons.artists.filters = [];
    this.navBar.container.addChild(this.navBar.buttons.artists);

    // Music
    this.navBar.buttons.music =
      this.navBar.buttons.music || PIXI.Sprite.from("music.png");
    this.navBar.buttons.music.scale.x = scale;
    this.navBar.buttons.music.scale.y = scale;
    this.navBar.buttons.music.position.y =
      positionY - this.navBar.buttons.music.height / 2 - 5 * scale;
    this.navBar.buttons.music.position.x =
      State.app.screen.width / 2 -
      this.navBar.buttons.music.width -
      this.navBar.buttons.about.width +
      90 * scale +
      offsetX;
    this.navBar.container.addChild(this.navBar.buttons.music);

    // Settings
    this.navBar.buttons.settings =
      this.navBar.buttons.settings || PIXI.Sprite.from("settings.png");
    this.navBar.buttons.settings.scale.x = scale;
    this.navBar.buttons.settings.scale.y = scale;
    this.navBar.buttons.settings.position.y =
      positionY - this.navBar.buttons.settings.height / 2 - 5 * scale;
    this.navBar.buttons.settings.position.x =
      State.app.screen.width / 2 +
      this.navBar.buttons.artists.width -
      165 * scale +
      offsetX;
    this.navBar.container.addChild(this.navBar.buttons.settings);

    const hover = this.navBar.buttons.hover;
    if (hover) {
      this.navBar.buttons[hover].position.y -= 25 * scale;
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

  static renderSpotlight() {
    this.spotlight.background.clear();

    if (!this.spotlight.target) {
      return;
    }

    const scale = State.scale();
    const width = State.app.screen.width;
    const height = State.app.screen.height;

    let offsetY = 25 * scale;

    if (this.spotlight.target.basement) {
      offsetY = offsetY + 150 * scale;
    }

    // Bottom
    this.spotlight.background.beginFill(COLORS.black);
    this.spotlight.background.drawRect(
      0,
      this.spotlight.target.position.y() +
        this.spotlight.target.room.height / 2 +
        offsetY,
      width,
      height
    );
    this.spotlight.background.endFill();

    // Top
    this.spotlight.background.beginFill(COLORS.black);
    this.spotlight.background.drawRect(
      0,
      this.spotlight.target.position.y() +
        this.spotlight.target.room.height / 2 -
        height -
        this.spotlight.target.room.height +
        offsetY,
      width,
      height
    );
    this.spotlight.background.endFill();

    // Left
    this.spotlight.background.beginFill(COLORS.black);
    this.spotlight.background.drawRect(
      0,
      this.spotlight.target.position.y() - this.spotlight.target.height() / 2,
      width / 2 - 485 * scale,
      this.spotlight.target.height() * 2
    );
    this.spotlight.background.endFill();

    // Right
    this.spotlight.background.beginFill(COLORS.black);
    this.spotlight.background.drawRect(
      width / 2 + 760 * scale,
      this.spotlight.target.position.y() - this.spotlight.target.height() / 2,
      width / 2,
      this.spotlight.target.height() * 2
    );
    this.spotlight.background.endFill();

    this.spotlight.background.filters = this.spotlight.background.filters || [
      State.filters.opacity(0.5),
    ];

    State.app.stage.addChild(this.spotlight.background);
  }

  static setSpotlight(target) {
    this.spotlight.target = target;
  }

  static render() {
    this.renderSpotlight();

    // Need to reverse so the chat bubble draws
    // on top of the floors above the person
    [...State.people].reverse().forEach((person) => {
      if (person.chatBubble) {
        person.chatBubble.render();
      }
    });

    this.renderArtistInfo();
    this.renderBottomBar();
    this.renderNotification();

    Elevator.renderControls();
  }
}
