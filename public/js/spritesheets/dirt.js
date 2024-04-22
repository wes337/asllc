export default {
  frames: {
    "dirt-1.png": {
      frame: { x: 0, y: 0, w: 160, h: 320 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 160, h: 320 },
      sourceSize: { w: 160, h: 320 },
    },
    "dirt-2.png": {
      frame: { x: 0, y: 320, w: 160, h: 320 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 160, h: 320 },
      sourceSize: { w: 160, h: 320 },
    },
    "dirt-3.png": {
      frame: { x: 0, y: 640, w: 160, h: 320 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 160, h: 320 },
      sourceSize: { w: 160, h: 320 },
    },
  },
  animations: {
    dirt: ["dirt-1.png", "dirt-2.png", "dirt-3.png"],
  },
  meta: {
    app: "https://www.codeandweb.com/texturepacker",
    version: "1.1",
    image: "./img/spritesheets/dirt.png",
    format: "RGBA8888",
    size: { w: 160, h: 960 },
    scale: "1",
    smartupdate:
      "$TexturePacker:SmartUpdate:b46c5404232f564230e965800d98ab6e:18b30a55a591d240c9aa424e9f312f1a:be8392acf03ae3ecf1ee879477e86cf9$",
  },
};
