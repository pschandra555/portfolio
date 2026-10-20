import type { MetadataRoute } from "next";
import { profile } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.name}: Security Engineer`,
    short_name: "SC Dossier",
    description: profile.summary,
    start_url: "/",
    display: "browser",
    background_color: "#0D0F0E",
    theme_color: "#0D0F0E",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
