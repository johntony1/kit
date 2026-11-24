// Anonymous usage counts for Kit's own dashboard (kit-stats Worker). No cookies, no IP addresses,
// no names: a random id kept in this browser, a random id for this visit, and what was used.
// Off on localhost and for anyone who has Do Not Track or Global Privacy Control on.

import { here as path } from "./route";

const ENDPOINT = "https://kit.orevbajohn.me/_k/e";

type Event = "view" | "open" | "kind" | "copy" | "download" | "search" | "github" | "theme" | "share";

const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
function keep(store: () => Storage, key: string) {
  try {
    const s = store();
    let v = s.getItem(key);
    if (!v) { v = rid(); s.setItem(key, v); }
    return v;
  } catch {
    return rid();
  }
}

const off = (() => {
  if (typeof window === "undefined") return true;
  if (!/(^|\.)orevbajohn\.me$/.test(location.hostname)) return true;
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  // the owner's own browser: opening the dashboard marks it, so its visits don't count
  let me = false;
  try { me = localStorage.getItem("kit-me") === "1"; } catch { /* storage blocked */ }
  return me || n.doNotTrack === "1" || n.globalPrivacyControl === true;
})();

let vid = "", sid = "", firstView = true;

/** what is open right now, from the address: an item key, or "home" */
export function here() {
  return path() || "home";
}

// the same moments as named events in Clearlook (its script is only on the built site).
// Page views it records by itself, so only the things people do are sent.
const NAMES: Partial<Record<Event, string>> = {
  copy: "Copied code", download: "Downloaded file", share: "Shared link",
  search: "Searched", theme: "Changed theme", github: "Opened GitHub",
};
const quiet = (() => {
  if (typeof navigator === "undefined") return true;
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  return n.doNotTrack === "1" || n.globalPrivacyControl === true;
})();
function capture(event: Event, k?: string, what?: string, n?: number) {
  const name = NAMES[event];
  if (!name || quiet) return;
  const props: Record<string, string | number> = { item: (k ?? here()).slice(0, 60) };
  if (what) props[event === "download" ? "format" : event === "search" ? "picked" : event === "share" ? "via" : event === "github" ? "from" : "what"] = what.slice(0, 60);
  if (event === "search") { props.query = props.item; props.item = here(); if (n !== undefined) props.results = n; }
  if (event === "theme" || event === "github") delete props.item;
  if (event === "theme") props.theme = (k ?? "").slice(0, 20);
  if (event === "github") props.from = (k ?? "").slice(0, 20);
  try {
    const w = window as unknown as { platformq?: { push: (...a: unknown[]) => unknown } | unknown[] };
    // the queue works whether or not the script has loaded yet
    (w.platformq ??= []).push(["capture", name, props]);
  } catch { /* analytics never breaks the page */ }
}

export function track(event: Event, k?: string, what?: string, n?: number) {
  capture(event, k, what, n);
  if (off) return;
  vid ||= keep(() => localStorage, "kit-vid");
  sid ||= keep(() => sessionStorage, "kit-sid");
  const body: Record<string, unknown> = {
    event, vid, sid,
    k: (k ?? here()).slice(0, 60),
    what: what?.slice(0, 60),
    n,
    device: innerWidth < 641 ? "phone" : innerWidth < 1025 ? "tablet" : "desktop",
    theme: document.documentElement.dataset.theme === "light" ? "light" : "dark",
  };
  // where the visit came from: the referring site's name only, once per visit
  if (event === "view" && firstView) {
    firstView = false;
    try {
      const r = document.referrer ? new URL(document.referrer).hostname : "";
      if (r && r !== location.hostname) body.ref = r.replace(/^www\./, "");
    } catch { /* no referrer */ }
    const q = new URLSearchParams(location.search);
    const src = q.get("ref") ?? q.get("utm_source");
    if (src) body.ref = src.slice(0, 40);
  }
  const data = JSON.stringify(body);
  // a beacon survives the page closing; text/plain needs no preflight
  if (!navigator.sendBeacon?.(ENDPOINT, data)) fetch(ENDPOINT, { method: "POST", body: data, keepalive: true }).catch(() => {});
}
