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
    impactScore: 94,
  },
  recentComplaints: [
    {
      id: "CMP-1048",
      title: "Broken Air Conditioning in CS Lab 3",
      category: "Infrastructure",
      location: "Academic Block B, Floor 2",
      status: "in_progress",
      date: "Today, 10:30 AM",
      coinsAwarded: 50,
      assignedDept: "HVAC & Facilities",
      upvotes: 8,
      description: "AC unit in CS Lab 3 stopped blowing cool air and produces a vibrating noise. Temperature in lab exceeds 32°C during practical sessions.",
    },
    {
      id: "CMP-1041",
      title: "Water Dispenser Sensor Malfunction",
      category: "Sanitation",
      location: "Library Reading Hall",
      status: "resolved",
      date: "Yesterday",
      coinsAwarded: 35,
      assignedDept: "Maintenance",
      upvotes: 14,
      description: "Sensor on cold water tap remains stuck in running position, causing continuous water wastage on the floor.",
    },
    {
      id: "CMP-1029",
      title: "Flickering Overhead Tube Lights",
      category: "Electrical",
      location: "Seminar Hall 1",
      status: "resolved",
      date: "3 days ago",
      coinsAwarded: 25,
      assignedDept: "Electrical Services",
      upvotes: 5,
      description: "Overhead tube lights near the projector screen flicker continuously during presentations.",
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
      location: "Academic Block B, Floor 2",
      reportedBy: "Alex Rivera",
      timeRemaining: "3h 40m",
      status: "in_progress",
    },
    {
      id: "CMP-1052",
      title: "Projector HDMI Port Damaged",
      priority: "Medium",
      location: "Lecture Hall 401",
      reportedBy: "Samantha Patel",
      timeRemaining: "8h 15m",
      status: "under_review",
    },
  ],
};

export const MOCK_ADMIN_DATA = {
  profile: {
    name: "Dr. Eleanor Vance",
    email: "admin.office@campus.edu",
    role: "admin",
    department: "Campus Operations & Administration",
  },
  metrics: {
    totalComplaints: 142,
    activeComplaints: 28,
    resolvedRate: "89.4%",
    totalCoinsAwarded: 14850,
  },
};
