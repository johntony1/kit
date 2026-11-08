import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./site/theme"; // sets data-theme before the first paint
import App from "./App";
import DotsLab from "./empty/DotsLab";
import Lab from "./Lab";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {location.hash.startsWith("#/lab/") ? <Lab k={location.hash.slice(6)} /> : location.hash.startsWith("#/dots") ? <DotsLab /> : <App />}
  </StrictMode>
);
