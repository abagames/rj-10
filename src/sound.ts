import Tone from "tone";
import MMLIterator from "mml-iterator";
import { range } from "./util/math";

export const synths = [
  new Tone.Synth(getSynthParams("pulse")).toMaster(),
  new Tone.Synth(getSynthParams("square")).toMaster(),
  new Tone.Synth(getSynthParams("triangle")).toMaster(),
  new Tone.NoiseSynth().toMaster()
];
export const mmls: string[] = range(4).map(() => undefined);
const tempo = 200;
const defaultOctave = 5;
const defaultLength = 32;

export function play(synthNumber: number, mml: string) {
  mmls[synthNumber] = mml;
}

export function update() {
  mmls.forEach((mml, i) => {
    if (mml == null) {
      return;
    }
    playSynth(
      synths[i],
      `t${tempo} o${defaultOctave} l${defaultLength} ${mml}`
    );
    mmls[i] = undefined;
  });
}

function playSynth(synth, mml: string) {
  const iter = new MMLIterator(mml);
  for (let n of iter) {
    if (n.type === "note") {
      const freq = midiNoteNumberToFrequency(n.noteNumber);
      synth.triggerAttackRelease(freq, n.duration, `+${n.time + 0.1}`);
    }
  }
}

export function resumeAudioContext() {
  Tone.context.resume();
}

function getSynthParams(type: string) {
  return {
    oscillator: {
      type
    }
  };
}

function midiNoteNumberToFrequency(d) {
  const a = 440;
  return a * Math.pow(2, (d - 69) / 12);
}
