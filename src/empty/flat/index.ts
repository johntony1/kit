// Empty states made of real UI (not drawn scenes). An illustration names one with `flat`.
import { AgentDeck } from "./AgentDeck";
import deckSrc from "./AgentDeck.tsx?raw";

export const FLAT = { agentDeck: AgentDeck } as const;
export const FLAT_SRC: Record<string, { file: string; src: string }> = { agentDeck: { file: "AgentDeck.tsx", src: deckSrc } };
