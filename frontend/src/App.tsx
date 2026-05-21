import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import {
  ACCENTS,
  ACCENTS_BY_HEX,
  HEX_BY_ACCENT,
  TWEAK_DEFAULTS,
} from "@/config/theme";
import { Toaster } from "@/components/ui";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import {
  TweakColor,
  TweakRadio,
  TweakSection,
  TweakToggle,
  TweaksPanel,
  useTweaks,
} from "@/components/TweaksPanel";
import { CommandPalette } from "@/features/agent/CommandPalette";
import { Login } from "@/features/auth/Login";
import { Router } from "@/Router";

type RouteState = {
  view: string;
  params: Record<string, unknown> | null;
};

export function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState<RouteState>({ view: "agent", params: null });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authed, setAuthed] = useState(true);

  const onNav = useCallback((view: string, id?: string | null, params?: Record<string, unknown> | null) => {
    setRoute({ view, params: id ? { id, ...(params || {}) } : params || null });
  }, []);

  const onAskAgent = useCallback((q?: string) => {
    setRoute({ view: "agent", params: q ? { seed: q } : null });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (t.dark) root.classList.add("dark");
    else root.classList.remove("dark");
    const pal = ACCENTS[t.accent] || ACCENTS.emerald;
    const arr = t.dark ? pal.dark : pal.light;
    root.style.setProperty("--accent", arr[0]);
    root.style.setProperty("--accent-fg", arr[1]);
    root.style.setProperty("--accent-soft", arr[2]);
    root.style.setProperty("--ring", arr[3]);
    root.style.setProperty("--ok", arr[0]);
  }, [t.dark, t.accent]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const densityClass =
    t.density === "compact"
      ? "density-compact"
      : t.density === "comfy"
        ? "density-comfy"
        : "";

  if (!authed) {
    return (
      <Login
        onSignIn={() => {
          setAuthed(true);
          setRoute({ view: "agent", params: null });
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "h-screen w-screen flex bg-bg text-fg overflow-hidden",
        densityClass,
      )}
    >
      <Sidebar
        route={route}
        onNav={onNav}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-bg">
        <Topbar
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen((v) => !v)}
          onPalette={() => setPaletteOpen(true)}
          onAgent={() => onNav("agent")}
          t={t}
          setTweak={setTweak}
          onNav={onNav}
          onSignOut={() => setAuthed(false)}
        />
        <main className="flex-1 overflow-hidden bg-bg">
          <Router route={route} onNav={onNav} onAskAgent={onAskAgent} />
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNav={onNav}
        onAskAgent={onAskAgent}
      />

      <Toaster />

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakToggle
          label="Dark mode"
          value={t.dark}
          onChange={(v) => setTweak("dark", v)}
        />
        <TweakColor
          label="Accent"
          value={HEX_BY_ACCENT[t.accent] || "#2563eb"}
          options={["#2563eb", "#0fae7e", "#6f6df0", "#d99238", "#e25577"]}
          onChange={(v) => setTweak("accent", ACCENTS_BY_HEX[v] || "blue")}
        />
        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)}
        />
        <TweakRadio
          label="Agent"
          value={t.agentPlacement}
          options={["panel", "bar"]}
          onChange={(v) => setTweak("agentPlacement", v)}
        />
      </TweaksPanel>
    </div>
  );
}
