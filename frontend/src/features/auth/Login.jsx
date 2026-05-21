import { useState } from "react";
import { I } from "@/components/Icons";
import { Button, Input } from "@/components/ui";
import { FormField } from "@/components/forms";
function SsoMark({ provider }) {
  if (provider === "google") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {" "}
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />{" "}
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />{" "}
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          fill="#FBBC05"
        />{" "}
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />{" "}
      </svg>
    );
  }
  if (provider === "microsoft") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24">
        {" "}
        <rect x="2" y="2" width="9" height="9" fill="#F25022" />{" "}
        <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />{" "}
        <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />{" "}
        <rect x="13" y="13" width="9" height="9" fill="#FFB900" />{" "}
      </svg>
    );
  }
  return null;
}
export function Login({ onSignIn }) {
  const [email, setEmail] = useState("anya@mercury.co");
  const [password, setPassword] = useState("•••••••••••");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("password");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setTimeout(() => {
      if (!email.includes("@")) {
        setError("Enter a valid email");
        setBusy(false);
        return;
      }
      if (mode === "password") {
        if (password.length < 6) {
          setError("Wrong password");
          setBusy(false);
          return;
        }
        onSignIn(email);
      } else if (mode === "magic" || mode === "forgot") {
        setSent(true);
        setBusy(false);
      }
    }, 700);
  }
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-bg text-fg px-5">
      {" "}
      <div className="w-[420px] max-w-full">
        <div className="mb-5 flex flex-col items-center text-center">
          {" "}
          <div className="w-11 h-11 rounded-lg bg-fg text-bg flex items-center justify-center">
            <I.Logo size={19} />
          </div>{" "}
          <div className="mt-3 text-[18px] font-semibold leading-tight">
            OpenHRCore
          </div>{" "}
        </div>{" "}
        <div className="bg-card border border-border-soft rounded-lg px-6 py-6 shadow-soft-sm">
            {" "}
            {mode === "password" && (
              <>
                {" "}
                <h1 className="text-[21px] font-semibold mb-5 text-center">
                  Sign in
                </h1>{" "}
                <form onSubmit={submit} className="space-y-3.5">
                  {" "}
                  <FormField label="Work email" required>
                    {" "}
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      autoFocus
                      className="h-10"
                    />{" "}
                  </FormField>{" "}
                  <FormField
                    label="Password"
                    required
                    hint={
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setSent(false);
                        }}
                        className="text-accent hover:underline"
                      >
                        {" "}
                        Forgot?{" "}
                      </button>
                    }
                  >
                    {" "}
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10"
                    />{" "}
                  </FormField>{" "}
                  {error && (
                    <div className="text-[12.5px] text-danger flex items-center gap-1.5">
                      {" "}
                      <I.AlertTriangle size={12} />
                      {error}{" "}
                    </div>
                  )}{" "}
                  <Button
                    size="lg"
                    className="w-full mt-1"
                    type="submit"
                    disabled={busy}
                  >
                    {" "}
                    {busy ? (
                      <span className="inline-flex items-center gap-2">
                        {" "}
                        <span className="w-3 h-3 rounded-full border-2 border-current border-r-transparent animate-spin" />{" "}
                        Signing in…{" "}
                      </span>
                    ) : (
                      <>
                        <I.ArrowRight size={14} />
                        Continue
                      </>
                    )}{" "}
                  </Button>{" "}
                </form>{" "}
                <div className="flex items-center gap-3 my-5">
                  {" "}
                  <div className="flex-1 h-px bg-border" />{" "}
                  <span className="text-[11px] uppercase tracking-wider text-muted-fg">
                    or
                  </span>{" "}
                  <div className="flex-1 h-px bg-border" />{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => onSignIn(email)}
                  >
                    {" "}
                    <SsoMark provider="google" />
                    Continue with Google{" "}
                  </Button>{" "}
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => onSignIn(email)}
                  >
                    {" "}
                    <SsoMark provider="microsoft" />
                    Continue with Microsoft{" "}
                  </Button>{" "}
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setMode("magic");
                      setSent(false);
                    }}
                  >
                    {" "}
                    <I.Mail size={14} />
                    Email me a magic link{" "}
                  </Button>{" "}
                </div>{" "}
              </>
            )}{" "}
            {mode === "magic" && (
              <>
                {" "}
                <button
                  onClick={() => setMode("password")}
                  className="text-[12px] text-muted-fg hover:text-fg mb-3 inline-flex items-center gap-1"
                >
                  {" "}
                  <I.ChevronRight size={11} className="rotate-180" />
                  Back to password{" "}
                </button>{" "}
                <h1 className="text-[21px] font-semibold mb-1.5">
                  Magic link sign-in
                </h1>{" "}
                <div className="text-[13px] text-muted-fg mb-5">
                  Enter your email to receive a sign-in link.
                </div>{" "}
                {!sent ? (
                  <form onSubmit={submit} className="space-y-3.5">
                    {" "}
                    <FormField label="Work email" required>
                      {" "}
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10"
                      />{" "}
                    </FormField>{" "}
                    <Button
                      size="lg"
                      className="w-full"
                      type="submit"
                      disabled={busy}
                    >
                      {" "}
                      {busy ? (
                        "Sending…"
                      ) : (
                        <>
                          <I.Send size={14} />
                          Send magic link
                        </>
                      )}{" "}
                    </Button>{" "}
                  </form>
                ) : (
                  <div className="border border-accent/30 bg-accent-soft rounded-md p-4 flex items-start gap-3">
                    {" "}
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-fg flex items-center justify-center flex-none">
                      {" "}
                      <I.Check size={14} />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <div className="text-[13.5px] font-semibold">
                        Check your inbox
                      </div>{" "}
                      <div className="text-[12.5px] text-muted-fg mt-1">
                        {" "}
                        We sent a sign-in link to{" "}
                        <span className="font-mono text-fg">{email}</span>. Open
                        it on this device.{" "}
                      </div>{" "}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 -ml-2"
                        onClick={() => onSignIn(email)}
                      >
                        {" "}
                        Pretend I clicked the link →{" "}
                      </Button>{" "}
                    </div>{" "}
                  </div>
                )}{" "}
              </>
            )}{" "}
            {mode === "forgot" && (
              <>
                {" "}
                <button
                  onClick={() => setMode("password")}
                  className="text-[12px] text-muted-fg hover:text-fg mb-3 inline-flex items-center gap-1"
                >
                  {" "}
                  <I.ChevronRight size={11} className="rotate-180" />
                  Back to sign in{" "}
                </button>{" "}
                <h1 className="text-[21px] font-semibold mb-1.5">
                  Reset your password
                </h1>{" "}
                <div className="text-[13px] text-muted-fg mb-5">
                  Enter your email to receive a reset link.
                </div>{" "}
                {!sent ? (
                  <form onSubmit={submit} className="space-y-3.5">
                    {" "}
                    <FormField label="Work email" required>
                      {" "}
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10"
                      />{" "}
                    </FormField>{" "}
                    <Button
                      size="lg"
                      className="w-full"
                      type="submit"
                      disabled={busy}
                    >
                      {" "}
                      {busy ? (
                        "Sending…"
                      ) : (
                        <>
                          <I.Send size={14} />
                          Send reset link
                        </>
                      )}{" "}
                    </Button>{" "}
                  </form>
                ) : (
                  <div className="border border-accent/30 bg-accent-soft rounded-md p-4">
                    {" "}
                    <div className="text-[13.5px] font-semibold flex items-center gap-2">
                      {" "}
                      <I.Check size={14} className="text-accent" />
                      Reset link sent{" "}
                    </div>{" "}
                    <div className="text-[12.5px] text-muted-fg mt-1">
                      {" "}
                      Sent to <span className="font-mono text-fg">{email}</span>
                      . Check spam if you don&apos;t see it in 2 minutes.{" "}
                    </div>{" "}
                  </div>
                )}{" "}
              </>
            )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
