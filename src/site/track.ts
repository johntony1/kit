// Anonymous usage counts for Kit's own dashboard (kit-stats Worker). No cookies, no IP addresses,
// no names: a random id kept in this browser, a random id for this visit, and what was used.
// Off on localhost and for anyone who has Do Not Track or Global Privacy Control on.

const ENDPOINT = "https://kit.orevbajohn.me/_k/e";

type Event = "view" | "open" | "kind" | "copy" | "download" | "search" | "github" | "theme";

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
  const h = location.hash.replace(/^#\/?/, "").split("?")[0];
  return h || "home";
}

export function track(event: Event, k?: string, what?: string, n?: number) {
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
