"use client";

import { hero } from "@/content/site";
import { B64 } from "@/lib/cipher";

/** Glyphs the field cycles through while encrypted. */
export const CIPHER_SET = B64 + "#%&<>";

/** What the lens reveals: the one-liners from site.ts, run together like a plaintext page. */
export const PLAINTEXT = hero.lensLines.map((l) => l.toUpperCase()).join("  ·  ") + "  ·  ";

/** Printable ASCII (32..126) lives in the atlas, in code-point order. */
export const ATLAS_FIRST = 32;
export const ATLAS_COUNT = 95;
export const ATLAS_COLS = 16;
export const ATLAS_ROWS = Math.ceil(ATLAS_COUNT / ATLAS_COLS);

/**
 * Shared, mutable, per-frame state. Written by DOM listeners, read inside
 * the render loop, so pointer moves and scrolling never trigger React renders.
 */
export class FieldInput {
  /** pointer in hero-local CSS px */
  x = -9999;
  y = -9999;
  /** 0..1 target for the lens being open */
  lens = 0;
  /** 0 at the top of the page, 1 once the hero has scrolled out */
  exit = 0;
  set(patch: Partial<Pick<FieldInput, "x" | "y" | "lens" | "exit">>) {
    Object.assign(this, patch);
  }
}

/** Which tier is live, exposed to CSS as data-field on the hero. */
export function markHero(hero: HTMLElement, tier: string | null) {
  if (tier) hero.dataset.field = tier;
  else delete hero.dataset.field;
}

/** Field palette, read from the live CSS tokens so both themes stay in sync. */
export interface FieldPalette {
  ink: [number, number, number];
  accent: [number, number, number];
  accentText: [number, number, number];
  light: boolean;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.trim().replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export function readPalette(): FieldPalette {
  const cs = getComputedStyle(document.documentElement);
  return {
    ink: hexToRgb(cs.getPropertyValue("--ink")),
    accent: hexToRgb(cs.getPropertyValue("--accent")),
    accentText: hexToRgb(cs.getPropertyValue("--accent-text")),
    light: cs.getPropertyValue("color-scheme").trim() === "light",
  };
}

/** Re-run `cb` whenever the theme changes (toggle or OS). */
export function onThemeChange(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", cb);
  };
}

/** Cell size in CSS px. ~9×14 gives ~16k glyphs on a 1080p screen. */
export function cellSize(width: number, tier: "webgl" | "canvas"): [number, number] {
  if (tier === "webgl") return width > 2200 ? [10, 16] : [9, 14];
  // 2D canvas: cap at ~110 columns so a big screen never draws more than a few thousand glyphs.
  const w = Math.max(12, Math.ceil(width / 110));
  return [w, Math.round(w * 1.5)];
}

/**
 * Glyph atlas: printable ASCII in the site's mono face, white on black,
 * one glyph per cell. Sampled by the shader's red channel.
 */
export function buildAtlas(fontFamily: string, cellW = 36, cellH = 56) {
  const c = document.createElement("canvas");
  c.width = ATLAS_COLS * cellW;
  c.height = ATLAS_ROWS * cellH;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#fff";
  ctx.font = `500 ${Math.round(cellH * 0.62)}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < ATLAS_COUNT; i++) {
    const col = i % ATLAS_COLS;
    const row = Math.floor(i / ATLAS_COLS);
    ctx.fillText(String.fromCharCode(ATLAS_FIRST + i), col * cellW + cellW / 2, row * cellH + cellH * 0.54);
  }
  return c;
}

/**
 * Name mask: redraws the hero <h1>'s actual letterforms (same font, same
 * positions, read from the DOM) into a canvas the size of the hero. Cells
 * whose centre lands on a letter resolve to amber.
 */
export function buildNameMask(heroEl: HTMLElement) {
  const box = heroEl.getBoundingClientRect();
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(box.width));
  c.height = Math.max(1, Math.round(box.height));
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);

  const h1 = heroEl.querySelector("h1");
  if (!h1) return c;
  const cs = getComputedStyle(h1);
  ctx.font = `900 ${cs.fontSize} ${cs.fontFamily}`;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";

  for (const word of h1.querySelectorAll<HTMLElement>(".dc-word")) {
    // A zero-size inline-block sits on the baseline: its top *is* the baseline.
    const probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0;";
    word.appendChild(probe);
    const baseline = probe.getBoundingClientRect().top - box.top;
    probe.remove();
    for (const ch of word.querySelectorAll<HTMLElement>(".dc-ch")) {
      const r = ch.getBoundingClientRect();
      ctx.fillText(ch.querySelector(".dc-c")?.textContent ?? "", r.left - box.left, baseline);
    }
  }
  return c;
}

/** Hero scroll-out progress, 0..1. */
export const heroExit = (heroEl: HTMLElement) => {
  const r = heroEl.getBoundingClientRect();
  return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
};
