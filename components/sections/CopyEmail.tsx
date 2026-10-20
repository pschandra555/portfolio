"use client";

import { useRef, useState } from "react";
import { Stamp } from "@/components/dossier/Stamp";

/** Click-to-copy address. Success slams a stamp onto the page. */
export function CopyEmail({ email }: { email: string }) {
  const [stamp, setStamp] = useState(0);
  const [msg, setMsg] = useState("");
  const timer = useRef(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setStamp((n) => n + 1);
      setMsg("Email address copied to clipboard.");
    } catch {
      setMsg(`Couldn't copy. The address is ${email}.`);
    }
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStamp(0), 2200);
  };

  return (
    <div className="relative inline-flex flex-wrap items-center gap-4">
      <a href={`mailto:${email}`} className="text-2xl underline decoration-rule underline-offset-[0.25em] hover:decoration-current md:text-4xl">
        {email}
      </a>
      <button type="button" onClick={copy} className="t-label min-h-6 border border-rule px-3 py-2 hover:border-accent-text hover:text-accent-text">
        Copy address
      </button>
      {stamp > 0 && (
        <span key={stamp} aria-hidden="true" className="stamp-slam pointer-events-none absolute -top-10 right-0 md:-right-24">
          <Stamp tone="accent" size="md" rotate={-9}>
            Copied · encrypted in transit
          </Stamp>
        </span>
      )}
      <span role="status" className="sr-only">
        {msg}
      </span>
    </div>
  );
}
