"use client";

import { useEffect } from "react";

let printed = false;

/** Mini-CTF flag 2 of 3 lives here, ROT13'd. (See lib/ctf.ts.) */
const ROTATED = "SYNT{p0af0y3_p0jo0l}";

export function ConsoleBanner() {
  useEffect(() => {
    if (printed) return;
    printed = true;
    console.log("%c CASE #SC-0x7F3A ", "background:#FFB000;color:#0D0F0E;font:700 13px ui-monospace,monospace;padding:3px 8px");
    console.log(
      `%cYou opened the console. Good instinct.\n\nThis dossier hides three flags. Here's one, rotated 13 places:\n\n    ${ROTATED}\n\nDecode it, then press \` and run:  submit FLAG{...}`,
      "font:12px/1.6 ui-monospace,monospace;color:#8E8C86",
    );
  }, []);
  return null;
}
