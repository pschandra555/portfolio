"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A CRT-framed monitor on each case file. With a demo clip on file it plays
 * muted while the card is hovered; without one, it shows an honest
 * "no footage" feed rather than a fake screenshot.
 */
export function CrtFeed({ src, label }: { src: string | null; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const card = box.current?.closest("article");
    if (!card) return;
    const on = () => {
      setLive(true);
      video.current?.play().catch(() => {});
    };
    const off = () => {
      setLive(false);
      video.current?.pause();
    };
    card.addEventListener("pointerenter", on);
    card.addEventListener("pointerleave", off);
    card.addEventListener("focusin", on);
    card.addEventListener("focusout", off);
    return () => {
      card.removeEventListener("pointerenter", on);
      card.removeEventListener("pointerleave", off);
      card.removeEventListener("focusin", on);
      card.removeEventListener("focusout", off);
    };
  }, []);

  return (
    <div ref={box} data-cursor="View" className="crt-frame" aria-hidden={src ? undefined : true}>
      <div className="crt relative aspect-video overflow-hidden rounded-[10px] bg-[#070807]">
        {src ? (
          <video
            ref={video}
            src={src}
            muted
            loop
            playsInline
            preload="none"
            aria-label={`Demo footage: ${label}`}
            className="size-full object-cover"
          />
        ) : (
          <div className={`crt-noise flex size-full flex-col items-center justify-center gap-2 ${live ? "is-live" : ""}`}>
            <span className="t-label text-[#8e8c86]">NO FOOTAGE ON FILE</span>
            <span className="t-label text-[#5c5a54]">{label}</span>
          </div>
        )}
        <span className="t-label absolute left-3 top-2 flex items-center gap-1.5 text-[#e8e6e1]">
          <span className={`inline-block size-1.5 rounded-full ${live ? "animate-pulse bg-[#ff4b33]" : "bg-[#5c5a54]"}`} />
          {live ? "REC" : "STBY"}
        </span>
      </div>
    </div>
  );
}
