"use client";

import { useEffect, useState, useSyncExternalStore, type ComponentType } from "react";
import { overlays } from "@/lib/overlays";
import { GlobalKeys } from "./GlobalKeys";
import { ConsoleBanner } from "./ConsoleBanner";
import { Reticle } from "@/components/cursor/Reticle";

type Lazy = { Palette: ComponentType; Terminal: ComponentType };
let loaded: Lazy | null = null;
let loading: Promise<Lazy> | null = null;
const load = () =>
  (loading ??= Promise.all([import("./CommandPalette"), import("./Terminal")]).then(([p, t]) => (loaded = { Palette: p.CommandPalette, Terminal: t.Terminal })));

/**
 * Everything that floats above the dossier. The ⌘K index and the terminal
 * (with all their command data) are only downloaded the first time either
 * is opened, so they cost nothing on first load.
 */
export function Overlays() {
  const current = useSyncExternalStore(overlays.subscribe, overlays.get, () => null);
  const [mods, setMods] = useState<Lazy | null>(loaded);

  useEffect(() => {
    if (current && !mods) load().then(setMods);
  }, [current, mods]);

  return (
    <>
      <GlobalKeys />
      <ConsoleBanner />
      {mods && (
        <>
          <mods.Palette />
          <mods.Terminal />
        </>
      )}
      <Reticle />
      {/* Captured by the View Transition so the redaction bar can sweep between pages. */}
      <div className="vt-sweep" aria-hidden="true" />
    </>
  );
}
