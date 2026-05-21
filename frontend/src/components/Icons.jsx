export const Icon = ({
  children,
  size = 16,
  stroke = 1.6,
  className = "",
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...rest}
  >
    {" "}
    {children}{" "}
  </svg>
);
export const I = {
  Logo: (p) => (
    <Icon {...p}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 8v8" />
      <path d="M8 12h4a2 2 0 0 0 0-4H8" />
      <path d="M16 16l-2-3 2-3" />
    </Icon>
  ),
  Dashboard: (p) => (
    <Icon {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1.2" />
      <rect x="14" y="3" width="7" height="5" rx="1.2" />
      <rect x="14" y="12" width="7" height="9" rx="1.2" />
      <rect x="3" y="16" width="7" height="5" rx="1.2" />
    </Icon>
  ),
  Users: (p) => (
    <Icon {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c.6-3.2 3.2-5 6-5s5.4 1.8 6 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14c2.5 0 4.3 1.5 5 4" />
    </Icon>
  ),
  Calendar: (p) => (
    <Icon {...p}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4M16 3v4" />
    </Icon>
  ),
  Sitemap: (p) => (
    <Icon {...p}>
      <rect x="9" y="3" width="6" height="4.5" rx="1" />
      <rect x="3" y="16.5" width="6" height="4.5" rx="1" />
      <rect x="15" y="16.5" width="6" height="4.5" rx="1" />
      <path d="M12 7.5v3M6 16.5v-3h12v3M12 10.5v3" />
    </Icon>
  ),
  Shield: (p) => (
    <Icon {...p}>
      <path d="M12 3l8 3v6c0 4.5-3.2 8.2-8 9-4.8-.8-8-4.5-8-9V6l8-3z" />
    </Icon>
  ),
  Building: (p) => (
    <Icon {...p}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
      <path d="M10 21v-3h4v3" />
    </Icon>
  ),
  Bell: (p) => (
    <Icon {...p}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Icon>
  ),
  Sun: (p) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
  ),
  Moon: (p) => (
    <Icon {...p}>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </Icon>
  ),
  Search: (p) => (
    <Icon {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-3.5-3.5" />
    </Icon>
  ),
  Sparkle: (p) => (
    <Icon {...p}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </Icon>
  ),
  ChevronRight: (p) => (
    <Icon {...p}>
      <path d="M9 5l7 7-7 7" />
    </Icon>
  ),
  ChevronDown: (p) => (
    <Icon {...p}>
      <path d="M5 9l7 7 7-7" />
    </Icon>
  ),
  Plus: (p) => (
    <Icon {...p}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  ),
  Check: (p) => (
    <Icon {...p}>
      <path d="M4 12l5 5L20 6" />
    </Icon>
  ),
  X: (p) => (
    <Icon {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  ),
  Filter: (p) => (
    <Icon {...p}>
      <path d="M4 5h16l-6 8v6l-4-2v-4z" />
    </Icon>
  ),
  Download: (p) => (
    <Icon {...p}>
      <path d="M12 4v11M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </Icon>
  ),
  Mail: (p) => (
    <Icon {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
    </Icon>
  ),
  Phone: (p) => (
    <Icon {...p}>
      <path d="M5 4h3l2 5-2 1c1 2 2 3 4 4l1-2 5 2v3a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </Icon>
  ),
  MapPin: (p) => (
    <Icon {...p}>
      <path d="M12 21s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </Icon>
  ),
  Briefcase: (p) => (
    <Icon {...p}>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </Icon>
  ),
  IdCard: (p) => (
    <Icon {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="12" r="2.2" />
      <path d="M14 10h4M14 13h3M6 16h6" />
    </Icon>
  ),
  Doc: (p) => (
    <Icon {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </Icon>
  ),
  Clock: (p) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),
  ArrowRight: (p) => (
    <Icon {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  ),
  ArrowUpRight: (p) => (
    <Icon {...p}>
      <path d="M7 17L17 7M9 7h8v8" />
    </Icon>
  ),
  Menu: (p) => (
    <Icon {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  ),
  More: (p) => (
    <Icon {...p}>
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18" cy="12" r="1.4" />
    </Icon>
  ),
  Cmd: (p) => (
    <Icon {...p}>
      <path d="M9 9V6a2 2 0 1 0-2 2h10a2 2 0 1 0-2-2v3M9 9h6v6M9 9v6a2 2 0 1 1-2-2h10a2 2 0 1 1-2 2v-3" />
    </Icon>
  ),
  Send: (p) => (
    <Icon {...p}>
      <path d="M4 20l16-8L4 4l3 8z" />
      <path d="M7 12h7" />
    </Icon>
  ),
  Spark: (p) => (
    <Icon {...p}>
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3" />
    </Icon>
  ),
  Hash: (p) => (
    <Icon {...p}>
      <path d="M4 9h16M4 15h16M10 3l-2 18M16 3l-2 18" />
    </Icon>
  ),
  Settings: (p) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.7.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.7V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
    </Icon>
  ),
  Globe: (p) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </Icon>
  ),
  TrendingUp: (p) => (
    <Icon {...p}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </Icon>
  ),
  Beach: (p) => (
    <Icon {...p}>
      <path d="M12 20s4-4 4-9-4-7-4-7-4 2-4 7" />
      <path d="M3 20h18" />
      <circle cx="6" cy="6" r="2" />
    </Icon>
  ),
  Pulse: (p) => (
    <Icon {...p}>
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </Icon>
  ),
  PanelRight: (p) => (
    <Icon {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M15 4v16" />
    </Icon>
  ),
  Sliders: (p) => (
    <Icon {...p}>
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </Icon>
  ),
  Tag: (p) => (
    <Icon {...p}>
      <path d="M3 12V4h8l10 10-8 8z" />
      <circle cx="7.5" cy="7.5" r="1.4" />
    </Icon>
  ),
  Refresh: (p) => (
    <Icon {...p}>
      <path d="M20 11a8 8 0 1 0-2 6" />
      <path d="M20 5v6h-6" />
    </Icon>
  ),
  Eye: (p) => (
    <Icon {...p}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  ),
  AlertTriangle: (p) => (
    <Icon {...p}>
      <path d="M12 3l10 17H2z" />
      <path d="M12 10v4M12 17v.5" />
    </Icon>
  ),
  Key: (p) => (
    <Icon {...p}>
      <circle cx="7" cy="14" r="4" />
      <path d="M10 12l8-8 3 3-2 2 2 2-3 3-2-2-3 3" />
    </Icon>
  ),
  Edit: (p) => (
    <Icon {...p}>
      <path d="M14 4l6 6L8 22H2v-6z" />
    </Icon>
  ),
  CircleDot: (p) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </Icon>
  ),
};
