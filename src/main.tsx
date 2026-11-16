import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./site/theme"; // sets data-theme before the first paint
import App from "./App";
import { upgradeHash } from "./site/route";
// dev only pages, kept out of the site's own code
const DotsLab = lazy(() => import("./empty/DotsLab"));
const Lab = lazy(() => import("./Lab"));
const OgCard = lazy(() => import("./site/OgCard"));

upgradeHash(); // old #/ links move to their real path before anything reads the address

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>{location.hash.startsWith("#/og/") ? <OgCard path={location.hash.slice(5)} /> : location.hash.startsWith("#/lab/") ? <Lab k={location.hash.slice(6)} /> : location.hash.startsWith("#/dots") ? <DotsLab /> : <App />}</Suspense>
  </StrictMode>
);
