"use client";

import { useEffect, useState } from "react";
import { profile } from "@/content/site";

const formats = {
  seconds: new Intl.DateTimeFormat("en-GB", { timeZone: profile.timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
  minutes: new Intl.DateTimeFormat("en-GB", { timeZone: profile.timezone, hour: "2-digit", minute: "2-digit", hour12: false }),
};

/** The subject's local time (IST). Renders a placeholder on the server to avoid hydration mismatch. */
export function useLocalTime(precision: keyof typeof formats = "seconds") {
  const [time, setTime] = useState(precision === "seconds" ? "--:--:--" : "--:--");
  useEffect(() => {
    const update = () => setTime(formats[precision].format(new Date()));
    const first = window.setTimeout(update, 0);
    const id = window.setInterval(update, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [precision]);
  return time;
}
