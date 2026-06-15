/**
 * =====================================================
 * AppIcon
 * طبقة مركزية للأيقونات باستخدام lucide-react
 * أي أيقونة جديدة تمر من هنا حتى لا تتكرر الاستيرادات داخل الصفحات.
 * =====================================================
 */

import {
  AppWindow,
  Archive,
  BarChart3,
  Bell,
  BookOpenText,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  GalleryVerticalEnd,
  Headphones,
  Globe2,
  Image,
  Link2,
  Copy,
  UploadCloud,
  Check,
  Languages,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Menu,
  MessageSquareText,
  Moon,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  User,
  Users,
  X
} from "lucide-react";

const icons = {
  analytics: BarChart3,
  apps: AppWindow,
  archive: Archive,
  audit: ClipboardList,
  bell: Bell,
  blog: BookOpenText,
  check: Check,
  close: X,
  copy: Copy,
  file: FileText,
  dashboard: LayoutDashboard,
  edit: Pencil,
  email: Mail,
  external: Globe2,
  eye: Eye,
  eyeOff: EyeOff,
  faq: CircleHelp,
  media: Image,
  menu: Menu,
  messages: MessageSquareText,
  next: ChevronRight,
  pages: FileText,
  portfolio: BriefcaseBusiness,
  previous: ChevronLeft,
  products: Package,
  refresh: RefreshCw,
  roles: ShieldCheck,
  save: Save,
  search: Search,
  services: FolderKanban,
  support: Headphones,
  settings: Settings,
  sparkles: Sparkles,
  testimonials: GalleryVerticalEnd,
  users: Users,
  user: User,
  logout: LogOut,
  languages: Languages,
  loader: Loader2,
  lock: LockKeyhole,
  login: LogIn,
  moon: Moon,
  plus: Plus,
  sun: Sun,
  trash: Trash2,
  globe: Globe2,
  link: Link2,
  upload: UploadCloud
} as const;

export type IconName = keyof typeof icons;

type AppIconProps = {
  name: IconName;
  className?: string;
  size?: number;
};

export function AppIcon({ name, className, size = 20 }: AppIconProps) {
  const Icon = icons[name] ?? Sparkles;
  return <Icon aria-hidden="true" className={className} size={size} strokeWidth={1.9} />;
}
