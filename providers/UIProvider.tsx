// src/providers/UIProvider.tsx
import { ReactNode } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function UIProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
        <LoadingOverlay />
    </>
  );
}
