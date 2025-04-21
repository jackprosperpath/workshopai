
import React from "react";

// Draft limit is now completely removed, just pass through children
export function DraftLimitWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
