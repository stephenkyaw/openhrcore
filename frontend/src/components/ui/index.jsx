import { Children, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/cn";
import { I } from "@/components/Icons";
import { useStore } from "@/data/store";

export function Button({
  children,
  variant = "default",
  size = "md",
  className = "",
  as = "button",
  type,
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 font-medium select-none rounded-md border transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none focus-ring whitespace-nowrap";
  const variants = {
    default:
      "bg-accent text-accent-fg hover:bg-accent/90 border-accent/10",
    primary:
      "bg-accent text-accent-fg hover:bg-accent/90 border-accent/10",
    accent:
      "bg-accent text-accent-fg hover:bg-accent/90 border-accent/10",
    secondary: "bg-surface text-fg hover:bg-muted border-border-soft",
    outline:
      "bg-card text-fg hover:bg-muted border-border-soft",
    ghost: "border-transparent bg-transparent text-fg-soft hover:bg-muted/60 hover:text-fg",
    danger:
      "bg-danger/10 text-danger hover:bg-danger/15 border-danger/20",
    destructive:
      "bg-danger/10 text-danger hover:bg-danger/15 border-danger/20",
  };
  const sizes = {
    sm: "h-7 px-2.5 text-xs",
    md: "h-9 px-3.5 text-[14px]",
    lg: "h-11 px-4 text-[15px]",
    icon: "h-8 w-8",
    "icon-sm": "h-7 w-7",
  };
  const Tag = as;
  const buttonType = Tag === "button" ? type || "button" : type;
  return (
    <Tag
      type={buttonType}
      className={cn(
        base,
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Card({
  children,
  className = "",
  variant = "default",
  ...rest
}) {
  const variants = {
    default: "bg-card border border-border-soft shadow-soft-sm",
    elevated: "bg-card border border-border-soft shadow-soft",
    flat: "bg-surface border border-border-soft/70",
    ghost: "",
  };
  return <div className={cn("rounded-lg", variants[variant], className)} {...rest}>{children}</div>;
}
export const CardHeader = ({ children, className = "" }) => (
  <div
    className={cn(
      "px-4 pt-3.5 pb-3 flex items-center justify-between gap-2",
      className,
    )}
  >
    {children}
  </div>
);
export const CardTitle = ({ children, className = "" }) => (
  <h3
    className={cn(
      "text-[13px] font-semibold text-fg tracking-normal",
      className,
    )}
  >
    {children}
  </h3>
);
export const CardBody = ({ children, className = "" }) => (
  <div className={cn("px-4 pb-4", className)}>{children}</div>
);

const inputBase =
  "w-full bg-card border border-border-soft rounded-md text-[14px] text-fg placeholder:text-muted-fg/55 focus-ring disabled:opacity-50 transition-colors hover:border-fg/20 focus:border-accent/40";
export function Input({ className = "", ...rest }) {
  return <input className={cn(inputBase, "h-9 px-3", className)} {...rest} />;
}
export function Textarea({ className = "", rows = 3, ...rest }) {
  return (
    <textarea
      rows={rows}
      className={cn(
        inputBase,
        "px-3 py-2.5 leading-relaxed resize-none",
        className,
      )}
      {...rest}
    />
  );
}
export function Select({ className = "", children, ...rest }) {
  return (
    <div className="relative">
      <select
        className={cn(inputBase, "h-9 pl-3 pr-8 appearance-none", className)}
        {...rest}
      >
        {children}
      </select>
      <I.ChevronDown
        size={13}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-fg"
      />
    </div>
  );
}
export function Label({ children, className = "", ...rest }) {
  return (
    <label
      className={cn(
        "text-[11.5px] uppercase tracking-wider font-medium text-muted-fg",
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  );
}
export function TextLink({ children, className = "", as = "button", ...rest }) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "inline-flex items-center gap-1 text-[12.5px] font-medium text-muted-fg hover:text-fg focus-ring rounded transition-colors",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
export function Badge({
  children,
  tone = "default",
  size = "md",
  shape = "square",
  className = "",
}) {
  const tones = {
    default: "bg-muted text-fg-soft border-border-soft",
    accent: "bg-accent-soft text-accent border-accent/20",
    ok: "bg-ok/10 text-ok border-ok/20",
    warn: "bg-warn/10 text-warn border-warn/25",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-info/10 text-info border-info/20",
    outline: "border-border-soft text-muted-fg bg-transparent",
    solid: "bg-accent text-accent-fg border-transparent",
  };
  const sizes = {
    sm: "h-4 px-1.5 text-[10px]",
    md: "h-5 px-1.5 text-[10.5px]",
  };
  const shapes = { square: "rounded", pill: "rounded-full px-2" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium border tracking-normal tabular-nums",
        tones[tone],
        sizes[size],
        shapes[shape],
        className,
      )}
    >
      {children}
    </span>
  );
}
export function Dot({ tone = "ok", className = "", pulse = false }) {
  const tones = {
    ok: "bg-ok",
    warn: "bg-warn",
    danger: "bg-danger",
    info: "bg-info",
    muted: "bg-muted-fg/50",
    accent: "bg-accent",
  };
  return (
    <span
      className={cn(
        "relative inline-block w-1.5 h-1.5 rounded-full flex-none",
        tones[tone],
        className,
      )}
    >
      {pulse && (
        <span
          className={cn(
            "absolute inset-0 rounded-full animate-ping",
            tones[tone],
            "opacity-50",
          )}
        />
      )}
    </span>
  );
}
export function TierPill({ tier }) {
  const t = tier.toLowerCase();
  const map = {
    core: "bg-accent-soft text-accent",
    std: "bg-muted text-muted-fg",
    adv: "bg-warn/10 text-warn",
  };
  return (
    <span
      className={cn(
        "font-mono text-[9.5px] font-semibold uppercase rounded px-1 py-px tracking-wider",
        map[t],
      )}
    >
      {tier}
    </span>
  );
}
export function Avatar({ name, hue = 220, size = 28, className = "" }) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bg = `oklch(0.94 0.04 ${hue})`;
  const fg = `oklch(0.32 0.13 ${hue})`;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium select-none flex-none ring-1 ring-inset",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: Math.max(10, size * 0.36),
        "--tw-ring-color": `oklch(0.85 0.05 ${hue} / 0.5)`,
      }}
    >
      {initials}
    </span>
  );
}

function stripTableWhitespace(children) {
  return Children.toArray(children)
    .filter((child) => !(typeof child === "string" && child.trim() === ""))
    .map((child) => {
      if (!isValidElement(child)) return child;
      if (["thead", "tbody", "tfoot", "tr"].includes(child.type)) {
        return cloneElement(child, {
          children: stripTableWhitespace(child.props.children),
        });
      }
      return child;
    });
}

export const Table = ({ children, className = "" }) => (
  <table className={cn("w-full text-[13px] border-collapse", className)}>
    {stripTableWhitespace(children)}
  </table>
);
export const THead = ({ children }) => (
  <thead className="text-muted-fg">{stripTableWhitespace(children)}</thead>
);
export const TH = ({ children, className = "" }) => (
  <th
    className={cn(
      "text-left font-semibold text-[11px] uppercase tracking-[0.08em] text-muted-fg px-4 py-3 bg-surface border-b border-border-soft",
      className,
    )}
  >
    {" "}
    {children}{" "}
  </th>
);
export const TR = ({ children, className = "", ...rest }) => (
  <tr
    className={cn(
      "border-b border-border-soft last:border-0 hover:bg-muted/45 transition-colors",
      className,
    )}
    {...rest}
  >
    {stripTableWhitespace(children)}
  </tr>
);
export const TD = ({ children, className = "", ...rest }) => (
  <td className={cn("px-4 py-3.5 align-middle", className)} {...rest}>
    {children}
  </td>
);

export function Tabs({ value, onChange, items, className = "" }) {
  return (
    <div
      className={cn(
        "-mb-px flex flex-wrap gap-x-5 gap-y-1 border-b border-border-soft",
        className,
      )}
      role="tablist"
    >
      {" "}
      {items.map((t) => {
        const active = value === t.id;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              "focus-ring inline-flex h-11 items-center gap-2 border-b-2 px-0.5 text-[13px] font-medium whitespace-nowrap transition-colors",
              active
                ? "border-accent text-fg"
                : "border-transparent text-muted-fg hover:text-fg",
            )}
          >
            {" "}
            {Icon && <Icon size={13} />} <span>{t.label}</span>{" "}
            {t.count != null && (
              <Badge
                tone="outline"
                className={cn(
                  "h-5 px-1.5 text-[10.5px]",
                  active && "border-accent/30 bg-accent-soft text-accent",
                )}
              >
                {t.count}
              </Badge>
            )}{" "}
          </button>
        );
      })}{" "}
    </div>
  );
}

export const Kbd = ({ children, className = "" }) => (
  <kbd
    className={cn(
      "inline-flex items-center justify-center px-1.5 h-5 rounded border border-border-soft bg-surface text-muted-fg font-mono text-[10.5px]",
      className,
    )}
  >
    {" "}
    {children}{" "}
  </kbd>
);

export function Stat({ label, value, sub, delta, icon, className = "" }) {
  const isNeg = delta && (delta.startsWith("-") || delta.startsWith("−"));
  return (
    <div className={cn("px-4 py-3 flex items-center justify-between gap-3 min-w-0", className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-muted-fg min-w-0">
          {icon && <span className="flex-none opacity-70">{icon}</span>}
          <span className="text-[10.5px] uppercase tracking-[0.08em] font-semibold truncate">
            {label}
          </span>
        </div>
        {sub ? (
          <span className="text-[11.5px] text-muted-fg truncate">{sub}</span>
        ) : (
          null
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[20px] font-semibold tabular-nums leading-none text-fg">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "text-[11px] font-mono tabular-nums whitespace-nowrap inline-flex items-center gap-0.5 px-1 rounded",
              isNeg ? "text-danger bg-danger/8" : "text-ok bg-ok/8",
            )}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

export function InlineStats({ items = [], className = "" }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]", className)}>
      {items.map((item, idx) => (
        <span key={item.label} className="inline-flex items-center gap-x-1.5">
          {idx > 0 && <span className="mr-2 text-border">|</span>}
          <span className="font-semibold tabular-nums">{item.value}</span>
          <span className="text-muted-fg">
            {String(item.label).toLowerCase()}
          </span>
        </span>
      ))}
    </div>
  );
}

export function SectionHeader({ title, sub, actions, stats = [], className = "" }) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold leading-tight">{title}</h2>
        {sub && <p className="mt-1 text-[12.5px] text-muted-fg leading-relaxed">{sub}</p>}
        {stats.length > 0 && <InlineStats items={stats} className="mt-2" />}
      </div>
      {actions && <div className="flex items-center gap-2 flex-none">{actions}</div>}
    </div>
  );
}

export function SideNav({
  title,
  sub,
  value,
  onChange,
  items,
  className = "",
  embedded = false,
}) {
  const Wrapper = "div";
  return (
    <Wrapper className={cn("border-l border-border-soft pl-3", className)}>
      {(title || sub) && (
        <div className="mb-3">
          {title && <div className="text-[13px] font-semibold">{title}</div>}
          {sub && <div className="text-[11.5px] text-muted-fg mt-0.5">{sub}</div>}
        </div>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "w-full text-left border-l-2 -ml-[13px] pl-[11px] pr-2 py-2 flex items-center gap-2.5 focus-ring transition-colors",
                active
                  ? "border-accent text-fg"
                  : "border-transparent text-muted-fg hover:text-fg",
              )}
            >
              {Icon && (
                <span className={cn("flex-none", active && "text-accent")}>
                  <Icon size={13} />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold truncate">
                    {item.label}
                  </span>
                  {item.count != null && (
                    <Badge
                      tone="outline"
                      className={cn(
                        "h-5 px-1.5 text-[10.5px]",
                        active && "border-accent/30 bg-accent-soft text-accent",
                      )}
                    >
                      {item.count}
                    </Badge>
                  )}
                </span>
                {item.sub && (
                  <span className="block text-[11.5px] text-muted-fg truncate mt-0.5">
                    {item.sub}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </Wrapper>
  );
}

/*
 * Deprecated visual KPI card wrapper kept for old modules. It now renders as a
 * compact row so legacy feature tabs align with the approved inline-count style.
 */
export function StatDeprecated({ label, value, sub, delta, icon, className = "" }) {
  const isNeg = delta && (delta.startsWith("-") || delta.startsWith("−"));
  return (
    <div className={cn("px-4 py-3 flex items-center justify-between gap-3 min-w-0", className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-muted-fg">
          {icon && <span className="flex-none opacity-80">{icon}</span>}
          <span className="text-[10.5px] uppercase tracking-[0.08em] font-semibold truncate">
          {label}
          </span>
        </div>
        {sub && <span className="text-[11.5px] text-muted-fg truncate">{sub}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[20px] font-semibold tabular-nums leading-none">{value}</span>
        {delta && (
          <span
            className={cn(
              "text-[11px] font-mono tabular-nums whitespace-nowrap truncate inline-flex items-center gap-0.5 px-1 rounded",
              isNeg ? "text-danger bg-danger/8" : "text-ok bg-ok/8",
            )}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
export function Empty({ title, sub, action }) {
  return (
    <div className="py-14 px-6 text-center flex flex-col items-center gap-3">
      {" "}
      <div className="w-12 h-12 rounded-full border border-dashed border-border-soft flex items-center justify-center text-muted-fg bg-card">
        {" "}
        <I.Doc size={18} />{" "}
      </div>{" "}
      <div>
        {" "}
        <div className="text-[13px] font-medium">{title}</div>{" "}
        {sub && (
          <div className="text-[12px] text-muted-fg mt-0.5">{sub}</div>
        )}{" "}
      </div>{" "}
      {action}{" "}
    </div>
  );
}
export function Sheet({
  open,
  onClose,
  children,
  side = "right",
  width = 460,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      {" "}
      <div
        className="absolute inset-0 bg-black/30 anim-fade"
        onClick={onClose}
      />{" "}
      <div
        className={cn(
          "absolute top-0 bottom-0 bg-card border-border-soft shadow-soft-lg anim-slide-r flex flex-col",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
        )}
        style={{ width }}
      >
        {" "}
        {children}{" "}
      </div>{" "}
    </div>
  );
}
export function Dialog({ open, onClose, children, width = 520 }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {" "}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px] anim-fade"
        onClick={onClose}
      />{" "}
      <div
        className="relative bg-card border border-border-soft rounded-xl shadow-soft-lg anim-slide-up max-h-[calc(100vh-48px)] overflow-hidden flex flex-col"
        style={{ width, maxWidth: "100%" }}
      >
        {" "}
        {children}{" "}
      </div>{" "}
    </div>
  );
}
export const Caption = ({ children, className = "" }) => (
  <div className={cn("text-[11.5px] text-muted-fg", className)}>{children}</div>
);
export function Toaster() {
  const { toasts } = useStore();
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2">
      {" "}
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-3 py-2 bg-fg text-bg rounded-md text-[12.5px] font-medium shadow-soft-lg anim-slide-up flex items-center gap-2"
        >
          {" "}
          <I.Check size={13} /> {t.msg}{" "}
        </div>
      ))}{" "}
    </div>
  );
}
export function PageKicker({ children, className = "" }) {
  return (
    <div
      className={cn(
        "text-[10.5px] font-mono uppercase tracking-[0.12em] text-muted-fg mb-1.5 flex items-center gap-1.5",
        className,
      )}
    >
      {" "}
      <span className="inline-block w-1 h-1 rounded-full bg-muted-fg/70" />{" "}
      {children}{" "}
    </div>
  );
}
export function PageHeader({ title, sub, actions, eyebrow }) {
  return (
    <div className="px-7 py-5 bg-card border-b border-border-soft flex items-end justify-between gap-6">
      {" "}
      <div className="min-w-0">
        {" "}
        {eyebrow && <PageKicker>{eyebrow}</PageKicker>}{" "}
        <h1 className="text-[25px] font-semibold text-fg leading-tight">
          {title}
        </h1>{" "}
        {sub && (
          <div className="text-[14px] text-muted-fg mt-1.5 max-w-3xl leading-relaxed">
            {sub}
          </div>
        )}{" "}
      </div>{" "}
      <div className="flex items-center gap-2 flex-none">{actions}</div>{" "}
    </div>
  );
}
export function PageShell({
  eyebrow,
  title,
  sub,
  stats = [],
  actions,
  children,
  className = "",
}) {
  return (
    <div
      className={cn("h-full flex flex-col overflow-hidden bg-bg", className)}
    >
      {" "}
      <div className="border-b border-border-soft bg-card">
        {" "}
        <div className="px-7 py-5 flex items-end justify-between gap-6">
          {" "}
          <div className="min-w-0">
            {" "}
            {eyebrow && (
              <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-muted-fg">
                {eyebrow}
              </div>
            )}{" "}
            <h1 className="mt-1 text-[25px] font-semibold leading-tight">
              {title}
            </h1>{" "}
            {sub && (
              <p className="mt-1.5 text-[14px] text-muted-fg max-w-3xl leading-relaxed">
                {sub}
              </p>
            )}{" "}
            {stats.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                {" "}
                {stats.map((s, idx) => (
                  <span
                    key={s.label}
                    className="inline-flex items-center gap-x-1.5"
                  >
                    {" "}
                    {idx > 0 && (
                      <span className="mr-2 text-border">|</span>
                    )}{" "}
                    <span className="font-semibold tabular-nums">
                      {s.value}
                    </span>{" "}
                    <span className="text-muted-fg">{s.label}</span>{" "}
                  </span>
                ))}{" "}
              </div>
            )}{" "}
          </div>{" "}
          {actions && (
            <div className="flex items-center gap-2 flex-none">{actions}</div>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {children}{" "}
    </div>
  );
}
export function PageHero({
  eyebrow,
  title,
  sub,
  actions,
  metrics = [],
  className = "",
  tone = "default",
}) {
  const tones = { default: "bg-card", blue: "bg-card", plain: "bg-card" };
  return (
    <div
      className={cn(
        "px-7 py-5 border-b border-border-soft",
        tones[tone] || tones.default,
        className,
      )}
    >
      {" "}
      <div className="flex items-end justify-between gap-6">
        {" "}
        <div className="min-w-0">
          {" "}
          <div className="max-w-3xl">
            {" "}
            {eyebrow && <PageKicker>{eyebrow}</PageKicker>}{" "}
            <h1 className="text-[25px] font-semibold leading-tight">{title}</h1>{" "}
            {sub && (
              <p className="text-[14px] text-muted-fg mt-1.5 max-w-3xl leading-relaxed">
                {sub}
              </p>
            )}{" "}
            {metrics.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                {" "}
                {metrics.map((m, idx) => (
                  <span
                    key={m.label}
                    className="inline-flex items-center gap-x-1.5"
                  >
                    {" "}
                    {idx > 0 && (
                      <span className="mr-2 text-border">|</span>
                    )}{" "}
                    <span className="font-semibold tabular-nums">
                      {m.value}
                    </span>{" "}
                    <span className="text-muted-fg">
                      {String(m.label).toLowerCase()}
                    </span>{" "}
                  </span>
                ))}{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
        {actions && (
          <div className="flex items-center gap-2 flex-none">{actions}</div>
        )}{" "}
      </div>{" "}
    </div>
  );
}
export function FilterChip({ children, onClear }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md border border-border-soft bg-card text-[11.5px] text-fg-soft">
      {" "}
      {children}{" "}
      {onClear && (
        <button
          onClick={onClear}
          className="text-muted-fg hover:text-fg focus-ring rounded"
        >
          {" "}
          <I.X size={10} />{" "}
        </button>
      )}{" "}
    </span>
  );
}
export function SectionTitle({ children, sub, action, className = "" }) {
  return (
    <div className={cn("flex items-end justify-between gap-2 mb-2", className)}>
      {" "}
      <div>
        {" "}
        <div className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-fg">
          {children}
        </div>{" "}
        {sub && (
          <div className="text-[11.5px] text-muted-fg/80 mt-0.5">{sub}</div>
        )}{" "}
      </div>{" "}
      {action}{" "}
    </div>
  );
}
export function leaveStatusBadge(status) {
  if (status === "approved")
    return (
      <Badge tone="ok">
        <I.Check size={10} />
        Approved
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge tone="danger">
        <I.X size={10} />
        Rejected
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge tone="warn">
        <I.Clock size={10} />
        Pending
      </Badge>
    );
  return <Badge>{status}</Badge>;
}
