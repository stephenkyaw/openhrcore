import { useState } from 'react';
import { I } from '@/components/Icons';
import { Avatar, Badge, Button, Input } from '@/components/ui';
import { FormField } from '@/components/forms';
import { EMPLOYEES } from '@/data/seed';

function Pillar({ k, sub }) {
  return (
    <div className="border border-border rounded-md bg-card/60 px-2.5 py-2">
      <div className="text-[12px] font-medium text-fg">{k}</div>
      <div className="text-[10.5px] text-muted-fg leading-tight">{sub}</div>
    </div>
  );
}

function SsoMark({ provider }) {
  if (provider === 'google') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    );
  }
  if (provider === 'microsoft') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24">
        <rect x="2" y="2" width="9" height="9" fill="#F25022"/>
        <rect x="13" y="2" width="9" height="9" fill="#7FBA00"/>
        <rect x="2" y="13" width="9" height="9" fill="#00A4EF"/>
        <rect x="13" y="13" width="9" height="9" fill="#FFB900"/>
      </svg>
    );
  }
  return null;
}

export function Login({ onSignIn }) {
  const [email, setEmail] = useState('anya@mercury.co');
  const [password, setPassword] = useState('•••••••••••');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('password');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setTimeout(() => {
      if (!email.includes('@')) { setError('Enter a valid email'); setBusy(false); return; }
      if (mode === 'password') {
        if (password.length < 6) { setError('Wrong password'); setBusy(false); return; }
        onSignIn(email);
      } else if (mode === 'magic' || mode === 'forgot') {
        setSent(true);
        setBusy(false);
      }
    }, 700);
  }

  return (
    <div className="min-h-screen w-screen flex bg-bg text-fg overflow-hidden">
      <div className="flex-1 flex flex-col px-10 py-8 overflow-y-auto scroll-thin">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent text-accent-fg flex items-center justify-center shadow-soft-sm">
            <I.Logo size={15} />
          </div>
          <div>
            <div className="text-[14px] font-semibold leading-tight">OpenHRCore</div>
            <div className="text-[10.5px] font-mono text-muted-fg leading-tight">OSS HRMS · v0.1</div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-[380px] max-w-full">
            {mode === 'password' && (
              <>
                <h1 className="text-[26px] font-semibold mb-1.5">Sign in to OpenHRCore</h1>
                <div className="text-[13px] text-muted-fg mb-6">Welcome back. Enter your details to continue.</div>
                <form onSubmit={submit} className="space-y-3.5">
                  <FormField label="Work email" required>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoFocus className="h-10" />
                  </FormField>
                  <FormField
                    label="Password"
                    required
                    hint={
                      <button type="button" onClick={() => { setMode('forgot'); setSent(false); }} className="text-accent hover:underline">
                        Forgot?
                      </button>
                    }
                  >
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10" />
                  </FormField>
                  {error && (
                    <div className="text-[12.5px] text-danger flex items-center gap-1.5">
                      <I.AlertTriangle size={12} />{error}
                    </div>
                  )}
                  <Button size="lg" className="w-full mt-1" type="submit" disabled={busy}>
                    {busy ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border-2 border-current border-r-transparent animate-spin" />
                        Signing in…
                      </span>
                    ) : (
                      <><I.ArrowRight size={14} />Continue</>
                    )}
                  </Button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] uppercase tracking-wider text-muted-fg">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-2">
                  <Button variant="outline" size="lg" className="w-full" onClick={() => onSignIn(email)}>
                    <SsoMark provider="google" />Continue with Google
                  </Button>
                  <Button variant="outline" size="lg" className="w-full" onClick={() => onSignIn(email)}>
                    <SsoMark provider="microsoft" />Continue with Microsoft
                  </Button>
                  <Button variant="outline" size="lg" className="w-full" onClick={() => { setMode('magic'); setSent(false); }}>
                    <I.Mail size={14} />Email me a magic link
                  </Button>
                </div>

                <div className="text-[12px] text-muted-fg mt-6 text-center">
                  New here? <a href="#" className="text-accent hover:underline">Request a workspace</a>
                </div>
              </>
            )}

            {mode === 'magic' && (
              <>
                <button
                  onClick={() => setMode('password')}
                  className="text-[12px] text-muted-fg hover:text-fg mb-3 inline-flex items-center gap-1"
                >
                  <I.ChevronRight size={11} className="rotate-180" />Back to password
                </button>
                <h1 className="text-[26px] font-semibold mb-1.5">Magic link sign-in</h1>
                <div className="text-[13px] text-muted-fg mb-6">
                  We&apos;ll email you a one-time link that signs you in. Link expires in 15 minutes.
                </div>
                {!sent ? (
                  <form onSubmit={submit} className="space-y-3.5">
                    <FormField label="Work email" required>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
                    </FormField>
                    <Button size="lg" className="w-full" type="submit" disabled={busy}>
                      {busy ? 'Sending…' : <><I.Send size={14} />Send magic link</>}
                    </Button>
                  </form>
                ) : (
                  <div className="border border-accent/30 bg-accent-soft rounded-md p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-fg flex items-center justify-center flex-none">
                      <I.Check size={14} />
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold">Check your inbox</div>
                      <div className="text-[12.5px] text-muted-fg mt-1">
                        We sent a sign-in link to <span className="font-mono text-fg">{email}</span>. Open it on this device.
                      </div>
                      <Button size="sm" variant="ghost" className="mt-2 -ml-2" onClick={() => onSignIn(email)}>
                        Pretend I clicked the link →
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {mode === 'forgot' && (
              <>
                <button
                  onClick={() => setMode('password')}
                  className="text-[12px] text-muted-fg hover:text-fg mb-3 inline-flex items-center gap-1"
                >
                  <I.ChevronRight size={11} className="rotate-180" />Back to sign in
                </button>
                <h1 className="text-[26px] font-semibold mb-1.5">Reset your password</h1>
                <div className="text-[13px] text-muted-fg mb-6">
                  Enter your email and we&apos;ll send a tokenized reset link, expiring in 1 hour.
                </div>
                {!sent ? (
                  <form onSubmit={submit} className="space-y-3.5">
                    <FormField label="Work email" required>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
                    </FormField>
                    <Button size="lg" className="w-full" type="submit" disabled={busy}>
                      {busy ? 'Sending…' : <><I.Send size={14} />Send reset link</>}
                    </Button>
                  </form>
                ) : (
                  <div className="border border-accent/30 bg-accent-soft rounded-md p-4">
                    <div className="text-[13.5px] font-semibold flex items-center gap-2">
                      <I.Check size={14} className="text-accent" />Reset link sent
                    </div>
                    <div className="text-[12.5px] text-muted-fg mt-1">
                      Sent to <span className="font-mono text-fg">{email}</span>. Check spam if you don&apos;t see it in 2 minutes.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="text-[11px] text-muted-fg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-fg">Privacy</a>
            <a href="#" className="hover:text-fg">Terms</a>
            <a href="#" className="hover:text-fg">Status</a>
          </div>
          <div className="font-mono">v0.1.0 · open-source · self-hostable</div>
        </div>
      </div>

      <div className="hidden lg:flex w-[44%] flex-none bg-card border-l border-border-soft relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <div className="space-y-3 mt-12">
            <Badge tone="accent" className="font-mono">v0.1 · open-source</Badge>
            <div className="text-[34px] font-semibold leading-[1.1]">
              An HRMS where conversation<br />is the primary interface.
            </div>
            <div className="text-[14.5px] text-muted-fg max-w-md leading-relaxed">
              Built feature-first. Every action the UI can take, the agent can take — through the same service methods, with the same permissions, written to the same audit log.
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-soft p-4 max-w-[420px] space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-accent/15 text-accent flex items-center justify-center">
                <I.Sparkle size={11} />
              </div>
              <div className="text-[12px] font-semibold">Ask Agent</div>
              <Badge tone="outline" size="sm" className="ml-auto">HR Admin</Badge>
            </div>
            <div className="text-[12.5px] text-fg/90 italic px-2">
              "show me everyone whose probation ends this month"
            </div>
            <div className="font-mono text-[11px] text-muted-fg bg-card rounded px-2 py-1.5 border-l-2 border-accent/40">
              → employee.list(filters: probation_end:2026-05) · 4 rows · 38ms
            </div>
            <div className="flex items-center gap-2 px-1">
              {EMPLOYEES
                .filter((e) => e.probation_end && new Date(e.probation_end).getMonth() === 4 && new Date(e.probation_end).getFullYear() === 2026)
                .slice(0, 4)
                .map((e) => (
                  <Avatar key={e.id} name={`${e.first} ${e.last}`} hue={e.hue} size={24} />
                ))}
              <span className="text-[11.5px] text-muted-fg ml-1">4 employees</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-fg">
            <Pillar k="Admin" sub="Identity, audit, access" />
            <Pillar k="Employee" sub="Lifecycle + records" />
            <Pillar k="Recruitment" sub="Pipeline + offers" />
            <Pillar k="Leave" sub="Configurable policies" />
            <Pillar k="Attendance" sub="Time + corrections" />
            <Pillar k="Payroll" sub="Statutory packs" />
          </div>
        </div>
      </div>
    </div>
  );
}
