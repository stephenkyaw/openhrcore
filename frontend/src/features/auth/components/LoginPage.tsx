import { useState } from "react";
import { AuthShell } from "./AuthShell";
import { EmailLinkPanel } from "./EmailLinkPanel";
import { PasswordSignIn } from "./PasswordSignIn";

type AuthMode = "password" | "magic" | "forgot";

type LoginPageProps = {
  onSignIn: (email?: string) => void;
};

export function LoginPage({ onSignIn }: LoginPageProps) {
  const [email, setEmail] = useState("anya@mercury.co");
  const [password, setPassword] = useState("•••••••••••");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<AuthMode>("password");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openMode(nextMode: AuthMode) {
    setMode(nextMode);
    setSent(false);
    setError(null);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    window.setTimeout(() => {
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
        return;
      }

      setSent(true);
      setBusy(false);
    }, 700);
  }

  return (
    <AuthShell>
      {mode === "password" ? (
        <PasswordSignIn
          busy={busy}
          email={email}
          error={error}
          password={password}
          onEmailChange={setEmail}
          onForgotPassword={() => openMode("forgot")}
          onMagicLink={() => openMode("magic")}
          onPasswordChange={setPassword}
          onProviderSignIn={() => onSignIn(email)}
          onSubmit={submit}
        />
      ) : (
        <EmailLinkPanel
          busy={busy}
          email={email}
          mode={mode}
          sent={sent}
          onBack={() => openMode("password")}
          onEmailChange={setEmail}
          onPretendOpenLink={() => onSignIn(email)}
          onSubmit={submit}
        />
      )}
    </AuthShell>
  );
}
