/**
 * =====================================================
 * AppIcon
 * خريطة أيقونات مركزية من lucide-react
 * ممنوع استيراد الأيقونات مباشرة داخل صفحات الموقع
 * =====================================================
 */

import {
  AppWindow,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Cable,
  ChartNoAxesCombined,
  CheckCircle2,
  Code2,
  Database,
  Download,
  Headphones,
  Gauge,
  Globe2,
  Languages,
  LayoutDashboard,
  Layers3,
  Loader2,
  Mail,
  Menu,
  MessageCircle,
  Monitor,
  Moon,
  Network,
  PanelsTopLeft,
  PhoneCall,
  Quote,
  Rocket,
  ServerCog,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  User,
  Workflow,
  X,
  Zap
} from "lucide-react";

const icons = {
  apps: AppWindow,
  arrowUpRight: ArrowUpRight,
  badgeCheck: BadgeCheck,
  bell: Bell,
  cable: Cable,
  chart: ChartNoAxesCombined,
  check: CheckCircle2,
  code: Code2,
  database: Database,
  download: Download,
  dashboard: LayoutDashboard,
  external: Globe2,
  gauge: Gauge,
  globe: Globe2,
  languages: Languages,
  layers: Layers3,
  loader: Loader2,
  mail: Mail,
  menu: Menu,
  message: MessageCircle,
  messages: MessageCircle,
  monitor: Monitor,
  moon: Moon,
  network: Network,
  panels: PanelsTopLeft,
  phone: PhoneCall,
  quote: Quote,
  rocket: Rocket,
  server: ServerCog,
  support: Headphones,
  settings: Settings,
  shield: ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  testimonials: MessageCircle,
  sun: Sun,
  user: User,
  workflow: Workflow,
  x: X,
  zap: Zap
} as const;

export type AppIconName = keyof typeof icons;

type AppIconProps = {
  name: AppIconName | string;
  className?: string;
  size?: number;
};

export function AppIcon({ name, className, size = 20 }: AppIconProps) {
  const Icon = icons[name as AppIconName] ?? Sparkles;
  return <Icon aria-hidden="true" className={className} size={size} strokeWidth={2.15} />;
}
