import { I } from "@/components/Icons";

export function AuthBackButton({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[12px] text-muted-fg hover:text-fg mb-3 inline-flex items-center gap-1"
    >
      <I.ChevronRight size={11} className="rotate-180" />
      {children}
    </button>
  );
}
