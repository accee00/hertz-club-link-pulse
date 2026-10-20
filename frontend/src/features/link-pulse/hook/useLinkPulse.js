import { useContext } from "react";
import { LinkPulseContext } from "../state/LinkPulseContext.jsx";

function useLinkPulse() {
  const context = useContext(LinkPulseContext);
  if (!context) {
    throw new Error("useLinkPulse must be used inside LinkPulseProvider");
  }
  return context;
}

export { useLinkPulse };
