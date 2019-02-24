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
let letterImages: HTMLImageElement[][];

export function init() {
  letterImages = letterPatterns.map(lp => createLetterImages(lp));
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
  const ci = colorChars.indexOf(color);
  view.context.drawImage(letterImages[cc][ci], x * 24 + 24, y * 24 + 24);
  return "char";
}

function createLetterImages(pattern: string) {
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = 6 * 4;
  const ctx = cvs.getContext("2d");
  const p = pattern.split("\n").slice(1, 6);
  return range(rgbObjects.length).map(i => {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    p.forEach((l, y) => {
      for (let x = 0; x < 5; x++) {
        const c = l.charAt(x);
        let ci = colorChars.indexOf(c);
        if (c !== "" && ci >= 0) {
          if (ci === 6) {
            ci = i;
          }
          const rgb = rgbObjects[ci];
          ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
          ctx.fillRect((x + 1) * 4, (y + 1) * 4, 4, 4);
        }
      }
    });
    const img = document.createElement("img");
    img.src = cvs.toDataURL();
    return img;
  });
}
