export const THEME_KEY = "sc-theme";
export const HANDSHAKE_KEY = "sc-handshake";
/** How long the handshake overlay covers the page (ms). Keep in sync with globals.css. */
export const HANDSHAKE_MS = 1300;

/**
 * Runs inline before first paint (its hash is allowed in the CSP):
 *  - applies a saved theme so it never flashes
 *  - arms the handshake preloader on the first home-page visit of the session
 */
export const themeBootScript = `try{var d=document.documentElement,t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")d.dataset.theme=t;if(location.pathname==="/"&&!sessionStorage.getItem("${HANDSHAKE_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.handshake="1";sessionStorage.setItem("${HANDSHAKE_KEY}","1")}}catch(e){}`;

/** Extra delay for entrance animations hidden under the handshake overlay. */
export const handshakeDelay = () =>
  typeof document !== "undefined" && document.documentElement.dataset.handshake ? HANDSHAKE_MS : 0;
