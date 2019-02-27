import { letterPatterns } from "./util/letterPattern";
import * as view from "./view";
import { range } from "./util/math";

const rgbNumbers = [
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
const colorChars = "rgybpcw";
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

export function print(str: string, x: number, y: number, color = "w") {
  const bx = x;
  for (let i = 0; i < str.length; i++) {
    const r = printChar(str[i], x, y, color);
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
  color = "w"
): PrintCharResult {
  const cca = c.charCodeAt(0);
  if (cca === 0xa) {
    return "cr";
  } else if (cca < 0x21 || cca > 0x60) {
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
  if (color === "w") {
    view.context.drawImage(letterImages[cc], ix, iy);
    return;
  }
  letterContext.globalCompositeOperation = "source-over";
  letterContext.clearRect(0, 0, letterSize, letterSize);
  letterContext.drawImage(letterImages[cc], 0, 0);
  letterContext.globalCompositeOperation = "source-in";
  const rgb = rgbObjects[colorChars.indexOf(color)];
  letterContext.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  letterContext.fillRect(0, 0, letterSize, letterSize);

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
      if (c !== "" && ci >= 0) {
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
