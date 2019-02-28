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
const colorChars = " rgybpcw";
const dotCount = 6;
const dotSize = 4;
const letterSize = dotCount * dotSize;
let letterImages: HTMLImageElement[];
let letterCanvas: HTMLCanvasElement;
let letterContext: CanvasRenderingContext2D;

export function init() {
  letterCanvas = document.createElement("canvas");
  letterCanvas.width = letterCanvas.height = letterSize;
  letterContext = letterCanvas.getContext("2d");
  letterImages = letterPatterns.map(lp => createLetterImages(lp, 1, 1));
}

export type Options = {
  color?: " " | "r" | "g" | "y" | "b" | "p" | "c" | "w";
  backgroundColor?: " " | "r" | "g" | "y" | "b" | "p" | "c" | "w";
  angleIndex?: number;
  isMirrorX?: boolean;
  isMirrorY?: boolean;
};

const defaultOptions: Options = {
  color: "w",
  backgroundColor: " ",
  angleIndex: 0,
  isMirrorX: false,
  isMirrorY: false
};

export function print(str: string, x: number, y: number, _options?: Options) {
  const options = { ...defaultOptions, ..._options };
  const bx = x;
  for (let i = 0; i < str.length; i++) {
    const r = printChar(str[i], x, y, options);
    if (r === "cr") {
      x = bx;
      y++;
    } else {
      x++;
    }
  }
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
  if (x < 0 || x > 15 || y < 0 || y > 15) {
    return "char";
  }
  const cc = cca - 0x21;
  const ix = (x + 1) * letterSize;
  const iy = (y + 1) * letterSize;
  if (
    options.color === "w" &&
    options.backgroundColor === " " &&
    options.angleIndex % 4 === 0 &&
    !options.isMirrorX &&
    !options.isMirrorY
  ) {
    view.context.drawImage(letterImages[cc], ix, iy);
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
  if (options.backgroundColor !== " ") {
    const rgb = rgbObjects[colorChars.indexOf(options.backgroundColor)];
    view.context.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    view.context.fillRect(ix, iy, letterSize, letterSize);
  }
  view.context.drawImage(letterCanvas, ix, iy);
  return "char";
}

function createLetterImages(
  pattern: string,
  paddingX = 0,
  paddingY = 0,
  isSkippingFirstLine = true
) {
  letterContext.clearRect(0, 0, letterSize, letterSize);
  let p = pattern.split("\n");
  if (isSkippingFirstLine) {
    p = p.slice(1);
  }
  p.forEach((l, y) => {
    if (y + paddingY >= dotCount) {
      return;
    }
    for (let x = 0; x < dotCount - paddingX; x++) {
      const c = l.charAt(x);
      let ci = colorChars.indexOf(c);
      if (c !== "" && ci > 0) {
        const rgb = rgbObjects[ci];
        letterContext.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        letterContext.fillRect(
          (x + paddingX) * dotSize,
          (y + paddingY) * dotSize,
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
