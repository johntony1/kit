// The link card of one item (1200 × 630), shown at #/og/<path> for scripts/og.mjs to photograph.
// Left: Kit, the kind, the name and one line about it. Right: the item itself, playing.
import { Suspense } from "react";
import { pages } from "./pages";
import { CardPreview, type BentoLib } from "./Bento";
import { KitMark } from "./KitMark";

const CSS = `
html, body { margin: 0; background: #0e0f0e; }
html::before, html::after, body::before, body::after { display: none !important; }
.og { position: relative; z-index: 1; width: 1200px; height: 630px; overflow: hidden; display: flex; gap: 56px; padding: 56px; box-sizing: border-box;
  background: radial-gradient(90% 120% at 100% 50%, #171917 0%, #0e0f0e 60%); color: #e3e8e3; font-family: Inter, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
.og * { box-sizing: border-box; }
.ogText { flex: 1; min-width: 0; display: flex; flex-direction: column; padding: 8px 0 6px; }
.ogBrand { display: flex; align-items: center; gap: 12px; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; }
.ogKind { margin-top: auto; font-size: 22px; font-weight: 500; color: #3fc06c; letter-spacing: -0.01em; }
.ogName { margin: 14px 0 0; font-size: 64px; line-height: 1.04; font-weight: 650; letter-spacing: -0.035em; text-wrap: balance; }
.ogDesc { margin: 22px 0 0; font-size: 25px; line-height: 1.4; color: #8b968f; letter-spacing: -0.01em; text-wrap: pretty;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.ogFoot { margin-top: 34px; display: flex; align-items: center; gap: 14px; font-size: 20px; color: #c2cbc4; }
.ogFree { height: 34px; padding: 0 14px; border-radius: 17px; display: inline-flex; align-items: center; background: rgba(63,192,108,.12); color: #6fdc97; font-weight: 500; font-size: 18px; }
.ogStage { position: relative; width: 518px; flex: none; border-radius: 32px; overflow: hidden; background: linear-gradient(180deg, rgba(255,255,255,.025), rgba(255,255,255,0) 40%), #191a19;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(255,255,255,.06), 0 30px 60px -20px rgba(0,0,0,.6); }
.ogStage .bnPreview { position: absolute; inset: 0; }
`;

const STAGE = 518;
const ZOOM: Record<string, number> = { Component: 1.55, Library: 1.5 };

export default function OgCard({ path }: { path: string }) {
  const p = pages().find((x) => x.path === path);
  if (!p) return <div>Unknown page {path}</div>;
  const z = ZOOM[p.kind] ?? 1;
  return (
    <>
      <style>{CSS}</style>
      <div className="og" data-theme="dark">
        <div className="ogText">
          <div className="ogBrand"><KitMark size={34} flat style={{ width: 34, height: 34, display: "block" }} />Kit</div>
          <div className="ogKind">{p.kind}</div>
          <h1 className="ogName">{p.name}</h1>
          <p className="ogDesc">{p.desc.replace(/ Free to copy.*$| Copy the code.*$/, "")}</p>
          <div className="ogFoot"><span className="ogFree">Free to copy</span>kit.orevbajohn.me</div>
        </div>
        <div className="ogStage">
          {/* small pieces are drawn in a smaller box and scaled up, so they fill the stage and stay sharp */}
          <div className="bnPreview" style={{ inset: "auto", left: 0, top: 0, width: STAGE / z, height: STAGE / z, transform: `scale(${z})`, transformOrigin: "0 0" }}>
            <Suspense fallback={null}><CardPreview k={p.k as BentoLib} /></Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
