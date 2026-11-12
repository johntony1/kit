import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./site/theme"; // sets data-theme before the first paint
import App from "./App";
// dev only pages, kept out of the site's own code
const DotsLab = lazy(() => import("./empty/DotsLab"));
const Lab = lazy(() => import("./Lab"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>{location.hash.startsWith("#/lab/") ? <Lab k={location.hash.slice(6)} /> : location.hash.startsWith("#/dots") ? <DotsLab /> : <App />}</Suspense>
  </StrictMode>
);
