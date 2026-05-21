import type { ReactNode } from "react";
import { I } from "@/components/Icons";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-bg text-fg px-5">
      <div className="w-[420px] max-w-full">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-lg bg-fg text-bg flex items-center justify-center">
            <I.Logo size={19} />
          </div>
          <div className="mt-3 text-[18px] font-semibold leading-tight">
            OpenHRCore
          </div>
        </div>
        <div className="bg-card border border-border-soft rounded-lg px-6 py-6 shadow-soft-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
