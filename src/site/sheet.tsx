// The detail sheet mounts its page straight away (title, buttons, the hero preview) so it grows
// in as itself. The heavier panels below wait until the card has finished growing.
import { createContext, useContext, type ReactNode } from "react";

export const SheetReady = createContext(true);

/** renders its children once the sheet has finished opening (always, outside a sheet) */
export function Later({ children }: { children: ReactNode }) {
  return useContext(SheetReady) ? <>{children}</> : null;
}
