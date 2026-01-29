"use client";

import { ReactNode } from "react";

// Simplified PageWrapper - layout.tsx already handles header and footer
export default function PageWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
