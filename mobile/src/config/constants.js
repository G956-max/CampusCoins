import { Platform } from 'react-native';

// Default Backend URL
// On Android Emulator, localhost is 10.0.2.2. On Web/iOS it's localhost.
export const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  default: 'http://localhost:5000',
});

// Supabase Configuration from CampusCoins
export const SUPABASE_URL = 'https://fscvotjtqatutitnvncc.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzY3ZvdGp0cWF0dXRpdG52bmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMTU2NzQsImV4cCI6MjEwODY5MTY3NH0.8pURUaHI0lgkm_uo_pVcBsB8FVOdNahPftbwz-BNxHM';

export const ROLES = {
  STUDENT: 'student',
  STAFF: 'staff',
  ADMIN: 'admin',
};

// Strict match with backend validators/complaintValidator.js
export const CATEGORIES = [
  { id: 'Electrical', label: 'Electrical', icon: 'flash' },
  { id: 'Plumbing', label: 'Plumbing', icon: 'water' },
  { id: 'Wi-Fi / Internet', label: 'Wi-Fi / Internet', icon: 'wifi' },
  { id: 'Classroom', label: 'Classroom', icon: 'school' },
  { id: 'Laboratory', label: 'Laboratory', icon: 'hardware-chip' },
  { id: 'Cleaning', label: 'Cleaning', icon: 'trash-bin' },
  { id: 'Furniture', label: 'Furniture', icon: 'cube' },
  { id: 'Restroom', label: 'Restroom', icon: 'water-outline' },
  { id: 'Water', label: 'Water Dispenser', icon: 'water' },
  { id: 'Safety', label: 'Safety / Hazard', icon: 'shield-alert' },
  { id: 'Library', label: 'Library', icon: 'book' },
  { id: 'Other', label: 'Other', icon: 'ellipsis-horizontal-circle' },
];

export const PRIORITIES = [
  { id: 'low', label: 'Low', color: '#10B981' },
  { id: 'medium', label: 'Medium', color: '#F59E0B' },
  { id: 'high', label: 'High', color: '#EF4444' },
  { id: 'critical', label: 'Critical', color: '#DC2626' },
];

export const STATUS_MAP = {
  submitted: { label: 'Submitted', color: '#2563EB', bg: '#DBEAFE' },
  under_review: { label: 'Under Review', color: '#0284C7', bg: '#E0F2FE' },
  assigned: { label: 'Assigned', color: '#6366F1', bg: '#EEF2FF' },
  in_progress: { label: 'In Progress', color: '#B45309', bg: '#FEF9C3' },
  resolved: { label: 'Resolved', color: '#168451', bg: '#EAF6EE' },
  verified: { label: 'Verified', color: '#047857', bg: '#D1FAE5' },
  closed: { label: 'Closed', color: '#64748B', bg: '#F1F5F9' },
  rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' },
};

export const MOCK_USERS = {
  student: {
    id: 'b8000000-0000-0000-0000-000000000001',
    full_name: 'Alex Rivera',
    email: 'alex.rivera@campus.edu',
    role: 'student',
    student_id: 'STU-2024-8842',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    wallet: { balance: 480, lifetime_earned: 920, lifetime_spent: 440 },
  },
  staff: {
    id: 'b8000000-0000-0000-0000-000000000002',
    full_name: 'David Vance',
    email: 'd.vance@campus.edu',
    role: 'staff',
    staff_id: 'STF-402',
    department: 'Campus Facilities & Maintenance',
    designation: 'Lead Technical Officer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    wallet: { balance: 120, lifetime_earned: 300, lifetime_spent: 180 },
  },
  admin: {
    id: 'b8000000-0000-0000-0000-000000000003',
    full_name: 'Dr. Eleanor Vance',
    email: 'admin.office@campus.edu',
    role: 'admin',
    department: 'Dean of Student Affairs',
    designation: 'Director of Campus Services',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    wallet: { balance: 1000, lifetime_earned: 2500, lifetime_spent: 1500 },
  },
};
