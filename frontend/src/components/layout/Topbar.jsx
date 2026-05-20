import { useEffect, useRef, useState } from 'react';
import { I } from '@/components/Icons';
import { Avatar, Kbd } from '@/components/ui';
import { useStore } from '@/data/store';
import { empById } from '@/lib/lookups';

function MenuItem({ icon, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-1.5 hover:bg-muted/60 flex items-center gap-2.5 text-[13px] transition-colors"
    >
      <span className="text-muted-fg">{icon}</span>
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function Topbar({ onPalette, onAgent, t, setTweak, onNav, onSignOut }) {
  const { currentUser } = useStore();
  const me = empById(currentUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  return (
    <header className="h-16 flex-none bg-card border-b border-border-soft flex items-center px-5 gap-3 sticky top-0 z-20 shadow-soft-sm">
      <div className="min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-fg">Instance</div>
        <div className="text-[13px] font-semibold leading-tight">People Ops Command Center</div>
      </div>

      <button
        onClick={onPalette}
        className="ml-2 flex-1 max-w-[560px] h-10 rounded-lg bg-card border border-border-soft hover:border-border hover:bg-elevated px-3.5 flex items-center gap-2.5 text-muted-fg focus-ring min-w-0 transition-all shadow-soft-sm"
      >
        <I.Search size={13} className="flex-none" />
        <span className="flex-1 text-left text-[12.5px] truncate">Search, open modules, or ask Agent</span>
        <Kbd className="flex-none">⌘K</Kbd>
      </button>

      <div className="flex-1" />

      <button
        onClick={onAgent}
        className="h-10 px-3.5 rounded-lg text-[13px] font-medium inline-flex items-center gap-1.5 focus-ring transition-all shadow-soft-sm bg-accent text-accent-fg hover:bg-accent/90"
      >
        <span className="relative inline-flex">
          <I.Sparkle size={13} className="text-accent-fg" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent-fg/80 animate-pulse" />
        </span>
        <span>Agent</span>
      </button>

      <button
        onClick={() => setTweak('dark', !t.dark)}
        className="h-10 w-10 rounded-lg bg-card border border-border-soft hover:bg-muted/60 flex items-center justify-center text-muted-fg hover:text-fg focus-ring transition-colors"
        title="Toggle theme"
      >
        {t.dark ? <I.Sun size={14} /> : <I.Moon size={14} />}
      </button>

      <button className="h-10 w-10 rounded-lg bg-card border border-border-soft hover:bg-muted/60 flex items-center justify-center text-muted-fg hover:text-fg relative focus-ring transition-colors">
        <I.Bell size={14} />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-danger ring-2 ring-bg" />
      </button>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 pl-1.5 pr-2.5 h-10 rounded-lg bg-card border border-border-soft hover:bg-muted/60 focus-ring transition-colors"
        >
          <Avatar name={`${me.first} ${me.last}`} hue={me.hue} size={26} />
          <div className="text-left">
            <div className="text-[12px] font-semibold leading-tight">{me.first} {me.last}</div>
            <div className="text-[10px] text-muted-fg leading-tight">HR Admin · Super</div>
          </div>
          <I.ChevronDown size={11} className="text-muted-fg" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] w-[260px] bg-card border border-border rounded-xl shadow-soft-lg z-30 anim-slide-up overflow-hidden">
            <div className="px-3 py-3 border-b border-border-soft flex items-center gap-2.5">
              <Avatar name={`${me.first} ${me.last}`} hue={me.hue} size={32} />
              <div className="min-w-0">
                <div className="text-[13px] font-medium truncate">{me.first} {me.last}</div>
                <div className="text-[11.5px] text-muted-fg truncate">{me.email}</div>
              </div>
            </div>
            <div className="py-1">
              <MenuItem icon={<I.IdCard size={13} />} onClick={() => { onNav('account'); setMenuOpen(false); }}>My account</MenuItem>
              <MenuItem icon={<I.Users size={13} />} onClick={() => { onNav('employees', me.id); setMenuOpen(false); }}>Full employee profile</MenuItem>
              <MenuItem icon={<I.Shield size={13} />} onClick={() => { onNav('account', null, { tab: 'security' }); setMenuOpen(false); }}>Security & MFA</MenuItem>
              <MenuItem icon={<I.Bell size={13} />} onClick={() => { onNav('account', null, { tab: 'notifications' }); setMenuOpen(false); }}>Notifications</MenuItem>
              <MenuItem icon={<I.Key size={13} />} onClick={() => { onNav('account', null, { tab: 'tokens' }); setMenuOpen(false); }}>API tokens</MenuItem>
            </div>
            <div className="border-t border-border-soft py-1">
              <MenuItem icon={<I.Settings size={13} />} onClick={() => { onNav('admin', null, { tab: 'settings' }); setMenuOpen(false); }}>Instance settings</MenuItem>
              <MenuItem icon={<I.Globe size={13} />} onClick={() => { onNav('account', null, { tab: 'language' }); setMenuOpen(false); }}>Language & region</MenuItem>
            </div>
            <div className="border-t border-border-soft py-1">
              <MenuItem
                icon={<I.X size={13} className="text-danger" />}
                onClick={() => { setMenuOpen(false); onSignOut(); }}
              >
                <span className="text-danger">Sign out</span>
              </MenuItem>
            </div>
            <div className="border-t border-border-soft px-3 py-1.5 text-[10.5px] font-mono text-muted-fg flex items-center justify-between bg-bg">
              <span>OpenHRCore v0.1.0</span>
              <span>self-hosted</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
