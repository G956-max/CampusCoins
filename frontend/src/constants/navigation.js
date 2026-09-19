import {
  LayoutDashboard,
  FileText,
  AlertCircle,
  MapPin,
  Coins,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  User,
} from 'lucide-react';
import { ROLES } from './roles';

export const STUDENT_NAV_ITEMS = [
  { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { name: 'My Profile', path: '/student/profile', icon: User },
  { name: 'My Complaints', path: '/student/complaints', icon: FileText },
  { name: 'Report Issue', path: '/student/complaints/new', icon: AlertCircle },
  { name: 'Campus Map', path: '#', icon: MapPin, badge: 'Phase 4' },
  { name: 'CampusCoins & Rewards', path: '#', icon: Coins, badge: 'Phase 5' },
];

export const STAFF_NAV_ITEMS = [
  { name: 'Staff Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
  { name: 'Staff Profile', path: '/staff/profile', icon: User },
  { name: 'Assigned Complaints', path: '/staff/complaints', icon: FileText },
  { name: 'Pending Tasks', path: '#', icon: Clock, badge: 'Phase 4' },
  { name: 'SLA Tracking', path: '#', icon: ShieldAlert, badge: 'Phase 4' },
];

export const ADMIN_NAV_ITEMS = [
  { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Admin Profile', path: '/admin/profile', icon: User },
  { name: 'All Complaints', path: '/admin/complaints', icon: FileText },
  { name: 'Staff & Departments', path: '#', icon: Users, badge: 'Phase 4' },
  { name: 'Analytics & Coins', path: '#', icon: BarChart3, badge: 'Phase 5' },
  { name: 'Campus Settings', path: '#', icon: Settings, badge: 'Phase 4' },
];

export const PUBLIC_NAV_LINKS = [
  { name: 'Home', href: '#home' },
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'About', href: '#about' },
];
