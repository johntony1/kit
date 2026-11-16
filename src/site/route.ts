// The site's addresses: every item has a real path (/component/printer, /empty/notfound,
// /type/bubble, /transition/paper, /ripple, /confetti, /studio/lens), so search engines and link
// cards see each one as its own page. Old #/ links still work: they are moved to their path.

/** the paths the app itself draws (anything else, like /license.txt, is a plain file) */
const APP = /^\/(?:$|component\/|empty\/|type\/|transition\/|studio(?:\/|$)|ripple$|confetti$)/;
export const isAppPath = (p: string) => APP.test(p);

/** the current address as "component/printer", "ripple" or "" for home */
export function here(): string {
  return location.pathname.replace(/^\/+|\/+$/g, "");
}

/** move a legacy #/component/printer address to /component/printer, once, before the app reads it */
export function upgradeHash() {
  const h = location.hash;
  if (!h.startsWith("#/") || h.startsWith("#/lab/") || h.startsWith("#/dots") || h.startsWith("#/og/")) return;
  const [p, q] = h.slice(1).split("?");
  const search = new URLSearchParams(location.search);
  new URLSearchParams(q ?? "").forEach((v, k) => search.set(k, v));
  const s = search.toString();
  history.replaceState(history.state, "", `${p === "/" ? "/" : p}${s ? `?${s}` : ""}`);
}

const EVT = "kit:route";
/** go to a path inside the app without a reload */
export function navigate(path: string, replace = false) {
  if (path === location.pathname + location.search) return;
  if (replace) history.replaceState(null, "", path);
  else history.pushState(null, "", path);
  dispatchEvent(new Event(EVT));
}
export function onRoute(f: () => void) {
  addEventListener("popstate", f);
  addEventListener(EVT, f);
  // plain links to app paths move inside the app instead of reloading the page
  const click = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !isAppPath(url.pathname)) return;
    e.preventDefault();
    navigate(url.pathname + url.search);
  };
  document.addEventListener("click", click);
  return () => { removeEventListener("popstate", f); removeEventListener(EVT, f); document.removeEventListener("click", click); };
}
