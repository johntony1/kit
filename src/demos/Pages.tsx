// A small website to transition between: Kit with Home, Library and About.
// Click a nav link and the transition plays to that page from where you clicked,
// the way it would on your own site.

export const PAGE_COUNT = 3;
const NAMES = ["Home", "Library", "About"];

function Nav({ i }: { i: number }) {
  return (
    <nav className="wsNav">
      <span className="wsLogo">Kit</span>
      <span className="wsLinks">
        {NAMES.map((n, k) => <span key={n} data-go={k} className={`wsLink ${k === i ? "on" : ""}`}>{n}</span>)}
      </span>
      <span className="wsCta" data-go={1}>Browse</span>
    </nav>
  );
}

const CARDS = [
  { name: "Ripple", art: "a0" }, { name: "Confetti pop", art: "a1" }, { name: "Burn", art: "a3" },
  { name: "Ring cut", art: "a2" }, { name: "Glass lens", art: "a4" }, { name: "Paper flip", art: "a5" },
];

export function DemoPage({ n, compact = false }: { n: number; compact?: boolean }) {
  const i = ((n % PAGE_COUNT) + PAGE_COUNT) % PAGE_COUNT;
  if (i === 0) return (
    <div className={`ws wsPaper ${compact ? "compact" : ""}`}>
      <Nav i={0} />
      <div className="wsHero">
        <h3 className="wsH">Motion for the moments that matter.</h3>
        <p className="wsP">Ripples, confetti, type that bends and pages that turn. Copy the code or the prompt, and make it yours.</p>
        <div className="wsBtns"><span className="wsBtn green" data-go={1}>See the library</span><span className="wsBtn" data-go={2}>About</span></div>
      </div>
      <div className="wsRow">{CARDS.slice(0, 3).map((c) => <span key={c.name} className="wsCard" data-go={1}><i className={`wsArt ${c.art}`} /><b>{c.name}</b></span>)}</div>
    </div>
  );
  if (i === 1) return (
    <div className={`ws wsInk ${compact ? "compact" : ""}`}>
      <Nav i={1} />
      <div className="wsHead"><h3 className="wsH small">Library</h3><span className="wsCount">18 effects</span></div>
      <div className="wsGrid">{CARDS.map((c) => <span key={c.name} className="wsCard dark" data-go={0}><i className={`wsArt ${c.art}`} /><b>{c.name}</b></span>)}</div>
    </div>
  );
  return (
    <div className={`ws wsSage ${compact ? "compact" : ""}`}>
      <Nav i={2} />
      <div className="wsHero">
        <p className="wsKick">About</p>
        <h3 className="wsH">A kit I made for my own work, free for yours.</h3>
        <div className="wsFacts"><span>Free</span><b>Personal and commercial</b><span>Files</span><b>One each, no dependencies</b><span>Prompts</span><b>For any coding agent</b></div>
      </div>
    </div>
  );
}
