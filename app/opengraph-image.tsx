import { ImageResponse } from "next/og";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { profile } from "@/content/site";

export const alt = `${profile.name}: classified dossier cover. ${profile.role}.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (f: string) => readFile(join(process.cwd(), "assets/fonts", f));
const [display, mono, monoBold, type] = await Promise.all([
  font("big-shoulders-latin-900-normal.woff"),
  font("jetbrains-mono-latin-400-normal.woff"),
  font("jetbrains-mono-latin-700-normal.woff"),
  font("special-elite-latin-400-normal.woff"),
]);

const BG = "#0D0F0E";
const INK = "#E8E6E1";
const MUTED = "#8E8C86";
const RULE = "#2A2D2B";
const AMBER = "#FFB000";
const STAMP = "#E05A45";

// Deterministic cipher rows for the background.
const HEX = "0123456789ABCDEF";
const rows = Array.from({ length: 22 }, (_, r) =>
  Array.from({ length: 92 }, (_, c) => HEX[(r * 31 + c * 17 + ((r * c) % 7)) % 16]).join(""),
);
const bars = Array.from({ length: 48 }, (_, i) => 1 + ((i * 7 + 3) % 4));

/** Dossier cover: the share image for every page. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BG, color: INK, padding: 56, position: "relative", fontFamily: "Mono" }}>
        {/* cipher field */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "18px 24px", opacity: 0.09, fontSize: 18, lineHeight: 1.55, color: INK }}>
          {rows.map((r, i) => (
            <span key={i}>{r}</span>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, letterSpacing: 2, color: MUTED }}>
          <span style={{ color: INK }}>[SUBJECT DOSSIER · INTERCEPTED TRANSMISSION]</span>
          <span>CASE #{profile.caseNo}</span>
        </div>
        <div style={{ height: 1, background: RULE, marginTop: 18, display: "flex" }} />

        <div style={{ display: "flex", flexDirection: "column", marginTop: 34, fontFamily: "Display", fontSize: 212, lineHeight: 0.84, letterSpacing: -2 }}>
          <span>{profile.firstName.toUpperCase()}</span>
          <span style={{ paddingLeft: 120, color: AMBER }}>{profile.lastName.toUpperCase()}</span>
        </div>

        {/* stamp */}
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 150,
            display: "flex",
            border: `4px solid ${STAMP}`,
            padding: 6,
            transform: "rotate(-8deg)",
          }}
        >
          <div style={{ display: "flex", border: `2px solid ${STAMP}`, padding: "10px 26px", fontFamily: "Type", fontSize: 54, color: STAMP, letterSpacing: 6 }}>
            CLASSIFIED
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 24 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ display: "flex", width: 150, height: 22, background: INK }} />
              <span style={{ color: INK }}>{profile.role.toUpperCase()}</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 12, color: AMBER, fontWeight: 700 }}>
              <span style={{ display: "flex", width: 14, height: 14, background: AMBER }} />
              CLEARANCE: {profile.status.toUpperCase()}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 56 }}>
            {bars.map((w, i) => (
              <span key={i} style={{ display: "flex", width: w * 2, height: 56, background: i % 2 ? "transparent" : INK }} />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Display", data: display, weight: 900, style: "normal" },
        { name: "Mono", data: mono, weight: 400, style: "normal" },
        { name: "Mono", data: monoBold, weight: 700, style: "normal" },
        { name: "Type", data: type, weight: 400, style: "normal" },
      ],
    },
  );
}
