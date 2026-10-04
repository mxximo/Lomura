import {
  Accessibility,
  ArrowRight,
  BadgeCheck,
  Bell,
  BellOff,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  Clock,
  Compass,
  Copy,
  Eye,
  EyeOff,
  Footprints,
  Globe,
  KeyRound,
  Leaf,
  Lock,
  Menu,
  Moon,
  Pause,
  PersonStanding,
  Play,
  ShieldCheck,
  Sparkles,
  Timer,
  ArrowUp,
  Download,
} from "lucide-react";

const icons = {
  eye: Eye,
  eyeOff: EyeOff,
  body: PersonStanding,
  posture: Accessibility,
  timeblock: Timer,
  pause: Pause,
  arrow: ArrowRight,
  check: Check,
  play: Play,
  book: BookOpen,
  compass: Compass,
  menu: Menu,
  globe: Globe,
  privacy: ShieldCheck,
  bell: Bell,
  bellOff: BellOff,
  moon: Moon,
  copy: Copy,
  bookmark: Bookmark,
  badge: BadgeCheck,
  keyhole: KeyRound,
  lock: Lock,
  shield: ShieldCheck,
  clock: Clock,
  calendar: CalendarDays,
  leaf: Leaf,
  footprints: Footprints,
  sparkles: Sparkles,
  up: ArrowUp,
  download: Download,
};

export default function Icon({
  name,
  size = 22,
  strokeWidth = 1.65,
  ...props
}) {
  const LucideIcon = icons[name] || Compass;
  return (
    <LucideIcon
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      data-icon={icons[name] ? name : "compass"}
      {...props}
    />
  );
}
