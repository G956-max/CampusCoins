/**
 * Phase 1 Mock Data
 * Structured strictly to be replaced by REST/Supabase endpoints in Phase 2.
 */

export const MOCK_STUDENT_DATA = {
  profile: {
    name: "Alex Rivera",
    email: "alex.rivera@campus.edu",
    role: "student",
    studentId: "STU-2024-8842",
    department: "Computer Science & Engineering",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  metrics: {
    myComplaints: 12,
    pendingComplaints: 3,
    resolvedComplaints: 9,
    campusCoins: 480,
    impactScore: 94, // Out of 100
  },
  recentComplaints: [
    {
      id: "CMP-1048",
      title: "Broken Air Conditioning in CS Lab 3",
      category: "Infrastructure",
      location: "Academic Block B, Floor 2",
      status: "In Progress",
      statusVariant: "warning",
      date: "Today, 10:30 AM",
      coinsAwarded: 50,
      assignedDept: "HVAC & Facilities",
    },
    {
      id: "CMP-1041",
      title: "Water Dispenser Sensor Malfunction",
      category: "Sanitation",
      location: "Library Reading Hall",
      status: "Resolved",
      statusVariant: "success",
      date: "Yesterday",
      coinsAwarded: 35,
      assignedDept: "Maintenance",
    },
    {
      id: "CMP-1029",
      title: "Flickering Overhead Tube Lights",
      category: "Electrical",
      location: "Seminar Hall 1",
      status: "Resolved",
      statusVariant: "success",
      date: "3 days ago",
      coinsAwarded: 25,
      assignedDept: "Electrical Services",
    },
  ],
};

export const MOCK_STAFF_DATA = {
  profile: {
    name: "David Vance",
    email: "d.vance@campus.edu",
    role: "staff",
    department: "Campus Facilities & Infrastructure",
    designation: "Lead Technical Officer",
  },
  metrics: {
    assignedComplaints: 18,
    pendingTasks: 7,
    resolvedToday: 5,
    slaAlerts: 2,
  },
  assignedTasks: [
    {
      id: "CMP-1048",
      title: "Broken Air Conditioning in CS Lab 3",
      priority: "High",
      priorityVariant: "danger",
      location: "Academic Block B, Floor 2",
      reportedBy: "Alex Rivera",
      timeRemaining: "3h 40m",
      status: "In Progress",
    },
    {
      id: "CMP-1052",
      title: "Projector HDMI Port Damaged",
      priority: "Medium",
      priorityVariant: "warning",
      location: "Lecture Hall 401",
      reportedBy: "Samantha Patel",
      timeRemaining: "8h 15m",
      status: "Pending Inspection",
    },
    {
      id: "CMP-1055",
      title: "Restroom Door Latch Jammed",
      priority: "Low",
      priorityVariant: "info",
      location: "Sports Complex Ground Floor",
      reportedBy: "Marcus Chen",
      timeRemaining: "24h 00m",
      status: "Assigned",
    },
  ],
};

export const MOCK_ADMIN_DATA = {
  profile: {
    name: "Dr. Eleanor Vance",
    email: "admin.office@campus.edu",
    role: "admin",
    designation: "Campus Chief Operations Administrator",
  },
  metrics: {
    totalComplaints: 342,
    pending: 48,
    resolved: 294,
    criticalIssues: 4,
    coinsDistributed: 15850,
  },
  categoryBreakdown: [
    { name: "Electrical", complaints: 85, color: "#f59e0b" },
    { name: "HVAC & Facilities", complaints: 110, color: "#6366f1" },
    { name: "IT & Labs", complaints: 64, color: "#38bdf8" },
    { name: "Sanitation", complaints: 52, color: "#10b981" },
    { name: "Safety & Security", complaints: 31, color: "#f43f5e" },
  ],
  recentPlatformActivity: [
    {
      id: 1,
      user: "Alex Rivera",
      action: "Earned 50 CampusCoins",
      context: "CMP-1041 Verified Resolution",
      time: "12m ago",
    },
    {
      id: 2,
      user: "Staff David V.",
      action: "Closed ticket CMP-1041",
      context: "Water Dispenser Sensor Malfunction",
      time: "25m ago",
    },
    {
      id: 3,
      user: "Priya Sharma",
      action: "Submitted new ticket",
      context: "CMP-1056 Wi-Fi Deadzone in Cafeteria",
      time: "1h ago",
    },
  ],
};
