// After `vite build`: one HTML file per item (dist/component/printer.html and so on), each the
// site's own index.html with that item's title, description, address and link card, plus the
// words of the page for search engines. The app reads the address and opens the item, so a
// visitor sees the same site with that item's sheet open. Also writes sitemap.xml and robots.txt.

import fs from "node:fs";
import path from "node:path";
import { loadPages } from "./site-pages.mjs";

const DIST = path.resolve("dist");
const { pages, SITE, ogPath } = await loadPages();
const base = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const day = new Date().toISOString().slice(0, 10);

/** set a <meta> or <title> in the head; the tag must already be in index.html */
function put(html, re, value) {
  if (!re.test(html)) throw new Error(`index.html is missing ${re}`);
  return html.replace(re, value);
}

let cards = 0;
for (const p of pages) {
  const url = `${SITE}/${p.path}`;
  const og = ogPath(p);
  const has = fs.existsSync(path.join(DIST, og));
  if (has) cards++;
  const img = has ? `${SITE}${og}` : `${SITE}/og.png?v=2`;
  const alt = `${p.name}, a ${p.kind.toLowerCase()} from Kit`;
  let h = base;
  h = put(h, /<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`);
  h = put(h, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(p.desc)}" />`);
  h = put(h, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  h = put(h, /<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="article" />`);
  h = put(h, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  h = put(h, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(`${p.name} | Kit`)}" />`);
  h = put(h, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(p.desc)}" />`);
  h = put(h, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${img}" />`);
  h = put(h, /<meta property="og:image:alt" content="[^"]*" \/>/, `<meta property="og:image:alt" content="${esc(alt)}" />`);
  h = put(h, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(`${p.name} | Kit`)}" />`);
  h = put(h, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(p.desc)}" />`);
  h = put(h, /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${img}" />`);
  // the page's words, for anything that reads the HTML without running it; the app replaces them
  const words = `<main class="seoText"><h1>${esc(p.name)}</h1><p>${esc(p.kind)} from Kit.</p><p>${esc(p.desc)}</p><p><a href="/">See everything in Kit</a></p></main>`;
  h = put(h, /<div id="root"><\/div>/, `<div id="root">${words}</div>`);
  const file = path.join(DIST, `${p.path}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, h);
}

const urls = [`${SITE}/`, ...pages.map((p) => `${SITE}/${p.path}`)];
fs.writeFileSync(path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${day}</lastmod></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`pages: ${pages.length} written (${cards} with their own card), sitemap with ${urls.length} addresses`);
