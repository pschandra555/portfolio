"use client";

import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Which cipher field this device gets:
 *  - "webgl"  full shader field (desktop-class GPU)
 *  - "canvas" lightweight 2D canvas field (phones, low-power, save-data, no WebGL2)
 *  - "none"   reduced motion: the page is already declassified, no field at all
 */
export type FieldTier = "webgl" | "canvas" | "none";

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

export function pickFieldTier(): FieldTier {
  if (prefersReducedMotion()) return "none";
  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return "canvas";
  if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768) return "canvas";
  if ((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4) return "canvas";
  return hasCapableWebGL2() ? "webgl" : "canvas";
}

function hasCapableWebGL2() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    // Software rasterisers can't hold 60fps on a fullscreen shader.
    return !/swiftshader|llvmpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}
