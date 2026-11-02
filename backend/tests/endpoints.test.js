const BASE_URL = 'http://localhost:5000/api';

const headers = {
  admin: {
    Authorization: 'Bearer mock-admin-token',
    'x-mock-role': 'admin',
    'x-mock-user-id': 'mock-admin-id',
    'Content-Type': 'application/json',
  },
  staff: {
    Authorization: 'Bearer mock-staff-token',
    'x-mock-role': 'staff',
    'x-mock-user-id': 'mock-staff-id',
    'Content-Type': 'application/json',
  },
  student: {
    Authorization: 'Bearer mock-student-token',
    'x-mock-role': 'student',
    'x-mock-user-id': 'mock-student-id',
    'Content-Type': 'application/json',
  },
};

const results = [];

async function testEndpoint(name, method, url, role = 'student', body = null) {
  const start = Date.now();
  try {
    const opts = {
      method,
      headers: headers[role] || {},
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${url}`, opts);
    const duration = Date.now() - start;
    let json = null;
    try {
      json = await res.json();
    } catch (_) {}

    if (res.ok) {
      results.push({ name, method, url, role, status: res.status, ok: true, duration });
      console.log(`[PASS] ${method} ${url} (${role}) -> ${res.status} [${duration}ms]`);
      return json;
    } else {
      const msg = json?.message || res.statusText;
      results.push({ name, method, url, role, status: res.status, ok: false, error: msg, duration });
      console.log(`[FAIL] ${method} ${url} (${role}) -> ${res.status}: ${msg} [${duration}ms]`);
      return null;
    }
  } catch (err) {
    const duration = Date.now() - start;
    results.push({ name, method, url, role, status: 'ERR', ok: false, error: err.message, duration });
    console.log(`[ERR]  ${method} ${url} (${role}) -> ${err.message} [${duration}ms]`);
    return null;
  }
}

async function runTests() {
  console.log('=== STARTING SENIOR QA AUTOMATED ENDPOINT TESTING ===\n');

  // 1. Core Health & Locations
  await testEndpoint('Health Check', 'GET', '/health', 'student');
  await testEndpoint('Get Locations / Buildings', 'GET', '/locations', 'student');
  await testEndpoint('Get Buildings List', 'GET', '/locations/buildings', 'student');

  // 2. Student Complaints
  const complaints = await testEndpoint('List Student Complaints', 'GET', '/complaints', 'student');
  
  // 3. Admin Complaints & Analytics
  const adminComplaints = await testEndpoint('List Admin Complaints', 'GET', '/admin/complaints', 'admin');
  await testEndpoint('Admin Analytics Summary', 'GET', '/admin/analytics/summary', 'admin');
  await testEndpoint('Admin SLA Overview', 'GET', '/admin/sla/overview', 'admin');

  // 4. Staff Complaints
  const staffTasks = await testEndpoint('List Staff Complaints', 'GET', '/staff/complaints', 'staff');

  // 5. Gamification - Wallet, Ledger & Balances
  await testEndpoint('Get Student Wallet', 'GET', '/wallet', 'student');
  await testEndpoint('Get Student Transactions', 'GET', '/wallet/transactions', 'student');

  // 6. Gamification - Badges, Missions, Leaderboard
  await testEndpoint('Get Available Badges', 'GET', '/badges', 'student');
  await testEndpoint('Get Student Missions', 'GET', '/missions', 'student');
  await testEndpoint('Get Campus Leaderboard', 'GET', '/leaderboard', 'student');

  // 7. Rewards & Redemptions
  await testEndpoint('List Active Store Rewards', 'GET', '/rewards', 'student');
  await testEndpoint('List Student Redemptions', 'GET', '/rewards/my-redemptions', 'student');
  await testEndpoint('Admin List All Rewards', 'GET', '/admin/rewards', 'admin');
  await testEndpoint('Admin List Redemptions', 'GET', '/admin/rewards/redemptions', 'admin');

  // 8. Notifications & Bounties
  await testEndpoint('Get Notifications', 'GET', '/notifications', 'student');
  await testEndpoint('Get Community Bounties', 'GET', '/bounties', 'student');

  console.log('\n=== TEST RUN SUMMARY ===');
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
}

runTests();
