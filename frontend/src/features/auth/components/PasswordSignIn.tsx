import { I } from "@/components/Icons";
import { Button, Input } from "@/components/ui";
import { FormField } from "@/components/forms";
import { AuthProviderMark } from "./AuthProviderMark";

type PasswordSignInProps = {
  busy: boolean;
  email: string;
  error: string | null;
  password: string;
  onEmailChange: (value: string) => void;
  onForgotPassword: () => void;
  onMagicLink: () => void;
  onPasswordChange: (value: string) => void;
  onProviderSignIn: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function PasswordSignIn({
  busy,
  email,
  error,
  password,
  onEmailChange,
  onForgotPassword,
  onMagicLink,
  onPasswordChange,
  onProviderSignIn,
  onSubmit,
}: PasswordSignInProps) {
  return (
    <>
      <h1 className="text-[21px] font-semibold mb-5 text-center">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-3.5">
        <FormField label="Work email" required>
          <Input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="you@company.com"
            autoFocus
            className="h-10"
          />
        </FormField>
        <FormField
          label="Password"
          required
          hint={
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-accent hover:underline"
            >
              Forgot?
            </button>
          }
        >
          <Input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            className="h-10"
          />
        </FormField>
        {error && (
          <div className="text-[12.5px] text-danger flex items-center gap-1.5">
            <I.AlertTriangle size={12} />
            {error}
          </div>
        )}
        <Button size="lg" className="w-full mt-1" type="submit" disabled={busy}>
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-current border-r-transparent animate-spin" />
              Signing in...
            </span>
          ) : (
            <>
              <I.ArrowRight size={14} />
              Continue
            </>
          )}
        </Button>
      </form>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] uppercase tracking-wider text-muted-fg">
          or
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="space-y-2">
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={onProviderSignIn}
        >
          <AuthProviderMark provider="google" />
          Continue with Google
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={onProviderSignIn}
        >
          <AuthProviderMark provider="microsoft" />
          Continue with Microsoft
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={onMagicLink}
        >
          <I.Mail size={14} />
          Email me a magic link
        </Button>
      </div>
    </>
  );
}
