import Tone from "tone";
import MMLIterator from "mml-iterator";
import { range } from "./util/math";

export const synths = [
  new Tone.Synth(getSynthParams("pulse")).toMaster(),
  new Tone.Synth(getSynthParams("square")).toMaster(),
  new Tone.Synth(getSynthParams("triangle")).toMaster(),
  new Tone.NoiseSynth().toMaster()
];
const mmls: string[] = range(4).map(() => undefined);
const parts: Tone.Part[] = range(4).map(() => undefined);
const tempo = 200;
const defaultOctave = 4;
const defaultLength = 32;

Tone.Transport.start();

export function play(synthNumber: number, mml: string) {
  mmls[synthNumber] = mml;
}

export function update() {
  mmls.forEach((mml, i) => {
    if (mml == null) {
      return;
    }
    if (parts[i] != null) {
      parts[i].stop();
    }
    parts[i] = getPart(
      synths[i],
      `t${tempo} o${defaultOctave} l${defaultLength} ${mml}`,
      i === 3
    );
    parts[i].start(0.1);
    mmls[i] = undefined;
  });
}

function getPart(synth, mml: string, isNoise: boolean) {
  const notes: any[] = Array.from(new MMLIterator(mml)).filter(
    (n: any) => n.type === "note"
  );
  if (isNoise) {
    return new Tone.Part(
      (time, value) => {
        synth.triggerAttackRelease(value.duration, time);
      },
      notes.map(n => {
        return { time: `+${n.time}`, duration: n.duration };
      })
    );
  } else {
    return new Tone.Part(
      (time, value) => {
        synth.triggerAttackRelease(value.freq, value.duration, time);
      },
      notes.map(n => {
        return {
          time: `+${n.time}`,
          duration: n.duration,
          freq: midiNoteNumberToFrequency(n.noteNumber)
        };
      })
    );
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
