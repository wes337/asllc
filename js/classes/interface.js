import { INTERFACE_SPRITES } from "../constants/sprites.js";
import { FLOORS } from "../constants/floors.js";
import { COLORS } from "../constants/colors.js";
import { TEXT_STYLES, FONT_SIZES } from "../constants/text.js";
import { isLargeSizedScreen, isMobileSizedScreen } from "../utils.js";
import Building from "./building.js";
import Modal from "./modal.js";
import Button from "./button.js";
import state from "../state.js";

export default class Interface {
  static title = PIXI.Sprite.from(INTERFACE_SPRITES.logo.src);

  static socialMediaLinks = {
    apple: PIXI.Sprite.from(INTERFACE_SPRITES.apple.src),
    spotify: PIXI.Sprite.from(INTERFACE_SPRITES.spotify.src),
    ig: PIXI.Sprite.from(INTERFACE_SPRITES.soundcloud.src),
  };

  static navBar = {
    container: new PIXI.Container(),
    height: () =>
      isLargeSizedScreen() ? 200 * state.scale() : 300 * state.scale(),
    background: new PIXI.Graphics(),
    show: false,
    buttons: {
      about: new Button("about", "About"),
      artists: new Button("artists", "Artists"),
      contact: new Button("contact", "Contact"),
    },
  };

  static artistInfo = {
    artistId: "",
    container: new PIXI.Container(),
    background: new PIXI.Graphics(),
    height: () =>
      isMobileSizedScreen() ? 400 * state.scale() : 350 * state.scale(),
    show: false,
    margin: 16,
    text: new PIXI.Text("", {
      ...TEXT_STYLES.default,
      fill: COLORS.yellow,
      wordWrap: true,
      align: "center",
    }),
  };

  static {
    this.navBar.buttons.about.callback = () => {
      if (Modal.visible) {
        return;
      }

      Modal.show({
        headerText: "About",
        bodyText: "",
        buttonText: "Okay",
        callback: () => {
          Modal.hide();
        },
      });
    };

    this.navBar.buttons.artists.callback = () => {
      if (Modal.visible) {
        return;
      }

      Modal.show({
        headerText: "Artists",
        bodyText: "",
        buttonText: "Okay",
        callback: () => {
          Modal.hide();
        },
      });
    };

    this.navBar.buttons.contact.callback = () => {
      if (Modal.visible) {
        return;
      }

      Modal.show({
        headerText: "Contact",
        bodyText: "",
        buttonText: "Okay",
        callback: () => {
          Modal.hide();
        },
      });
    };

    Object.entries(this.socialMediaLinks).forEach(([name, socialMediaLink]) => {
      socialMediaLink.eventMode = "static";
      socialMediaLink.cursor = "pointer";

      socialMediaLink.addListener("pointerenter", () => {
        socialMediaLink.filters = [state.filters.highlight(4, COLORS.purple)];
      });

      socialMediaLink.addListener("pointerleave", () => {
        socialMediaLink.filters = [];
      });

      socialMediaLink.addListener("pointerdown", () => {
        const link = FLOORS[this.artistId]?.links?.[name];

        if (link) {
          window.open(link, "_blank");
        }
      });
    });
  }

  static renderTitle() {
    const margin = 8;
    const minWidth = 360;

    const positionY = Math.max(
      state.app.stage.pivot.y + this.title.height / 2 + margin,
      Building.topFloor.position.y() - this.title.height * 3
    );

    this.title.position.set(state.app.screen.width / 2, positionY);

    if (
      this.title.width >= state.app.screen.width &&
      this.title.width !== minWidth
    ) {
      this.title.width = Math.max(state.app.screen.width - 10, minWidth);
      this.title.scale.y = this.title.scale.y - 0.1;
    }

    this.title.anchor.set(0.5);

    state.app.stage.addChild(this.title);
  }

  static showBar(bar) {
    state.busy = true;

    this[bar].show = true;
    this[bar].container.pivot.y = this[bar].height() * -1;

    const animation = (delta) => {
      const speed = 8 * delta;
      this[bar].container.pivot.y += speed;

      if (this[bar].container.pivot.y >= -2) {
        state.app.ticker.remove(animation);
        state.busy = false;
        this[bar].container.pivot.y = -2;
      }
    };

    state.app.ticker.add(animation);
  }

  static hideBar(bar) {
    state.busy = true;

    this[bar].container.pivot.y = -2;

    const animation = (delta) => {
      const speed = 8 * delta;
      this[bar].container.pivot.y -= speed;

      if (this[bar].container.pivot.y <= this[bar].height() * -1) {
        state.app.ticker.remove(animation);
        state.busy = false;
        this[bar].container.pivot.y = this[bar].height() * -1;
        this[bar].show = false;
      }
    };

    state.app.ticker.add(animation);
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
    const scale = state.scale();

    const backgroundColor = COLORS.darkGray;
    const borderColor = COLORS.purple;
    const borderSize = 4;

    const width = isMobileSizedScreen()
      ? state.app.screen.width
      : state.app.screen.width / 2;

    const positionX = isMobileSizedScreen() ? 0 : state.app.screen.width / 4;

    const positionY =
      state.app.screen.height -
      this.artistInfo.height() / 2 -
      this.navBar.height() +
      state.app.stage.pivot.y;

    // Background
    this.artistInfo.background.clear();
    this.artistInfo.background.beginFill(backgroundColor);
    this.artistInfo.background.drawRect(
      0,
      positionY - this.artistInfo.height() / 2,
      width,
      this.artistInfo.height()
    );

    this.artistInfo.background.endFill();
    this.artistInfo.container.addChild(this.artistInfo.background);
    this.artistInfo.container.position.x = positionX;

    // Top border
    this.artistInfo.background.beginFill(borderColor);
    this.artistInfo.background.drawRect(
      0,
      positionY - this.artistInfo.height() / 2 - borderSize,
      width + borderSize,
      borderSize
    );

    if (!isMobileSizedScreen()) {
      // Left border
      this.artistInfo.background.drawRect(
        positionX - state.app.screen.width / 4,
        positionY - this.artistInfo.height() / 2,
        borderSize,
        this.artistInfo.height()
      );

      // Right border
      this.artistInfo.background.drawRect(
        positionX + state.app.screen.width / 4,
        positionY - this.artistInfo.height() / 2,
        borderSize,
        this.artistInfo.height()
      );
    }

    // Text
    this.artistInfo.text.position.y =
      positionY - this.artistInfo.text.height / 2;

    this.artistInfo.text.style.wordWrapWidth = width;

    const hasSocialMediaLinks = this.artistId && FLOORS[this.artistId]?.links;
    const hasLongName =
      isMobileSizedScreen() &&
      hasSocialMediaLinks &&
      this.artistInfo.text.text.length >= 8;

    if (hasLongName) {
      this.artistInfo.text.style.letterSpacing = -2;
      this.artistInfo.text.style.fontSize = FONT_SIZES.xl;
      this.artistInfo.text.position.x = this.artistInfo.margin / 2;
    } else {
      this.artistInfo.text.style.letterSpacing = 0;
      this.artistInfo.text.style.fontSize = isMobileSizedScreen()
        ? FONT_SIZES.xxl
        : FONT_SIZES.xxxl;
      this.artistInfo.text.position.x = isMobileSizedScreen()
        ? this.artistInfo.margin
        : positionX - this.artistInfo.text.width / 2;
    }

    this.artistInfo.container.addChild(this.artistInfo.text);

    this.renderSocialMediaLinks();

    state.app.stage.addChild(this.artistInfo.container);

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

    const scale = state.scale();

    const linkWidth = INTERFACE_SPRITES.spotify.width * scale;

    const positionX = isMobileSizedScreen()
      ? state.app.screen.width - linkWidth / 2
      : state.app.screen.width / 2 - linkWidth / 2;

    const positionY =
      state.app.screen.height -
      this.artistInfo.height() / 2 -
      this.navBar.height() -
      2 +
      state.app.stage.pivot.y;

    Object.keys(links).forEach((icon, i) => {
      this.socialMediaLinks[icon].position.x =
        positionX - linkWidth * i - this.artistInfo.margin * (i + 1);
      this.socialMediaLinks[icon].position.y = positionY;
      this.socialMediaLinks[icon].scale.x = scale;
      this.socialMediaLinks[icon].scale.y = scale;
      this.socialMediaLinks[icon].anchor.set(0.5);

      this.artistInfo.container.addChild(this.socialMediaLinks[icon]);
    });
  }

  static renderBottomBar() {
    const backgroundColor = COLORS.darkGray;
    const borderColor = COLORS.purple;
    const borderSize = 4;

    const width = isMobileSizedScreen()
      ? state.app.screen.width
      : state.app.screen.width / 2;

    const positionX = isMobileSizedScreen() ? 0 : state.app.screen.width / 4;

    const positionY =
      state.app.screen.height -
      this.navBar.height() / 2 +
      state.app.stage.pivot.y;

    // Background
    this.navBar.background.clear();
    this.navBar.background.beginFill(backgroundColor);
    this.navBar.background.drawRect(
      0,
      positionY - this.navBar.height() / 2,
      width,
      this.navBar.height()
    );

    // Top border
    this.navBar.background.beginFill(borderColor);
    this.navBar.background.drawRect(
      0,
      positionY - this.navBar.height() / 2 - borderSize,
      width + borderSize,
      borderSize
    );

    if (!isMobileSizedScreen()) {
      // Left border
      this.navBar.background.drawRect(
        positionX - state.app.screen.width / 4,
        positionY - this.navBar.height() / 2,
        borderSize,
        this.navBar.height()
      );

      // Right border
      this.navBar.background.drawRect(
        positionX + state.app.screen.width / 4,
        positionY - this.navBar.height() / 2,
        borderSize,
        this.navBar.height()
      );
    }

    this.navBar.background.endFill();
    this.navBar.container.addChild(this.navBar.background);
    this.navBar.container.position.x = positionX;

    // Nav Buttons
    const { about, artists, contact } = this.navBar.buttons;

    this.navBar.container.addChild(about.button);
    this.navBar.container.addChild(artists.button);
    this.navBar.container.addChild(contact.button);

    const buttonMargin = 8;
    const buttonWidth = this.navBar.background.width / 3 - buttonMargin;
    const buttonHeight = this.navBar.height() - borderSize - buttonMargin;
    const buttonPositionY = positionY - buttonHeight / 2 - borderSize / 4;

    // About
    about.width = buttonWidth;
    about.height = buttonHeight;
    about.position.y = buttonPositionY;
    about.position.x = isMobileSizedScreen()
      ? borderSize + buttonMargin * 0.2
      : borderSize + buttonMargin * 0.5;
    about.render();

    // Artists
    artists.width = buttonWidth;
    artists.height = buttonHeight;
    artists.position.y = buttonPositionY;
    artists.position.x = isMobileSizedScreen()
      ? buttonWidth + buttonMargin * 1.3
      : buttonWidth + buttonMargin * 1.5;
    artists.render();

    // Contact
    contact.width = buttonWidth;
    contact.height = buttonHeight;
    contact.position.y = buttonPositionY;
    contact.position.x = isMobileSizedScreen()
      ? buttonWidth * 2 + buttonMargin * 2.4 - borderSize
      : buttonWidth * 2 + buttonMargin * 2.5 - borderSize;
    contact.render();

    state.app.stage.addChild(this.navBar.container);

    if (!this.navBar.show) {
      this.navBar.container.pivot.y = this.navBar.height() * -1;
    }
  }

  static render() {
    // Need to reverse so the chat bubble draws
    // on top of the floors above the person
    [...state.people].reverse().forEach((person) => {
      if (person.chatBubble) {
        person.chatBubble.render();
      }
    });

    this.renderTitle();
    this.renderArtistInfo();
    this.renderBottomBar();

    Modal.render();
  }
}
