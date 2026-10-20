import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the amber targeting reticle on graphite. */
export default function AppleIcon() {
  const c = "#FFB000";
  const arm = { position: "absolute" as const, width: 44, height: 44, borderColor: c, borderStyle: "solid" as const, borderWidth: 0 };
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0D0F0E", display: "flex", position: "relative" }}>
        <div style={{ ...arm, left: 30, top: 30, borderLeftWidth: 12, borderTopWidth: 12 }} />
        <div style={{ ...arm, right: 30, top: 30, borderRightWidth: 12, borderTopWidth: 12 }} />
        <div style={{ ...arm, left: 30, bottom: 30, borderLeftWidth: 12, borderBottomWidth: 12 }} />
        <div style={{ ...arm, right: 30, bottom: 30, borderRightWidth: 12, borderBottomWidth: 12 }} />
        <div style={{ position: "absolute", left: 78, top: 78, width: 24, height: 24, background: c }} />
      </div>
    ),
    size,
  );
}
