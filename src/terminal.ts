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

let dotPatterns: { x: number; y: number; color: string }[][];
let letterImages: HTMLImageElement[];
let bloomLetterImages: HTMLImageElement[];

export function init() {
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = 6 * 4;
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = "#eee";
  letterImages = range(letterPatterns.length).map(() =>
    document.createElement("img")
  );
  const blCvs = document.createElement("canvas");
  const blScl = view.bloomScale;
  blCvs.width = blCvs.height = (8 * 4) / blScl;
  const blCtx = blCvs.getContext("2d");
  blCtx.fillStyle = "#bbb";
  bloomLetterImages = range(letterPatterns.length).map(() =>
    document.createElement("img")
  );
  dotPatterns = [];
  letterPatterns.forEach((lp, i) => {
    let dots = [];
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    blCtx.clearRect(0, 0, blCvs.width, blCvs.height);
    const p = lp.split("\n").slice(1, 6);
    p.forEach((l, y) => {
      for (let x = 0; x < 5; x++) {
        const c = l.charAt(x);
        if (c !== "" && colorChars.indexOf(c) >= 0) {
          dots.push({ x, y, color: c });
          ctx.fillRect((x + 1) * 4, (y + 1) * 4, 4, 4);
          blCtx.fillRect(
            ((x + 1) * 4 - 2) / blScl,
            ((y + 1) * 4 - 2) / blScl,
            8 / blScl,
            8 / blScl
          );
        }
      }
    });
    dotPatterns.push(dots);
    letterImages[i].src = cvs.toDataURL();
    bloomLetterImages[i].src = blCvs.toDataURL();
  });
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
  const rgb = rgbObjects[colorChars.indexOf(color)];
  const cc = cca - 0x21;
  /*dotPatterns[cc].forEach(d => {
    view.fillRect(
      x * 24 + d.x * 4 + 24 + 4 + 2,
      y * 24 + d.y * 4 + 24 + 4 + 2,
      4,
      4,
      rgb,
      0.7
    );
  });*/
  view.drawImage(
    letterImages[cc],
    x * 24 + 24,
    y * 24 + 24,
    bloomLetterImages[cc]
  );
  return "char";
}
