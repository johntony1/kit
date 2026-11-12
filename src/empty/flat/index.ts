// Empty states made of real UI (not drawn scenes). An illustration names one with `flat`.
// Loaded only when a piece that uses one is shown.
import { lazy } from "react";

export const FLAT = { agentDeck: lazy(() => import("./AgentDeck").then((m) => ({ default: m.AgentDeck }))) } as const;
