import { I } from "@/components/Icons";
import { Button, Input } from "@/components/ui";
import { FormField } from "@/components/forms";
import { AuthBackButton } from "./AuthBackButton";

type EmailLinkPanelProps = {
  busy: boolean;
  email: string;
  sent: boolean;
  mode: "magic" | "forgot";
  onBack: () => void;
  onEmailChange: (value: string) => void;
  onPretendOpenLink: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const copy = {
  magic: {
    back: "Back to password",
    title: "Magic link sign-in",
    description: "Enter your email to receive a sign-in link.",
    action: "Send magic link",
    sending: "Sending...",
  },
  forgot: {
    back: "Back to sign in",
    title: "Reset your password",
    description: "Enter your email to receive a reset link.",
    action: "Send reset link",
    sending: "Sending...",
  },
};

export function EmailLinkPanel({
  busy,
  email,
  sent,
  mode,
  onBack,
  onEmailChange,
  onPretendOpenLink,
  onSubmit,
}: EmailLinkPanelProps) {
  const text = copy[mode];
  return (
    <>
      <AuthBackButton onClick={onBack}>{text.back}</AuthBackButton>
      <h1 className="text-[21px] font-semibold mb-1.5">{text.title}</h1>
      <div className="text-[13px] text-muted-fg mb-5">{text.description}</div>
      {!sent ? (
        <form onSubmit={onSubmit} className="space-y-3.5">
          <FormField label="Work email" required>
            <Input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              className="h-10"
            />
          </FormField>
          <Button size="lg" className="w-full" type="submit" disabled={busy}>
            {busy ? (
              text.sending
            ) : (
              <>
                <I.Send size={14} />
                {text.action}
              </>
            )}
          </Button>
        </form>
      ) : mode === "magic" ? (
        <MagicLinkSent email={email} onPretendOpenLink={onPretendOpenLink} />
      ) : (
        <ResetLinkSent email={email} />
      )}
    </>
  );
}

function MagicLinkSent({
  email,
  onPretendOpenLink,
}: {
  email: string;
  onPretendOpenLink: () => void;
}) {
  return (
    <div className="border border-accent/30 bg-accent-soft rounded-md p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-accent text-accent-fg flex items-center justify-center flex-none">
        <I.Check size={14} />
      </div>
      <div>
        <div className="text-[13.5px] font-semibold">Check your inbox</div>
        <div className="text-[12.5px] text-muted-fg mt-1">
          We sent a sign-in link to{" "}
          <span className="font-mono text-fg">{email}</span>. Open it on this
          device.
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 -ml-2"
          onClick={onPretendOpenLink}
        >
          Pretend I clicked the link
          <I.ArrowRight size={11} />
        </Button>
      </div>
    </div>
  );
}

function ResetLinkSent({ email }: { email: string }) {
  return (
    <div className="border border-accent/30 bg-accent-soft rounded-md p-4">
      <div className="text-[13.5px] font-semibold flex items-center gap-2">
        <I.Check size={14} className="text-accent" />
        Reset link sent
      </div>
      <div className="text-[12.5px] text-muted-fg mt-1">
        Sent to <span className="font-mono text-fg">{email}</span>. Check spam
        if you don&apos;t see it in 2 minutes.
      </div>
    </div>
  );
}
