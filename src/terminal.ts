import { letterPatterns } from "./util/letterPattern";
import * as view from "./view";
import { range } from "./util/math";

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
const size = 16;
const dotCount = 6;
const dotSize = 2;
const letterSize = dotCount * dotSize;
let letterImages: HTMLImageElement[];
let letterCanvas: HTMLCanvasElement;
let letterContext: CanvasRenderingContext2D;
const charGrid = range(size).map(() => range(size).map(() => undefined));
const colorGrid = range(size).map(() => range(size).map(() => undefined));
const backgroundColorGrid = range(size).map(() =>
  range(size).map(() => undefined)
);
const rotationGrid = range(size).map(() => range(size).map(() => undefined));

export function init() {
  letterCanvas = document.createElement("canvas");
  letterCanvas.width = letterCanvas.height = letterSize;
  letterContext = letterCanvas.getContext("2d");
  letterImages = letterPatterns.map(lp => createLetterImages(lp));
}

const colorChars = "lrgybpcw";
type ColorChar = "l" | "r" | "g" | "y" | "b" | "p" | "c" | "w";

function isColorChars(c: string): c is ColorChar {
  return colorChars.indexOf(c) >= 0;
}

const rotationChars = "kljhnmbvopiu9087";

export type Options = {
  colorPattern?: string;
  backgroundColorPattern?: string;
  rotationPattern?: string;
};

export function print(str: string, x: number, y: number, options?: Options) {
  const bx = x;
  const colorLines =
    options != null && options.colorPattern != null
      ? options.colorPattern.split("\n")
      : undefined;
  const backgroundColorLines =
    options != null && options.backgroundColorPattern != null
      ? options.backgroundColorPattern.split("\n")
      : undefined;
  const rotationLines =
    options != null && options.rotationPattern != null
      ? options.rotationPattern.split("\n")
      : undefined;
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
    if (x < 0 || x >= size || y < 0 || y >= size) {
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

export type PrintCharOptions = {
  color?: ColorChar;
  backgroundColor?: ColorChar;
  angleIndex?: number;
  isMirrorX?: boolean;
  isMirrorY?: boolean;
  scale?: number;
};

export function printChar(
  c: string,
  _x: number,
  _y: number,
  options: PrintCharOptions
) {
  const cca = c.charCodeAt(0);
  if (cca < 0x20 || cca > 0x7e) {
    return;
  }
  const x = Math.floor(_x);
  const y = Math.floor(_y);
  if (x < 0 || x + options.scale > size || y < 0 || y + options.scale > size) {
    return;
  }
  const ix = (x + 1) * letterSize;
  const iy = (y + 1) * letterSize;
  const scaledSize = letterSize * options.scale;
  if (cca == 0x20) {
    view.context.clearRect(ix, iy, scaledSize, scaledSize);
    return;
  }
  const cc = cca - 0x21;
  const rgb = rgbObjects[colorChars.indexOf(options.backgroundColor)];
  view.context.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  view.context.fillRect(ix, iy, scaledSize, scaledSize);
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

export function update() {
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const c = charGrid[x][y];
      if (c == null) {
        continue;
      }
      let options: PrintCharOptions = {
        color: "w",
        backgroundColor: "l",
        angleIndex: 0,
        isMirrorX: false,
        isMirrorY: false,
        scale: 1
      };
      const cg = colorGrid[x][y];
      const bg = backgroundColorGrid[x][y];
      const rg = rotationGrid[x][y];
      if (cg == null && bg == null && rg == null) {
        printChar(c, x, y, options);
        continue;
      }
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
          options.isMirrorX = Math.floor(ri / 4) % 2 === 1;
          options.isMirrorY = Math.floor(ri / 4) >= 2;
        }
      }
      printChar(c, x, y, options);
    }
  }
}

export function clear() {
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      charGrid[x][y] = colorGrid[x][y] = backgroundColorGrid[x][
        y
      ] = rotationGrid[x][y] = undefined;
    }
  }
}
