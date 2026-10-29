const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');

// Campus Center and Bounds — Erode Sengunthar Engineering College, Perundurai (PIN: 638057)
const CAMPUS_METADATA = {
  center: [11.31430, 77.55140],
  zoom: 17,
  campusName: 'Erode Sengunthar Engineering College (Autonomous)',
  institutionCode: 'ESEC',
  address: 'Thudupathi Post, Perundurai, Erode – 638057, Tamil Nadu, India',
  district: 'Erode',
  pincode: '638057',
  campusBounds: [
    [11.31200, 77.54850],
    [11.31680, 77.55400]
  ]
};

// Configured 2026 Campus Buildings at Erode Sengunthar Engineering College
const CAMPUS_BUILDINGS = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    name: 'Main Academic & Administrative Secretariat',
    code: 'MB',
    description: "Principal's office, Administrative Directorate, Autonomous Examination Cell, Governing Council Board Rooms & Central Accounts.",
    facility_type: 'administrative',
    coordinates: [11.31410, 77.55100],
    floorsCount: 3,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    name: 'CSE, IT & Artificial Intelligence Computing Center',
    code: 'CSEB',
    description: 'Computer Science & Engineering, Information Technology, AI & Data Science labs, Cyber Security Research, Cloud Server Clusters.',
    facility_type: 'academic',
    coordinates: [11.31460, 77.55150],
    floorsCount: 4,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000013',
    name: 'AICTE IDEA Lab & Central Prototyping Hub',
    code: 'IDEA',
    description: 'State-of-the-art multidisciplinary innovation hub featuring industrial 3D printers, laser cutters, CNC PCB milling, robotics fabrication and IoT benches.',
    facility_type: 'laboratory',
    coordinates: [11.31485, 77.55180],
    floorsCount: 2,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000014',
    name: 'ESEC Innovation & Incubation Foundation (ESEC-IIF / Startup TN)',
    code: 'IIF',
    description: 'Startup incubator supported by Startup TN and MSME, co-working spaces, patent cell, corporate venture development and mentoring suites.',
    facility_type: 'laboratory',
    coordinates: [11.31495, 77.55220],
    floorsCount: 2,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000003',
    name: 'Science & Humanities Block (First Year Engineering)',
    code: 'SHB',
    description: 'First year engineering lecture theaters, Optics and Laser lab, Engineering Chemistry research lab, Digital English Language studio.',
    facility_type: 'academic',
    coordinates: [11.31380, 77.55130],
    floorsCount: 3,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000004',
    name: 'Central Library & Digital Knowledge Commons',
    code: 'LIB',
    description: 'Modern central air-conditioned library, 60,000+ volumes, IEEE/ScienceDirect electronic access, silent reading carrels and media center.',
    facility_type: 'library',
    coordinates: [11.31430, 77.55160],
    floorsCount: 2,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000005',
    name: 'ECE & EIE Electronics Tech Block',
    code: 'ECEB',
    description: 'Electronics & Communication, VLSI Design Lab, Embedded Systems, Signal Processing & Sensor Networks center.',
    facility_type: 'academic',
    coordinates: [11.31470, 77.55080],
    floorsCount: 3,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000006',
    name: 'Mechanical & Robotics Engineering Block',
    code: 'MECHB',
    description: 'Robotics & Automation center, Heavy Machine Shop, CNC Machining, Additive Manufacturing & CAD/CAM Simulation Studio.',
    facility_type: 'laboratory',
    coordinates: [11.31510, 77.55110],
    floorsCount: 2,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000007',
    name: 'Civil & Agricultural Engineering Block',
    code: 'CIVILB',
    description: 'Structural Analysis Lab, Soil Mechanics, Environmental Engineering, Precision Agriculture & Irrigation Mechanics.',
    facility_type: 'academic',
    coordinates: [11.31490, 77.55260],
    floorsCount: 2,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000008',
    name: 'EEE & Chemical Engineering Block',
    code: 'EEEB',
    description: 'High Voltage Engineering, Power Electronics & Renewable Micro-grid, Chemical Unit Operations and Petrochemical Lab.',
    facility_type: 'academic',
    coordinates: [11.31420, 77.55210],
    floorsCount: 3,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000015',
    name: 'Biomedical Engineering (BME) & Biotech Block',
    code: 'BMEB',
    description: 'Biomedical Instrumentation, Medical Signal Processing, Diagnostic Imaging, Biomaterials and Genetic Engineering research.',
    facility_type: 'academic',
    coordinates: [11.31440, 77.55240],
    floorsCount: 3,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000016',
    name: 'Management Studies (MBA) & Post-Graduate Complex',
    code: 'MBAB',
    description: 'Executive MBA lecture halls, Bloomberg financial analytics lab, Corporate Case Study halls, Business Incubation floor.',
    facility_type: 'academic',
    coordinates: [11.31390, 77.55180],
    floorsCount: 3,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000009',
    name: 'Central Food Court & Dining Complex (Canteen)',
    code: 'CAN',
    description: 'Multi-cuisine student and staff food court, fresh juice bar, healthy dining halls, bakery, and digital CampusCoins payment desks.',
    facility_type: 'cafeteria',
    coordinates: [11.31440, 77.55040],
    floorsCount: 1,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000010',
    name: 'ESEC Convention Center & 1,500-Seat Auditorium',
    code: 'AUD',
    description: 'Air-conditioned auditorium with digital line-array acoustics for graduations, national symposiums, cultural fests and guest lectures.',
    facility_type: 'auditorium',
    coordinates: [11.31350, 77.55110],
    floorsCount: 1,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000011',
    name: 'ESEC Sports Arena, Athletic Track & Cricket Ground',
    code: 'SPRT',
    description: 'Olympic-size athletic running track, standard turf cricket ground, football pitch, indoor badminton stadium and strength gym.',
    facility_type: 'sports',
    coordinates: [11.31560, 77.55060],
    floorsCount: 1,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000012',
    name: 'Diamond Hostel (Senior Boys Residence)',
    code: 'DHSTL',
    description: 'Senior student residential blocks, study halls, high-speed Wi-Fi, recreation rooms and dining mess.',
    facility_type: 'residential',
    coordinates: [11.31520, 77.54960],
    floorsCount: 4,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000017',
    name: 'Emerald Hostel (Junior Boys Residence)',
    code: 'EHSTL',
    description: 'Modern residential hostel wing for first & second year boys, 24/7 security warden surveillance, study rooms and sports court.',
    facility_type: 'residential',
    coordinates: [11.31550, 77.54930],
    floorsCount: 4,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000018',
    name: 'Ruby & Pearl Hostels (Women Residence Enclave)',
    code: 'WHSTL',
    description: 'Secure on-campus residential enclave for women engineering students, dining hall, indoor games, solar water and reading rooms.',
    facility_type: 'residential',
    coordinates: [11.31340, 77.54970],
    floorsCount: 4,
  },
];

// Campus Facilities & Key Points of Interest
const CAMPUS_FACILITIES = [
  {
    id: 'fac-gate',
    name: 'Main Entrance Arch & Security Gatehouse',
    code: 'GATE',
    category: 'Security & Access',
    coordinates: [11.31280, 77.55060],
    buildingId: null,
    is_accessible: true,
  },
  {
    id: 'fac-bus',
    name: 'Campus Bus Fleet Terminal & EV Charging Hub',
    code: 'BUS',
    category: 'Transport',
    coordinates: [11.31300, 77.55020],
    buildingId: null,
    is_accessible: true,
  },
  {
    id: 'fac-med',
    name: 'ESEC 24/7 Health Clinic & Emergency Post',
    code: 'MED',
    category: 'Medical',
    coordinates: [11.31390, 77.55050],
    buildingId: 'b1000000-0000-0000-0000-000000000001',
    is_accessible: true,
  },
  {
    id: 'fac-tmpl',
    name: 'Campus Sri Vinayagar Temple',
    code: 'TMPL',
    category: 'Heritage',
    coordinates: [11.31320, 77.55060],
    buildingId: null,
    is_accessible: true,
  },
  {
    id: 'fac-coop',
    name: 'ESEC Cooperative Store & Stationery Depot',
    code: 'COOP',
    category: 'Service',
    coordinates: [11.31420, 77.55020],
    buildingId: 'b1000000-0000-0000-0000-000000000009',
    is_accessible: true,
  },
  {
    id: 'fac-can',
    name: 'Cafeteria CampusCoins Voucher Counter',
    code: 'COIN',
    category: 'Dining',
    coordinates: [11.31440, 77.55040],
    buildingId: 'b1000000-0000-0000-0000-000000000009',
    is_accessible: true,
  },
  {
    id: 'fac-print',
    name: 'Central Reprographics & Digital Printing',
    code: 'PRNT',
    category: 'Service',
    coordinates: [11.31430, 77.55160],
    buildingId: 'b1000000-0000-0000-0000-000000000004',
    is_accessible: true,
  },
  {
    id: 'fac-idea',
    name: 'AICTE IDEA Lab & Central Prototyping Hub',
    code: 'IDEA',
    category: 'Innovation',
    coordinates: [11.31485, 77.55180],
    buildingId: 'b1000000-0000-0000-0000-000000000013',
    is_accessible: true,
  },
  {
    id: 'fac-iif',
    name: 'ESEC Innovation & Incubation Foundation',
    code: 'IIF',
    category: 'Innovation',
    coordinates: [11.31495, 77.55220],
    buildingId: 'b1000000-0000-0000-0000-000000000014',
    is_accessible: true,
  },
  {
    id: 'fac-atm',
    name: 'On-Campus Bank ATM & Financial Kiosk',
    code: 'ATM',
    category: 'Service',
    coordinates: [11.31410, 77.55100],
    buildingId: 'b1000000-0000-0000-0000-000000000001',
    is_accessible: true,
  },
  {
    id: 'fac-gym',
    name: 'Indoor Fitness Center & Gymnasium',
    code: 'GYM',
    category: 'Sports',
    coordinates: [11.31560, 77.55060],
    buildingId: 'b1000000-0000-0000-0000-000000000011',
    is_accessible: true,
  },
  {
    id: 'fac-solar',
    name: 'Solar Energy Park & Green Power Generation',
    code: 'SOLAR',
    category: 'Utilities',
    coordinates: [11.31580, 77.55170],
    buildingId: null,
    is_accessible: true,
  },
];

// Campus Pathway Route Graph (Nodes and weighted edges for navigation)
const ROUTE_GRAPH = {
  nodes: {
    'GATE': { name: 'Main Entrance Arch (Thudupathi Rd)', coords: [11.31280, 77.55060] },
    'BUS': { name: 'Bus Depot & EV Parking Terminal', coords: [11.31300, 77.55020] },
    'TMPL': { name: 'Campus Sri Vinayagar Temple', coords: [11.31320, 77.55060] },
    'WHSTL': { name: 'Ruby & Pearl Hostels (Women)', coords: [11.31340, 77.54970] },
    'MED': { name: 'Health Centre & Emergency Post', coords: [11.31390, 77.55050] },
    'ADMIN': { name: 'Main Academic & Administrative Secretariat', coords: [11.31410, 77.55100] },
    'AUD': { name: 'ESEC Convention Auditorium', coords: [11.31350, 77.55110] },
    'SHB': { name: 'Science & Humanities Block', coords: [11.31380, 77.55130] },
    'MBAB': { name: 'Management Studies (MBA) Block', coords: [11.31390, 77.55180] },
    'CAN': { name: 'Central Food Court & Canteen', coords: [11.31440, 77.55040] },
    'COOP': { name: 'Cooperative Store & Stationery', coords: [11.31420, 77.55020] },
    'DHSTL': { name: 'Diamond Hostel (Senior Boys)', coords: [11.31520, 77.54960] },
    'EHSTL': { name: 'Emerald Hostel (Junior Boys)', coords: [11.31550, 77.54930] },
    'CSE': { name: 'CSE, IT & AI Block', coords: [11.31460, 77.55150] },
    'LIB': { name: 'Central Library & Digital Commons', coords: [11.31430, 77.55160] },
    'IDEA': { name: 'AICTE IDEA Lab & Prototyping Hub', coords: [11.31485, 77.55180] },
    'IIF': { name: 'ESEC Innovation & Incubation Foundation', coords: [11.31495, 77.55220] },
    'ECE': { name: 'ECE & EIE Block', coords: [11.31470, 77.55080] },
    'MECH': { name: 'Mechanical & Robotics Center', coords: [11.31510, 77.55110] },
    'CIVIL': { name: 'Civil & Agri Engineering Block', coords: [11.31490, 77.55260] },
    'EEE': { name: 'EEE & Chemical Block', coords: [11.31420, 77.55210] },
    'BME': { name: 'Biomedical & Biotech Block', coords: [11.31440, 77.55240] },
    'SPRT': { name: 'Sports Arena & Athletic Ground', coords: [11.31560, 77.55060] },
    'SOLAR': { name: 'Solar Park & RO Water Plant', coords: [11.31580, 77.55170] },
  },
  edges: [
    { from: 'GATE', to: 'BUS', distance: 45, accessible: true },
    { from: 'GATE', to: 'TMPL', distance: 45, accessible: true },
    { from: 'GATE', to: 'AUD', distance: 80, accessible: true },
    { from: 'BUS', to: 'WHSTL', distance: 65, accessible: true },
    { from: 'BUS', to: 'MED', distance: 70, accessible: true },
    { from: 'TMPL', to: 'ADMIN', distance: 75, accessible: true },
    { from: 'ADMIN', to: 'MED', distance: 40, accessible: true },
    { from: 'ADMIN', to: 'CAN', distance: 60, accessible: true },
    { from: 'CAN', to: 'COOP', distance: 30, accessible: true },
    { from: 'CAN', to: 'DHSTL', distance: 95, accessible: true },
    { from: 'DHSTL', to: 'EHSTL', distance: 40, accessible: true },
    { from: 'ADMIN', to: 'CSE', distance: 65, accessible: true },
    { from: 'ADMIN', to: 'LIB', distance: 60, accessible: true },
    { from: 'AUD', to: 'SHB', distance: 40, accessible: true },
    { from: 'SHB', to: 'MBAB', distance: 45, accessible: true },
    { from: 'SHB', to: 'LIB', distance: 45, accessible: true },
    { from: 'LIB', to: 'CSE', distance: 40, accessible: true },
    { from: 'CSE', to: 'IDEA', distance: 35, accessible: true },
    { from: 'IDEA', to: 'IIF', distance: 35, accessible: true },
    { from: 'LIB', to: 'EEE', distance: 45, accessible: true },
    { from: 'EEE', to: 'BME', distance: 35, accessible: true },
    { from: 'BME', to: 'CIVIL', distance: 45, accessible: true },
    { from: 'CSE', to: 'ECE', distance: 50, accessible: true },
    { from: 'ECE', to: 'MECH', distance: 55, accessible: true },
    { from: 'MECH', to: 'IDEA', distance: 60, accessible: true },
    { from: 'MECH', to: 'SPRT', distance: 75, accessible: true },
    { from: 'ECE', to: 'SPRT', distance: 85, accessible: true },
    { from: 'DHSTL', to: 'SPRT', distance: 90, accessible: true },
    { from: 'IDEA', to: 'SOLAR', distance: 80, accessible: true },
  ]
};

// Map building IDs or facility codes to route graph node keys
const LOCATION_NODE_MAP = {
  'b1000000-0000-0000-0000-000000000001': 'ADMIN',
  'b1000000-0000-0000-0000-000000000002': 'CSE',
  'b1000000-0000-0000-0000-000000000003': 'SHB',
  'b1000000-0000-0000-0000-000000000004': 'LIB',
  'b1000000-0000-0000-0000-000000000005': 'ECE',
  'b1000000-0000-0000-0000-000000000006': 'MECH',
  'b1000000-0000-0000-0000-000000000007': 'CIVIL',
  'b1000000-0000-0000-0000-000000000008': 'EEE',
  'b1000000-0000-0000-0000-000000000009': 'CAN',
  'b1000000-0000-0000-0000-000000000010': 'AUD',
  'b1000000-0000-0000-0000-000000000011': 'SPRT',
  'b1000000-0000-0000-0000-000000000012': 'DHSTL',
  'b1000000-0000-0000-0000-000000000013': 'IDEA',
  'b1000000-0000-0000-0000-000000000014': 'IIF',
  'b1000000-0000-0000-0000-000000000015': 'BME',
  'b1000000-0000-0000-0000-000000000016': 'MBAB',
  'b1000000-0000-0000-0000-000000000017': 'EHSTL',
  'b1000000-0000-0000-0000-000000000018': 'WHSTL',
  'fac-gate': 'GATE',
  'fac-bus': 'BUS',
  'fac-med': 'MED',
  'fac-tmpl': 'TMPL',
  'fac-coop': 'COOP',
  'fac-can': 'CAN',
  'fac-print': 'LIB',
  'fac-idea': 'IDEA',
  'fac-iif': 'IIF',
  'fac-atm': 'ADMIN',
  'fac-gym': 'SPRT',
  'fac-solar': 'SOLAR',
};

/**
 * Resolve arbitrary location ID to graph node
 */
function resolveNodeKey(key) {
  if (!key) return null;
  if (ROUTE_GRAPH.nodes[key]) return key;
  if (LOCATION_NODE_MAP[key]) return LOCATION_NODE_MAP[key];
  const upper = key.toUpperCase();
  if (ROUTE_GRAPH.nodes[upper]) return upper;
  return 'ADMIN'; // Fallback to central admin block
}

/**
 * Dijkstra's shortest path algorithm
 */
function findShortestPath(startParam, endParam, requireAccessible = false) {
  const nodes = ROUTE_GRAPH.nodes;
  const startNode = resolveNodeKey(startParam);
  const endNode = resolveNodeKey(endParam);

  if (!nodes[startNode] || !nodes[endNode]) {
    return { found: false, message: 'Invalid start or destination location.' };
  }

  const edges = ROUTE_GRAPH.edges.filter((e) => !requireAccessible || e.accessible);

  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(nodes));

  for (const node of Object.keys(nodes)) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[startNode] = 0;

  while (unvisited.size > 0) {
    let closestNode = null;
    let shortestDist = Infinity;
    for (const node of unvisited) {
      if (distances[node] < shortestDist) {
        shortestDist = distances[node];
        closestNode = node;
      }
    }

    if (!closestNode || closestNode === endNode || shortestDist === Infinity) {
      break;
    }

    unvisited.delete(closestNode);

    // Neighboring edges
    const neighbors = edges.filter((e) => e.from === closestNode || e.to === closestNode);
    for (const edge of neighbors) {
      const neighbor = edge.from === closestNode ? edge.to : edge.from;
      if (unvisited.has(neighbor)) {
        const alt = distances[closestNode] + edge.distance;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = closestNode;
        }
      }
    }
  }

  // Reconstruct path
  const path = [];
  let curr = endNode;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  if (path[0] !== startNode) {
    return { found: false, message: 'No accessible path found between selected locations.' };
  }

  const coordinates = path.map((nodeKey) => nodes[nodeKey].coords);
  const steps = path.map((nodeKey, idx) => ({
    step: idx + 1,
    location: nodes[nodeKey].name,
    coords: nodes[nodeKey].coords,
  }));

  const totalDist = distances[endNode];
  const minutes = Math.max(1, Math.round(totalDist / 75));

  return {
    found: true,
    distanceMeters: totalDist,
    totalDistanceMeters: totalDist,
    walkingMinutes: minutes,
    estimatedWalkMinutes: minutes,
    accessibleOnly: requireAccessible,
    path,
    routePath: path.map((k) => nodes[k].name),
    pathCoordinates: coordinates,
    coordinates,
    steps,
  };
}

/**
 * Get map data with active complaints plotted as markers
 */
async function getCampusMapData() {
  const complaintService = require('./complaintService');
  const allResult = await complaintService.getAdminComplaints({ limit: 100 });
  const complaints = allResult?.data || [];

  // Plot complaints onto map using real ESEC building coordinates
  const complaintMarkers = complaints
    .filter((c) => !['resolved', 'verified', 'rejected'].includes(c.status))
    .map((c) => {
      let coords = [11.31345, 77.55015];
      const building = CAMPUS_BUILDINGS.find((b) => b.id === c.building_id);
      if (building) {
        // Subtle offset based on ticket hash so multiple markers don't overlap completely
        const offsetLat = ((c.id.charCodeAt(0) % 7) - 3) * 0.00008;
        const offsetLng = ((c.id.charCodeAt(1) % 7) - 3) * 0.00008;
        coords = [building.coordinates[0] + offsetLat, building.coordinates[1] + offsetLng];
      }

      return {
        id: c.id,
        tracking_code: c.tracking_code,
        title: c.title,
        category: c.category,
        priority: c.priority,
        status: c.status,
        coordinates: coords,
        buildingName: building?.name || c.general_location || 'ESEC Campus Facility',
        created_at: c.created_at,
      };
    });

  return {
    metadata: CAMPUS_METADATA,
    buildings: CAMPUS_BUILDINGS,
    facilities: CAMPUS_FACILITIES,
    routeNodes: ROUTE_GRAPH.nodes,
    complaintMarkers,
  };
}

module.exports = {
  CAMPUS_METADATA,
  CAMPUS_BUILDINGS,
  CAMPUS_FACILITIES,
  ROUTE_GRAPH,
  getCampusMapData,
  findShortestPath,
};
