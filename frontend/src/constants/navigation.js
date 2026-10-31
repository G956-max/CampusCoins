import {
  LayoutDashboard,
  FileText,
  AlertCircle,
  Coins,
  Gift,
  Award,
  Target,
  Trophy,
  History,
  Users,
  BarChart3,
  Settings,
  User,
  Clock,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const STUDENT_NAV_ITEMS = [
  { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { name: 'My Complaints', path: '/student/complaints', icon: FileText },
  { name: 'Report Issue', path: '/student/complaints/new', icon: AlertCircle },
  { name: 'Campus Map', path: '/student/map', icon: MapPin },
  { name: 'CampusCoins', path: '/student/wallet', icon: Coins },
  { name: 'Rewards', path: '/student/rewards', icon: Gift },
  { name: 'Missions', path: '/student/missions', icon: Target },
  { name: 'Badges', path: '/student/badges', icon: Award },
  { name: 'Bounties', path: '/student/bounties', icon: Sparkles },
  { name: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
  { name: 'Profile', path: '/student/profile', icon: User },
];

export const STAFF_NAV_ITEMS = [
  { name: 'Staff Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
  { name: 'Assigned Complaints', path: '/staff/complaints', icon: FileText },
  { name: 'Campus Map', path: '/staff/map', icon: MapPin },
  { name: 'Profile', path: '/staff/profile', icon: User },
];

export const ADMIN_NAV_ITEMS = [
  { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'All Complaints', path: '/admin/complaints', icon: FileText },
  { name: 'Campus Map', path: '/admin/map', icon: MapPin },
  { name: 'Profile', path: '/admin/profile', icon: User },
];

export const PUBLIC_NAV_LINKS = [
  { name: 'Home', href: '#home' },
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'About', href: '#about' },
];
