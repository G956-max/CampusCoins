const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Helper to make HTTP requests
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body && typeof body === 'object') {
      req.write(JSON.stringify(body));
    } else if (body) {
      req.write(body);
    }
    req.end();
  });
}

// Multipart helper for evidence upload test
function uploadFileRequest(path, filename, buffer, mimeType, headers = {}) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const url = new URL(path, BASE_URL);

    const postDataStart = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`
    );
    const postDataEnd = Buffer.from(`\r\n--${boundary}--\r\n`);
    const totalLength = postDataStart.length + buffer.length + postDataEnd.length;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalLength,
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postDataStart);
    req.write(buffer);
    req.write(postDataEnd);
    req.end();
  });
}

// Headers for mock actors
const STUDENT_HEADERS = { 'x-mock-role': 'student' };
const OTHER_STUDENT_HEADERS = { 'x-mock-role': 'student', 'x-mock-user-id': 'other-student-999' };
const ADMIN_HEADERS = { 'x-mock-role': 'admin' };
const STAFF_HEADERS = { 'x-mock-role': 'staff', 'x-mock-user-id': 'mock-staff-id' };
const OTHER_STAFF_HEADERS = { 'x-mock-role': 'staff', 'x-mock-user-id': 'unassigned-staff-999' };

let passed = 0;
let failed = 0;

function assert(condition, message, extra = null) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    if (extra) {
      console.error(`         Status: ${extra.status}, Body: ${JSON.stringify(extra.body)}`);
    }
    failed++;
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log('  RUNNING PHASE 3 COMPLAINT LIFECYCLE TEST SUITE');
  console.log('==================================================\n');

  let complaintId = null;
  let rejectedComplaintId = null;
  let reopenComplaintId = null;

  // ----------------------------------------------------
  // TEST 1: Validation & Creation
  // ----------------------------------------------------
  console.log('--- Suite 1: Student Submission & Validation ---');

  // Case 2: Missing title
  const resMissingTitle = await request('POST', '/api/complaints', {
    category: 'Electrical',
    priority: 'medium',
    description: 'This is a test description longer than twenty characters.',
    general_location: 'Main Block Corridor',
  }, STUDENT_HEADERS);
  assert(resMissingTitle.status === 400, 'Student creates complaint with missing title -> 400 Bad Request');

  // Case 3: Invalid category
  const resInvalidCategory = await request('POST', '/api/complaints', {
    title: 'Broken Light Switch',
    category: 'NuclearPhysics',
    priority: 'medium',
    description: 'This is a test description longer than twenty characters.',
    general_location: 'Main Block Corridor',
  }, STUDENT_HEADERS);
  assert(resInvalidCategory.status === 400, 'Student creates complaint with invalid category -> 400 Bad Request');

  // Case 4: Invalid priority
  const resInvalidPriority = await request('POST', '/api/complaints', {
    title: 'Broken Light Switch',
    category: 'Electrical',
    priority: 'ultra-mega-urgent',
    description: 'This is a test description longer than twenty characters.',
    general_location: 'Main Block Corridor',
  }, STUDENT_HEADERS);
  assert(resInvalidPriority.status === 400, 'Student creates complaint with invalid priority -> 400 Bad Request');

  // Case 5: Description too short (< 20 chars)
  const resShortDesc = await request('POST', '/api/complaints', {
    title: 'Broken Light Switch',
    category: 'Electrical',
    priority: 'medium',
    description: 'Too short',
    general_location: 'Main Block Corridor',
  }, STUDENT_HEADERS);
  assert(resShortDesc.status === 400, 'Student creates complaint with short description (<20) -> 400 Bad Request');

  // Case 1: Valid creation (with general location)
  const resValid1 = await request('POST', '/api/complaints', {
    title: 'Flickering ceiling tube light in seminar room',
    category: 'Electrical',
    priority: 'medium',
    description: 'The tube light constantly flickers during classes causing severe distraction.',
    general_location: 'Seminar Hall 3 near auditorium',
  }, STUDENT_HEADERS);
  assert(resValid1.status === 201 && resValid1.body?.data?.id && resValid1.body?.data?.tracking_code,
    'Student creates complaint with valid payload -> 201 Created with tracking code');
  complaintId = resValid1.body?.data?.id;

  // Case 6: Valid creation with structured location (building + floor + room)
  const buildingsRes = await request('GET', '/api/locations/buildings');
  const bId = buildingsRes.body?.data?.[0]?.id;
  const floorsRes = await request('GET', `/api/locations/floors?buildingId=${bId}`);
  const fId = floorsRes.body?.data?.[0]?.id;
  const roomsRes = await request('GET', `/api/locations/rooms?floorId=${fId}`);
  const rId = roomsRes.body?.data?.[0]?.id;

  const resValid2 = await request('POST', '/api/complaints', {
    title: 'Leaking water tap in washroom corner sink',
    category: 'Plumbing',
    priority: 'high',
    description: 'Continuous heavy water leakage from the washbasin faucet pipe.',
    building_id: bId,
    floor_id: fId,
    room_id: rId,
  }, STUDENT_HEADERS);
  assert(resValid2.status === 201 && resValid2.body?.data?.building_id === bId,
    'Student creates complaint with structured location (building+floor+room) -> 201 Created', resValid2);
  rejectedComplaintId = resValid2.body?.data?.id;

  // Case 7: Another complaint for reopen testing
  const resValid3 = await request('POST', '/api/complaints', {
    title: 'AC unit blowing hot air in computer lab',
    category: 'Classroom',
    priority: 'high',
    description: 'Air conditioner in computer lab 2 is making grinding noise and blowing room temperature air.',
    general_location: 'CS Lab 2',
  }, STUDENT_HEADERS);
  reopenComplaintId = resValid3.body?.data?.id;

  // Case 8: Student uploads image evidence
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const resEvidence = await uploadFileRequest(
    `/api/complaints/${complaintId}/evidence`,
    'broken_light.png',
    samplePngBuffer,
    'image/png',
    STUDENT_HEADERS
  );
  assert(resEvidence.status === 201 && resEvidence.body?.data?.file_url,
    'Student uploads image evidence -> 201 Created with file URL', resEvidence);

  // ----------------------------------------------------
  // TEST 2: Admin Operations & Rejection
  // ----------------------------------------------------
  console.log('\n--- Suite 2: Admin Review, Rejection & Triage ---');

  // Case 9: Admin views all complaints
  const resAdminList = await request('GET', '/api/admin/complaints', null, ADMIN_HEADERS);
  assert(resAdminList.status === 200 && Array.isArray(resAdminList.body?.data),
    'Admin views all complaints -> 200 OK with list', resAdminList);

  // Case 10: Admin filters complaints by status
  const resFilter = await request('GET', '/api/admin/complaints?status=submitted', null, ADMIN_HEADERS);
  const allSubmitted = resFilter.body?.data?.every(c => c.status === 'submitted');
  assert(resFilter.status === 200 && allSubmitted,
    'Admin filters complaints by status=submitted -> 200 OK with filtered results', resFilter);

  // Case 11: Admin updates complaint priority
  const resPriority = await request('PATCH', `/api/admin/complaints/${complaintId}/priority`, {
    priority: 'critical',
  }, ADMIN_HEADERS);
  assert(resPriority.status === 200 && resPriority.body?.data?.priority === 'critical',
    'Admin updates complaint priority -> 200 OK, priority set to critical', resPriority);

  // Case 14: Admin rejects complaint without reason -> 400 Bad Request
  const resRejectNoReason = await request('POST', `/api/admin/complaints/${rejectedComplaintId}/reject`, {
    rejection_reason: '',
  }, ADMIN_HEADERS);
  assert(resRejectNoReason.status === 400,
    'Admin rejects complaint without reason -> 400 Bad Request', resRejectNoReason);

  // Case 13: Admin rejects complaint with reason -> 200 OK
  const resRejectWithReason = await request('POST', `/api/admin/complaints/${rejectedComplaintId}/reject`, {
    rejection_reason: 'Duplicate complaint already logged under ticket #4812.',
  }, ADMIN_HEADERS);
  assert(resRejectWithReason.status === 200 && resRejectWithReason.body?.data?.status === 'rejected',
    'Admin rejects complaint with reason -> 200 OK, status changes to rejected', resRejectWithReason);

  // Case 12: Admin assigns complaint to staff
  const resAssign = await request('POST', `/api/admin/complaints/${complaintId}/assign`, {
    staff_id: 'mock-staff-id',
    notes: 'Please inspect the junction box immediately.',
  }, ADMIN_HEADERS);
  assert(resAssign.status === 200 && resAssign.body?.data?.status === 'assigned',
    'Admin assigns complaint to staff -> 200 OK, status changes to assigned', resAssign);

  // Assign reopenComplaintId as well
  await request('POST', `/api/admin/complaints/${reopenComplaintId}/assign`, {
    staff_id: 'mock-staff-id',
  }, ADMIN_HEADERS);

  // ----------------------------------------------------
  // TEST 3: Staff Lifecycle (Start Work, Updates, Resolve)
  // ----------------------------------------------------
  console.log('\n--- Suite 3: Staff Workflow (In Progress, Progress Update, Resolve) ---');

  // Case 15: Staff views assigned complaints
  const resStaffComplaints = await request('GET', '/api/staff/complaints', null, STAFF_HEADERS);
  const onlyAssignedToStaff = resStaffComplaints.body?.data?.every(c =>
    c.assigned_to === 'mock-staff-id' || c.assigned_staff_id === 'mock-staff-id'
  );
  assert(resStaffComplaints.status === 200 && onlyAssignedToStaff,
    'Staff views assigned complaints -> 200 OK, only complaints assigned to that staff', resStaffComplaints);

  // Case 16: Staff starts work (status -> in_progress)
  const resStartWork = await request('POST', `/api/staff/complaints/${complaintId}/start`, null, STAFF_HEADERS);
  assert(resStartWork.status === 200 && resStartWork.body?.data?.status === 'in_progress',
    'Staff updates status to in_progress -> 200 OK', resStartWork);

  // Staff adds progress note
  const resProgressNote = await request('POST', `/api/staff/complaints/${complaintId}/update`, {
    comment: 'Electrician on site with replacement LED bulb and ballast.',
  }, STAFF_HEADERS);
  assert([200, 201].includes(resProgressNote.status), 'Staff adds progress update comment -> 200/201 OK', resProgressNote);

  // Case 18: Staff updates status to resolved without comment -> 400 Bad Request
  const resResolveNoComment = await request('POST', `/api/staff/complaints/${complaintId}/resolve`, {
    resolution_comment: '',
  }, STAFF_HEADERS);
  assert(resResolveNoComment.status === 400,
    'Staff updates status to resolved without comment -> 400 Bad Request');

  // Case 17: Staff updates status to resolved with comment -> 200 OK
  const resResolveWithComment = await request('POST', `/api/staff/complaints/${complaintId}/resolve`, {
    resolution_comment: 'Replaced flickering tube light with brand new Phillips LED panel. Tested working properly.',
  }, STAFF_HEADERS);
  assert(resResolveWithComment.status === 200 && resResolveWithComment.body?.data?.status === 'resolved',
    'Staff updates status to resolved with comment -> 200 OK');

  // ----------------------------------------------------
  // TEST 4: Student Verification & Reopening
  // ----------------------------------------------------
  console.log('\n--- Suite 4: Student Verification & Reopen Workflow ---');

  // Case 19: Student verifies resolution -> 200 OK, status -> verified
  const resVerify = await request('POST', `/api/complaints/${complaintId}/verify`, null, STUDENT_HEADERS);
  assert(resVerify.status === 200 && resVerify.body?.data?.status === 'verified',
    'Student verifies resolution -> 200 OK, status changes to verified');

  // Advance reopenComplaintId to resolved first
  await request('POST', `/api/staff/complaints/${reopenComplaintId}/start`, null, STAFF_HEADERS);
  await request('POST', `/api/staff/complaints/${reopenComplaintId}/resolve`, {
    resolution_comment: 'Adjusted thermostat settings.',
  }, STAFF_HEADERS);

  // Case 21: Student reopens complaint without reason -> 400 Bad Request
  const resReopenNoReason = await request('POST', `/api/complaints/${reopenComplaintId}/reopen`, {
    reopen_reason: '',
  }, STUDENT_HEADERS);
  assert(resReopenNoReason.status === 400,
    'Student reopens complaint without reason -> 400 Bad Request');

  // Case 20: Student reopens complaint with reason -> 200 OK, status -> reopened
  const resReopenWithReason = await request('POST', `/api/complaints/${reopenComplaintId}/reopen`, {
    reopen_reason: 'AC is still blowing warm air and the temperature in lab is 32C.',
  }, STUDENT_HEADERS);
  assert(resReopenWithReason.status === 200 && resReopenWithReason.body?.data?.status === 'reopened',
    'Student reopens complaint with reason -> 200 OK, status changes to reopened');

  // ----------------------------------------------------
  // TEST 5: Security, IDOR Prevention & State Machine
  // ----------------------------------------------------
  console.log('\n--- Suite 5: Security, Authorization & State Transitions ---');

  // Case 22: Student attempts to view another student's complaint -> 403 Forbidden or 404 Not Found
  const resStudentIDOR = await request('GET', `/api/complaints/${complaintId}`, null, OTHER_STUDENT_HEADERS);
  assert([403, 404].includes(resStudentIDOR.status),
    'Student attempts to view another student\'s complaint -> 403/404 Forbidden/Not Found');

  // Case 23: Staff attempts to update complaint not assigned to them -> 403 Forbidden or 404 Not Found
  const resStaffIDOR = await request('POST', `/api/staff/complaints/${complaintId}/start`, null, OTHER_STAFF_HEADERS);
  assert([403, 404].includes(resStaffIDOR.status),
    'Staff attempts to update complaint not assigned to them -> 403/404 Forbidden/Not Found');

  // Case 24: Invalid status transition (submitted -> resolved directly) -> 400 Bad Request
  const resInvalidSubmit = await request('POST', '/api/complaints', {
    title: 'Broken chair in room 201',
    category: 'Furniture',
    priority: 'low',
    description: 'The front leg of the wooden chair is broken and dangerous to sit on.',
    general_location: 'Room 201',
  }, STUDENT_HEADERS);
  const newComplaintId = resInvalidSubmit.body?.data?.id;

  const resInvalidTransition = await request('POST', `/api/staff/complaints/${newComplaintId}/resolve`, {
    resolution_comment: 'Cannot resolve directly from submitted.',
  }, STAFF_HEADERS);
  assert([400, 403, 404].includes(resInvalidTransition.status),
    'Invalid transition (submitted -> resolved directly) -> 400/403 Rejected');

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error running test suite:', err);
  process.exit(1);
});
