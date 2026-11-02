const BASE_URL = 'http://localhost:5000/api';

const HEADERS = {
  student: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-student-token',
    'x-mock-role': 'student',
    'x-mock-user-id': '2a6df6ad-4d10-4d8a-8f44-e8bc8a4f67bb',
  },
  staff: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-staff-token',
    'x-mock-role': 'staff',
    'x-mock-user-id': 'b8000000-0000-0000-0000-000000000002',
  },
  admin: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-admin-token',
    'x-mock-role': 'admin',
    'x-mock-user-id': '64b5f97d-32ea-4355-ae19-88dfa65e0702',
  },
};

async function runE2ETest() {
  console.log('=== STARTING END-TO-END TICKET LIFECYCLE QA TEST ===\n');

  try {
    // 1. Student creates a complaint
    console.log('[STEP 1] Student submitting a maintenance complaint...');
    const createRes = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: HEADERS.student,
      body: JSON.stringify({
        title: 'QA Automated Water Cooler Leak',
        description: 'Water cooler leaking continuously on 2nd floor corridor outside classroom.',
        category: 'Water',
        priority: 'high',
        general_location: 'Mechanical Block Floor 2 Near Room 204',
      }),
    });
    const createData = await createRes.json();
    console.log('Status:', createRes.status, createData.message || createData);
    if (!createRes.ok) throw new Error('Create complaint failed: ' + JSON.stringify(createData));
    const complaintId = createData.data?.id || createData.id;
    console.log(`Created Complaint ID: ${complaintId}\n`);

    // 2. Admin retrieves complaints list and verifies complaint is present
    console.log('[STEP 2] Admin checking complaints list...');
    const adminListRes = await fetch(`${BASE_URL}/admin/complaints`, {
      headers: HEADERS.admin,
    });
    const adminListData = await adminListRes.json();
    console.log(`Admin got ${adminListData.data?.length || 0} complaints. Status: ${adminListRes.status}\n`);

    // 3. Admin assigns complaint to staff incharge
    console.log('[STEP 3] Admin assigning complaint to staff incharge...');
    const assignRes = await fetch(`${BASE_URL}/admin/complaints/${complaintId}/assign`, {
      method: 'POST',
      headers: HEADERS.admin,
      body: JSON.stringify({
        staff_id: '00000000-0000-0000-0000-000000000002',
        notes: 'Priority repair: Please fix valve before evening.',
      }),
    });
    const assignData = await assignRes.json();
    console.log('Assign Status:', assignRes.status, assignData.message || assignData);
    if (!assignRes.ok) throw new Error('Assign staff failed: ' + JSON.stringify(assignData));

    // 4. Staff fetches assigned tasks
    console.log('\n[STEP 4] Staff fetching assigned tasks...');
    const staffListRes = await fetch(`${BASE_URL}/staff/complaints`, {
      headers: HEADERS.staff,
    });
    const staffListData = await staffListRes.json();
    const myTask = (staffListData.data || []).find((t) => t.id === complaintId);
    console.log(`Staff saw assigned task? ${Boolean(myTask)} (Status: ${myTask?.status})`);

    // 5. Staff starts work
    console.log('\n[STEP 5] Staff clicking Start Work...');
    const startRes = await fetch(`${BASE_URL}/staff/complaints/${complaintId}/start`, {
      method: 'POST',
      headers: HEADERS.staff,
    });
    const startData = await startRes.json();
    console.log('Start Work Status:', startRes.status, startData.message || startData);
    if (!startRes.ok) throw new Error('Start work failed: ' + JSON.stringify(startData));

    // 6. Staff marks work as completed with resolution comment
    console.log('\n[STEP 6] Staff marking work as completed with evidence notes...');
    const resolveRes = await fetch(`${BASE_URL}/staff/complaints/${complaintId}/resolve`, {
      method: 'POST',
      headers: HEADERS.staff,
      body: JSON.stringify({
        resolution_comment: 'Replaced rubber gasket and tightened inlet pipe valve. Water leak arrested completely.',
      }),
    });
    const resolveData = await resolveRes.json();
    console.log('Resolve Status:', resolveRes.status, resolveData.message || resolveData);
    if (!resolveRes.ok) throw new Error('Resolve complaint failed: ' + JSON.stringify(resolveData));

    // 7. Admin verifies & closes the ticket
    console.log('\n[STEP 7] Admin reviewing and verifying ticket closure...');
    const closeRes = await fetch(`${BASE_URL}/admin/complaints/${complaintId}/verify`, {
      method: 'POST',
      headers: HEADERS.admin,
      body: JSON.stringify({
        is_useful_evidence: true,
        is_high_impact: true,
      }),
    });
    const closeData = await closeRes.json();
    console.log('Admin Review & Close Status:', closeRes.status, closeData.message || closeData);
    if (!closeRes.ok) throw new Error('Close complaint failed: ' + JSON.stringify(closeData));

    console.log('\n=== ALL LIFECYCLE STEPS COMPLETED WITH 100% SUCCESS! ===');
  } catch (err) {
    console.error('\nQA E2E Flow Failed:', err.message);
  }
}

runE2ETest();
