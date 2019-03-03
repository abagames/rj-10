import { letterPatterns } from "./util/letterPattern";
import * as view from "./view";

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
const dotCount = 6;
const dotSize = 2;
const letterSize = dotCount * dotSize;
let letterImages: HTMLImageElement[];
let letterCanvas: HTMLCanvasElement;
let letterContext: CanvasRenderingContext2D;

export function init() {
  letterCanvas = document.createElement("canvas");
  letterCanvas.width = letterCanvas.height = letterSize;
  letterContext = letterCanvas.getContext("2d");
  letterImages = letterPatterns.map(lp => createLetterImages(lp));
}

const colorChars = "lrgybpcw";
type ColorChars = "l" | "r" | "g" | "y" | "b" | "p" | "c" | "w";

function isColorChars(c: string): c is ColorChars {
  return colorChars.indexOf(c) >= 0;
}

const rotationChars = "kljhnmbvopiu9087";

export type Options = {
  color?: ColorChars;
  backgroundColor?: ColorChars;
  angleIndex?: number;
  isMirrorX?: boolean;
  isMirrorY?: boolean;
  scale?: number;
  colorPattern?: string;
  backgroundColorPattern?: string;
  rotationPattern?: string;
};

const defaultOptions: Options = {
  color: "w",
  backgroundColor: "l",
  angleIndex: 0,
  isMirrorX: false,
  isMirrorY: false,
  scale: 1,
  colorPattern: undefined,
  backgroundColorPattern: undefined,
  rotationPattern: undefined
};

export function print(str: string, x: number, y: number, _options?: Options) {
  let options = { ...defaultOptions, ..._options };
  const bx = x;
  const colorLines =
    options.colorPattern != null ? options.colorPattern.split("\n") : undefined;
  const backgroundColorLines =
    options.backgroundColorPattern != null
      ? options.backgroundColorPattern.split("\n")
      : undefined;
  const rotationLines =
    options.rotationPattern != null
      ? options.rotationPattern.split("\n")
      : undefined;
  let isChangingOption = false;
  let lx = 0;
  let ly = 0;
  for (let i = 0; i < str.length; i++) {
    if (isChangingOption) {
      options = { ...defaultOptions, ..._options };
      isChangingOption = false;
    }
    if (colorLines != null) {
      const cc = getCharFromLines(colorLines, lx, ly);
      if (cc != null && isColorChars(cc)) {
        options.color = cc;
        isChangingOption = true;
      }
    }
    if (backgroundColorLines != null) {
      const bc = getCharFromLines(backgroundColorLines, lx, ly);
      if (bc != null && isColorChars(bc)) {
        options.backgroundColor = bc;
        isChangingOption = true;
      }
    }
    if (rotationLines != null) {
      const rc = getCharFromLines(rotationLines, lx, ly);
      if (rc != null) {
        const ri = rotationChars.indexOf(rc);
        if (ri >= 0) {
          options.angleIndex = ri % 4;
          options.isMirrorX = Math.floor(ri / 4) % 2 === 1;
          options.isMirrorY = Math.floor(ri / 4) >= 2;
          isChangingOption = true;
        }
      }
    }
    const r = printChar(str[i], x, y, options);
    if (r === "cr") {
      x = bx;
      y += options.scale;
      lx = 0;
      ly++;
    } else {
      x += options.scale;
      lx++;
    }
  }
}

function getCharFromLines(lines: string[], x: number, y: number) {
  if (y >= lines.length) {
    return undefined;
  }
  const c = lines[y].charAt(x);
  return c === "" || c === " " ? undefined : c;
}

export type PrintCharResult = "char" | "space" | "cr";

export function printChar(
  c: string,
  _x: number,
  _y: number,
  _options?: Options
): PrintCharResult {
  const options = { ...defaultOptions, ..._options };
  const cca = c.charCodeAt(0);
  if (cca === 0xa) {
    return "cr";
  } else if (cca < 0x21 || cca > 0x7e) {
    return "space";
  }
  const x = Math.floor(_x);
  const y = Math.floor(_y);
  if (x < 0 || x + options.scale > 16 || y < 0 || y + options.scale > 16) {
    return "char";
  }
  const cc = cca - 0x21;
  const ix = (x + 1) * letterSize;
  const iy = (y + 1) * letterSize;
  const scaledSize = letterSize * options.scale;
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
  return "char";
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
