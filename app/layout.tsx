import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Inter_Tight, JetBrains_Mono, Special_Elite } from "next/font/google";
import { links, profile } from "@/content/site";
import { themeBootScript } from "@/lib/theme";
import { personJsonLd } from "@/lib/jsonld";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Hud } from "@/components/hud/Hud";
import { FileTabs } from "@/components/nav/FileTabs";
import { Overlays } from "@/components/overlays/Overlays";
import "./globals.css";

const display = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  axes: ["opsz"],
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "sans-serif"],
});
// Body copy is the LCP element. "optional" paints once with the metric-matched
// fallback if the font isn't ready in ~100ms, so a late swap never delays LCP.
// Only weight 400 is used, so load one static file instead of the variable font.
const sans = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"], weight: "400", display: "optional" });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
// Stamps only: not worth a preload slot on the critical path.
const type = Special_Elite({ variable: "--font-special-elite", subsets: ["latin"], weight: "400", preload: false });

const SOURCE_NOTE =
  "<!-- TODO(sc): strip before prod. staging flag for the CTF: FLAG{v13w_s0urc3_n3v3r_l13s}  (you read source. respect.) -->";

export const metadata: Metadata = {
  metadataBase: new URL(links.site),
  title: {
    default: `${profile.name}: Security Engineer`,
    template: `%s · ${profile.name}`,
  },
  description: profile.summary,
  applicationName: `${profile.name} · Dossier`,
  authors: [{ name: profile.name, url: links.github }],
  creator: profile.name,
  keywords: [profile.name, "security engineer", "cyber security", "offensive security", "threat detection", "DevSecOps", "honeypot", "VIT Vellore", "portfolio"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: `${profile.name} · Dossier`,
    title: `${profile.name}: Security Engineer`,
    description: profile.summary,
    locale: "en_IN",
    firstName: profile.firstName,
    lastName: profile.lastName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name}: Security Engineer`,
    description: profile.summary,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0D0F0E" },
    { media: "(prefers-color-scheme: light)", color: "#EFECE4" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} ${type.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {/* Data block, not executed, so the CSP doesn't need to allow it. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd() }} />
      </head>
      <body>
        <a href="#main" className="skip-link t-label">
          Skip to content
        </a>
        <SmoothScroll />
        <Hud />
        <FileTabs />
        <main id="main" className="relative">
          {children}
        </main>
        <Overlays />
        {/* Mini-CTF 1/3: a "forgotten" dev note, only visible in the page source. */}
        <div hidden dangerouslySetInnerHTML={{ __html: SOURCE_NOTE }} />
      </body>
    </html>
  );
}
