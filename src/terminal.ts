import { letterPatterns } from "./util/letterPattern";
import * as view from "./view";
import { range, wrap } from "./util/math";
import { Vector, VectorLike } from "./util/vector";

const rgbNumbers = [
  0x000000,
  0xe91e63,
  0x4caf50,
  0xffeb3b,
  0x3f51b5,
  0x9c27b0,
  0x03a9f4,
  0xeeeeee
];
const rgbObjects = rgbNumbers.map(n => {
  return {
    r: (n & 0xff0000) >> 16,
    g: (n & 0xff00) >> 8,
    b: n & 0xff
  };
});
export let size = new Vector();
export let letterImages: HTMLImageElement[];
let letterCanvas: HTMLCanvasElement;
let letterContext: CanvasRenderingContext2D;
let charGrid: string[][];
let colorGrid: string[][];
let backgroundColorGrid: string[][];
let rotationGrid: string[][];
const colorChars = "lrgybpcw";
type ColorChar = "l" | "r" | "g" | "y" | "b" | "p" | "c" | "w";
const rotationChars = "kljhnmbvopiu9087";
const dotCount = 6;
const dotSize = 2;
const letterSize = dotCount * dotSize;
export const paddingTop = 1;
export const paddingBottom = 1;
let topLineStr = "";
let bottomLineStr = "";
let topCharOptions: CharOptions = getCharOption("l", "w");
let bottomCharOptions: CharOptions = getCharOption("l", "w");

export function init() {
  letterCanvas = document.createElement("canvas");
  letterCanvas.width = letterCanvas.height = letterSize;
  letterContext = letterCanvas.getContext("2d");
  letterImages = letterPatterns.map(lp => createLetterImages(lp));
}

export function setSize(_size: VectorLike) {
  size.set(_size);
  charGrid = range(size.x).map(() => range(size.y).map(() => undefined));
  colorGrid = range(size.x).map(() => range(size.y).map(() => undefined));
  backgroundColorGrid = range(size.x).map(() =>
    range(size.y).map(() => undefined)
  );
  rotationGrid = range(size.x).map(() => range(size.y).map(() => undefined));
}

export function printWithColor(str: string) {
  print("", 0, 0, { charAndColorPattern: str });
}

export type Options = {
  colorPattern?: string;
  backgroundColorPattern?: string;
  rotationPattern?: string;
  charAndColorPattern?: string;
};

export function print(
  _str: string,
  x: number,
  y: number,
  options: Options = {}
) {
  const bx = x;
  let colorLines =
    options.colorPattern != null ? options.colorPattern.split("\n") : undefined;
  const backgroundColorLines =
    options.backgroundColorPattern != null
      ? options.backgroundColorPattern.split("\n")
      : undefined;
  const rotationLines =
    options.rotationPattern != null
      ? options.rotationPattern.split("\n")
      : undefined;
  let str = _str;
  if (options.charAndColorPattern != null) {
    const cc = options.charAndColorPattern.split("\n");
    str = cc.filter((l, i) => i % 2 === 1).join("\n");
    colorLines = cc.filter((l, i) => i > 0 && i % 2 === 0);
  }
  let lx = 0;
  let ly = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === "\n") {
      x = bx;
      y++;
      lx = 0;
      ly++;
      continue;
    }
    if (x < 0 || x >= size.x || y < 0 || y >= size.y) {
      x++;
      lx++;
      continue;
    }
    charGrid[x][y] = c;
    colorGrid[x][y] = getCharFromLines(colorLines, lx, ly);
    backgroundColorGrid[x][y] = getCharFromLines(backgroundColorLines, lx, ly);
    rotationGrid[x][y] = getCharFromLines(rotationLines, lx, ly);
    x++;
    lx++;
  }
}

export function printTop(str: string) {
  topLineStr = str;
}

export function printBottom(str: string) {
  bottomLineStr = str;
}

export function setTopCharOption(cg?: string, bg?: string, rg?: string) {
  topCharOptions = getCharOption(cg, bg, rg);
}

export function setBottomCharOption(cg?: string, bg?: string, rg?: string) {
  bottomCharOptions = getCharOption(cg, bg, rg);
}

function getCharFromLines(lines: string[], x: number, y: number) {
  if (lines == null) {
    return undefined;
  }
  if (y >= lines.length) {
    return undefined;
  }
  const c = lines[y].charAt(x);
  return c === "" || c === " " ? undefined : c;
}

export function getCharAt(_x: number, _y: number) {
  const x = wrap(_x, 0, size.x);
  const y = wrap(_y, 0, size.y);
  const char = charGrid[x][y];
  const cg = colorGrid[x][y];
  const bg = backgroundColorGrid[x][y];
  const rg = rotationGrid[x][y];
  return { char, options: getCharOption(cg, bg, rg) };
}

export type CharOptions = {
  color?: ColorChar;
  backgroundColor?: ColorChar;
  angleIndex?: number;
  isMirrorX?: boolean;
  isMirrorY?: boolean;
  scale?: number;
};

export function setCharAt(
  _x: number,
  _y: number,
  char: string,
  options?: CharOptions
) {
  const x = wrap(_x, 0, size.x);
  const y = wrap(_y, 0, size.y);
  charGrid[x][y] = char;
  if (options == null) {
    colorGrid[x][y] = backgroundColorGrid[x][y] = rotationGrid[x][
      y
    ] = undefined;
    return;
  }
  colorGrid[x][y] = options.color;
  backgroundColorGrid[x][y] = options.backgroundColor;
  if (options.angleIndex == null) {
    rotationGrid[x][y] = undefined;
  } else {
    let ri = options.angleIndex;
    if (options.isMirrorX) {
      ri |= 4;
    }
    if (options.isMirrorY) {
      ri |= 8;
    }
    rotationGrid[x][y] = rotationChars.charAt(ri);
  }
}

export function update() {
  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      const c = charGrid[x][y];
      if (c == null) {
        continue;
      }
      const cg = colorGrid[x][y];
      const bg = backgroundColorGrid[x][y];
      const rg = rotationGrid[x][y];
      printChar(c, x, y, getCharOption(cg, bg, rg));
    }
  }
  for (let x = 0; x < size.x; x++) {
    printChar(topLineStr.charAt(x) + " ", x, -1, topCharOptions);
    printChar(bottomLineStr.charAt(x) + " ", x, size.y, bottomCharOptions);
  }
}

export function getCharOption(cg?: string, bg?: string, rg?: string) {
  let options: CharOptions = {
    color: "w",
    backgroundColor: "l",
    angleIndex: 0,
    isMirrorX: false,
    isMirrorY: false,
    scale: 1
  };
  if (cg != null && isColorChars(cg)) {
    options.color = cg;
  }
  if (bg != null && isColorChars(bg)) {
    options.backgroundColor = bg;
  }
  if (rg != null) {
    const ri = rotationChars.indexOf(rg);
    if (ri >= 0) {
      options.angleIndex = ri % 4;
      options.isMirrorX = (ri & 4) > 0;
      options.isMirrorY = (ri & 8) > 0;
    }
  }
  return options;
}

export function clear() {
  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      charGrid[x][y] = colorGrid[x][y] = backgroundColorGrid[x][
        y
      ] = rotationGrid[x][y] = undefined;
    }
  }
}

export function getState() {
  return {
    charGrid: charGrid.map(l => [].concat(l)),
    colorGrid: colorGrid.map(l => [].concat(l)),
    backgroundColorGrid: backgroundColorGrid.map(l => [].concat(l)),
    rotationGrid: rotationGrid.map(l => [].concat(l))
  };
}

export function setState(state) {
  charGrid = state.charGrid.map(l => [].concat(l));
  colorGrid = state.colorGrid.map(l => [].concat(l));
  backgroundColorGrid = state.backgroundColorGrid.map(l => [].concat(l));
  rotationGrid = state.rotationGrid.map(l => [].concat(l));
}

function printChar(c: string, x: number, y: number, options: CharOptions) {
  const cca = c.charCodeAt(0);
  if (cca < 0x20 || cca > 0x7e) {
    return;
  }
  if (
    x < 0 ||
    x + options.scale > size.x ||
    y < -paddingTop ||
    y + options.scale > size.y + paddingBottom
  ) {
    return;
  }
  const ix = (x + 1) * letterSize;
  const iy = (y + 1 + paddingTop) * letterSize;
  const scaledSize = letterSize * options.scale;
  if (cca == 0x20 && options.backgroundColor === "b") {
    view.context.clearRect(ix, iy, scaledSize, scaledSize);
    return;
  }
  const rgb = rgbObjects[colorChars.indexOf(options.backgroundColor)];
  view.context.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  view.context.fillRect(ix, iy, scaledSize, scaledSize);
  if (cca == 0x20) {
    return;
  }
  const cc = cca - 0x21;
  if (
    options.color === "w" &&
    options.angleIndex % 4 === 0 &&
    !options.isMirrorX &&
    !options.isMirrorY
  ) {
    view.context.drawImage(letterImages[cc], ix, iy, scaledSize, scaledSize);
    return;
  }
  letterContext.clearRect(0, 0, letterSize, letterSize);
  if (
    options.angleIndex % 4 === 0 &&
    !options.isMirrorX &&
    !options.isMirrorY
  ) {
    letterContext.drawImage(letterImages[cc], 0, 0);
  } else {
    letterContext.save();
    letterContext.translate(letterSize / 2, letterSize / 2);
    letterContext.rotate((Math.PI / 2) * options.angleIndex);
    if (options.isMirrorX || options.isMirrorY) {
      letterContext.scale(
        options.isMirrorX ? -1 : 1,
        options.isMirrorY ? -1 : 1
      );
    }
    letterContext.drawImage(letterImages[cc], -letterSize / 2, -letterSize / 2);
    letterContext.restore();
  }
  if (options.color !== "w") {
    letterContext.globalCompositeOperation = "source-in";
    const rgb = rgbObjects[colorChars.indexOf(options.color)];
    letterContext.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    letterContext.fillRect(0, 0, letterSize, letterSize);
    letterContext.globalCompositeOperation = "source-over";
  }
  view.context.drawImage(letterCanvas, ix, iy, scaledSize, scaledSize);
}

function createLetterImages(
  pattern: string,
  isSkippingFirstAndLastLine = true
) {
  letterContext.clearRect(0, 0, letterSize, letterSize);
  let p = pattern.split("\n");
  if (isSkippingFirstAndLastLine) {
    p = p.slice(1, p.length - 1);
  }
  const ph = p.length;
  let padding = Math.ceil((dotCount - ph) / 2);
  if (padding < 0) {
    padding = 0;
  }
  p.forEach((l, y) => {
    if (y + padding >= dotCount) {
      return;
    }
    for (let x = 0; x < dotCount - padding; x++) {
      const c = l.charAt(x);
      let ci = colorChars.indexOf(c);
      if (c !== "" && ci > 0) {
        const rgb = rgbObjects[ci];
        letterContext.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        letterContext.fillRect(
          (x + padding) * dotSize,
          (y + padding) * dotSize,
          dotSize,
          dotSize
        );
      }
    }
  });
  const img = document.createElement("img");
  img.src = letterCanvas.toDataURL();
  return img;
}

function isColorChars(c: string): c is ColorChar {
  return colorChars.indexOf(c) >= 0;
}
