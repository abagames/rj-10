import Tone from "tone";

export const pulseSynth = new Tone.Synth(getSynthParams("pulse")).toMaster();
export const squareSynth = new Tone.Synth(getSynthParams("square")).toMaster();
export const triangleSynth = new Tone.Synth(
  getSynthParams("triangle")
).toMaster();
export const noiseSynth = new Tone.NoiseSynth().toMaster();

export function resumeAudioContext() {
  Tone.context.resume();
}

function getSynthParams(type: string) {
  return {
    oscillator: {
      type
    },
    envelope: {
      release: 0.07
    }
  };
}
