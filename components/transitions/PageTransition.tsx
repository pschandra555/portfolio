import { ViewTransition, type ReactNode } from "react";

/**
 * Wraps a page so navigations tagged `redact` (transitionTypes={["redact"]})
 * swap it under the sweeping redaction bar. Untagged navigations (browser
 * back/forward, the folder→case morph) leave it alone.
 * Must live in each page: layouts persist, so enter/exit never fire there.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ redact: "redact-in", default: "none" }}
      exit={{ redact: "redact-out", default: "none" }}
      default="none"
    >
      <div>{children}</div>
    </ViewTransition>
  );
}
