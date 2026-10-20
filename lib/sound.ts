"use client";

import { useSyncExternalStore } from "react";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Ambient sound, synthesised with Web Audio (no audio files to download).
 * OFF by default and never persisted: browsers only allow audio after a click,
 * so it always starts with the visitor choosing to turn it on.
 *  - hum:   brown noise through a low-pass + 50/100 Hz mains hum, slowly breathing
 *  - click: a short band-passed noise burst, like a typewriter key
 */
class Ambient {
  on = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private stopHum: (() => void) | null = null;
  private clickBuf: AudioBuffer | null = null;
  private listeners = new Set<() => void>();

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
  get = () => this.on;

  async toggle() {
    if (this.on) this.disable();
    else await this.enable();
    this.listeners.forEach((l) => l());
  }

  private async enable() {
    this.ctx ??= new AudioContext();
    await this.ctx.resume();
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
    this.master.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);

    // Brown noise, 4s loop
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 380;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.06;
    noise.connect(lp).connect(noiseGain).connect(this.master);

    // Slow "breathing" on the fans
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.13;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.015;
    lfo.connect(lfoGain).connect(noiseGain.gain);

    // Mains hum
    const hums = [50, 100].map((f, i) => {
      const o = ctx.createOscillator();
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.012 : 0.006;
      o.connect(g).connect(this.master!);
      return o;
    });

    [noise, lfo, ...hums].forEach((n) => n.start());
    this.stopHum = () => [noise, lfo, ...hums].forEach((n) => n.stop(ctx.currentTime + 0.6));

    // Click buffer: 28ms of decaying noise
    const cl = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.028), ctx.sampleRate);
    const cd = cl.getChannelData(0);
    for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / cd.length, 4);
    this.clickBuf = cl;
    this.on = true;
  }

  private disable() {
    if (this.ctx && this.master) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    }
    this.stopHum?.();
    this.stopHum = null;
    this.on = false;
  }

  /** A typewriter key. No-op while sound is off. */
  click(strength = 1) {
    if (!this.on || !this.ctx || !this.master || !this.clickBuf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.clickBuf;
    src.playbackRate.value = 0.85 + Math.random() * 0.4;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2400 + Math.random() * 1400;
    bp.Q.value = 1.2;
    const g = this.ctx.createGain();
    g.gain.value = (0.18 + Math.random() * 0.08) * strength;
    src.connect(bp).connect(g).connect(this.master);
    src.start();
  }

  /** A heavier thud (stamp slam). */
  thud() {
    this.click(2.2);
    if (prefersReducedMotion()) return;
    window.setTimeout(() => this.click(1.2), 40);
  }
}

export const ambient = new Ambient();

export function useAmbient() {
  return useSyncExternalStore(ambient.subscribe, ambient.get, () => false);
}
