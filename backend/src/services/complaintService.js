const { getSupabaseClient } = require('../config/supabase');
const { logAudit } = require('./auditService');
const { createNotification } = require('./notificationService');
const logger = require('../utils/logger');

// Allowed status transitions map
const ALLOWED_TRANSITIONS = {
  submitted: ['under_review', 'assigned', 'rejected'],
  under_review: ['assigned', 'rejected'],
  assigned: ['in_progress', 'rejected', 'assigned'], // reassign
  in_progress: ['resolved', 'rejected', 'assigned'],
  resolved: ['verified', 'reopened'],
  reopened: ['assigned', 'in_progress', 'under_review', 'rejected'],
  rejected: [], // Terminal
  verified: [], // Terminal / Closed
};

/**
 * Initial In-Memory Seed Data for Fallback/Preview Mode
 */
const SEED_BUILDINGS = [
  { id: 'b1000000-0000-0000-0000-000000000001', name: 'Main Academic Block', code: 'MB', description: 'Primary engineering classrooms' },
  { id: 'b1000000-0000-0000-0000-000000000002', name: 'Science & Research Block', code: 'SB', description: 'Laboratories & research' },
  { id: 'b1000000-0000-0000-0000-000000000003', name: 'Administrative Block', code: 'AB', description: 'Dean & student affairs' },
  { id: 'b1000000-0000-0000-0000-000000000004', name: 'Central Library', code: 'LB', description: 'Reference stacks & digital commons' },
];

const SEED_FLOORS = [
  { id: 'f1000000-0000-0000-0000-000000000001', building_id: 'b1000000-0000-0000-0000-000000000001', floor_number: 0, floor_name: 'Ground Floor' },
  { id: 'f1000000-0000-0000-0000-000000000002', building_id: 'b1000000-0000-0000-0000-000000000001', floor_number: 1, floor_name: 'First Floor' },
  { id: 'f1000000-0000-0000-0000-000000000003', building_id: 'b1000000-0000-0000-0000-000000000001', floor_number: 2, floor_name: 'Second Floor' },
  { id: 'f1000000-0000-0000-0000-000000000004', building_id: 'b1000000-0000-0000-0000-000000000002', floor_number: 0, floor_name: 'Ground Floor Labs' },
  { id: 'f1000000-0000-0000-0000-000000000005', building_id: 'b1000000-0000-0000-0000-000000000002', floor_number: 1, floor_name: 'First Floor Labs' },
];

const SEED_ROOMS = [
  { id: 'r1000000-0000-0000-0000-000000000001', floor_id: 'f1000000-0000-0000-0000-000000000001', room_number: 'Room 101', room_name: 'Lecture Hall 101', room_type: 'classroom' },
  { id: 'r1000000-0000-0000-0000-000000000002', floor_id: 'f1000000-0000-0000-0000-000000000001', room_number: 'Room 102', room_name: 'Lecture Hall 102', room_type: 'classroom' },
  { id: 'r1000000-0000-0000-0000-000000000004', floor_id: 'f1000000-0000-0000-0000-000000000002', room_number: 'Room 201', room_name: 'Interactive Room 201', room_type: 'classroom' },
  { id: 'r1000000-0000-0000-0000-000000000005', floor_id: 'f1000000-0000-0000-0000-000000000002', room_number: 'Room 204', room_name: 'Seminar Room 204', room_type: 'classroom' },
  { id: 'r1000000-0000-0000-0000-000000000007', floor_id: 'f1000000-0000-0000-0000-000000000004', room_number: 'CS Lab 1', room_name: 'Software Engineering Lab', room_type: 'lab' },
  { id: 'r1000000-0000-0000-0000-000000000008', floor_id: 'f1000000-0000-0000-0000-000000000004', room_number: 'CS Lab 3', room_name: 'Networks Lab', room_type: 'lab' },
];

// In-memory repositories for fallback/testing
const inMemoryComplaints = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    student_id: 'b8000000-0000-0000-0000-000000000001', // Alex Rivera
    title: 'Broken Air Conditioning in CS Lab 3',
    description: 'The split AC unit is making loud rattling noises and blowing room-temperature air during afternoon laboratory sessions.',
    category: 'Electrical',
    status: 'assigned',
    priority: 'high',
    building_id: 'b1000000-0000-0000-0000-000000000002',
    floor_id: 'f1000000-0000-0000-0000-000000000004',
    room_id: 'r1000000-0000-0000-0000-000000000008',
    assigned_staff_id: 'b8000000-0000-0000-0000-000000000002', // David Vance
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    resolved_at: null,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    student_id: 'b8000000-0000-0000-0000-000000000001',
    title: 'Water Dispenser Sensor Malfunction',
    description: 'Water dispenser on 1st floor does not stop automatically when tumbler is removed.',
    category: 'Plumbing',
    status: 'resolved',
    priority: 'medium',
    building_id: 'b1000000-0000-0000-0000-000000000001',
    floor_id: 'f1000000-0000-0000-0000-000000000002',
    room_id: null,
    assigned_staff_id: 'b8000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    resolved_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

const inMemoryEvidence = [];
const inMemoryUpdates = [
  {
    id: 'u1000000-0000-0000-0000-000000000001',
    complaint_id: 'c1000000-0000-0000-0000-000000000001',
    updated_by: 'b8000000-0000-0000-0000-000000000001',
    status: 'submitted',
    comment: 'Complaint submitted by student.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'u1000000-0000-0000-0000-000000000002',
    complaint_id: 'c1000000-0000-0000-0000-000000000001',
    updated_by: 'b8000000-0000-0000-0000-000000000003',
    status: 'under_review',
    comment: 'Complaint reviewed and verified by campus administration.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'u1000000-0000-0000-0000-000000000003',
    complaint_id: 'c1000000-0000-0000-0000-000000000001',
    updated_by: 'b8000000-0000-0000-0000-000000000003',
    status: 'assigned',
    comment: 'Assigned to technician David Vance (Campus Facilities & Maintenance).',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

const inMemoryAssignments = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    complaint_id: 'c1000000-0000-0000-0000-000000000001',
    staff_id: 'b8000000-0000-0000-0000-000000000002',
    assigned_by: 'b8000000-0000-0000-0000-000000000003',
    assigned_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    completed_at: null,
  },
];

class ComplaintService {
  /**
   * Location Helpers
   */
  async getBuildings() {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('buildings').select('*').eq('is_active', true).order('name');
        if (!error && data?.length) return data;
      } catch (err) {
        logger.warn(`Supabase getBuildings notice: ${err.message}`);
      }
    }
    return SEED_BUILDINGS;
  }

  async getFloors(buildingId) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('floors').select('*').order('floor_number');
        if (buildingId) query = query.eq('building_id', buildingId);
        const { data, error } = await query;
        if (!error && data?.length) return data;
      } catch (err) {
        logger.warn(`Supabase getFloors notice: ${err.message}`);
      }
    }
    return buildingId ? SEED_FLOORS.filter((f) => f.building_id === buildingId) : SEED_FLOORS;
  }

  async getRooms(floorId) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('rooms').select('*').eq('is_active', true).order('room_number');
        if (floorId) query = query.eq('floor_id', floorId);
        const { data, error } = await query;
        if (!error && data?.length) return data;
      } catch (err) {
        logger.warn(`Supabase getRooms notice: ${err.message}`);
      }
    }
    return floorId ? SEED_ROOMS.filter((r) => r.floor_id === floorId) : SEED_ROOMS;
  }

  /**
   * Validate state transition
   */
  validateStatusTransition(currentStatus, nextStatus) {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      const err = new Error(`Cannot transition complaint status from "${currentStatus}" to "${nextStatus}".`);
      err.statusCode = 400;
      throw err;
    }
    return true;
  }

  /**
   * Create Complaint (Student Only)
   */
  async createComplaint({ studentId, title, description, category, priority = 'medium', buildingId, floorId, roomId, generalLocation }) {
    const timestamp = new Date().toISOString();
    const id = `c${Date.now().toString(16)}-${Math.random().toString(16).substring(2, 6)}-4000-8000-${Math.random().toString(16).substring(2, 14)}`;
    const trackingCode = `CC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newComplaint = {
      id,
      tracking_code: trackingCode,
      student_id: studentId,
      title,
      description,
      category,
      status: 'submitted',
      priority: priority.toLowerCase(),
      building_id: buildingId || null,
      floor_id: floorId || null,
      room_id: roomId || null,
      general_location: generalLocation || null,
      assigned_staff_id: null,
      assigned_to: null,
      created_at: timestamp,
      updated_at: timestamp,
      resolved_at: null,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('complaints').insert(newComplaint).select().single();
        if (error) throw error;

        // Add initial timeline update
        await supabase.from('complaint_updates').insert({
          complaint_id: id,
          updated_by: studentId,
          status: 'submitted',
          comment: 'Complaint created and submitted for review.',
        });
      } catch (err) {
        logger.warn(`Supabase createComplaint notice: ${err.message}`);
      }
    }

    // In-memory record
    inMemoryComplaints.unshift(newComplaint);
    inMemoryUpdates.push({
      id: `u-${Date.now()}`,
      complaint_id: id,
      updated_by: studentId,
      status: 'submitted',
      comment: 'Complaint created and submitted for review.',
      created_at: timestamp,
    });

    await logAudit({
      userId: studentId,
      action: 'COMPLAINT_CREATED',
      entityId: id,
      metadata: { title, category, priority },
    });

    return newComplaint;
  }

  /**
   * Get single complaint with relations & verify authorization
   */
  async getComplaintById(complaintId, user) {
    let complaint = null;
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select(`
            *,
            student:profiles!student_id (id, full_name, email, student_id, phone),
            building:buildings (id, name, code),
            floor:floors (id, floor_number, floor_name),
            room:rooms (id, room_number, room_name, room_type),
            assignments:complaint_assignments (
              id, staff_id, assigned_at, completed_at,
              staff:profiles!staff_id (id, full_name, email, phone, department_id)
            ),
            updates:complaint_updates (
              id, status, comment, created_at,
              updater:profiles!updated_by (id, full_name, role)
            ),
            evidence:complaint_evidence (id, file_url, file_type, created_at)
          `)
          .eq('id', complaintId)
          .single();

        if (!error && data) {
          complaint = data;
        }
      } catch (err) {
        logger.warn(`Supabase getComplaintById notice: ${err.message}`);
      }
    }

    if (!complaint) {
      const mem = inMemoryComplaints.find((c) => c.id === complaintId);
      if (mem) {
        complaint = {
          ...mem,
          building: SEED_BUILDINGS.find((b) => b.id === mem.building_id) || null,
          floor: SEED_FLOORS.find((f) => f.id === mem.floor_id) || null,
          room: SEED_ROOMS.find((r) => r.id === mem.room_id) || null,
          updates: inMemoryUpdates.filter((u) => u.complaint_id === complaintId),
          evidence: inMemoryEvidence.filter((e) => e.complaint_id === complaintId),
          assignments: inMemoryAssignments.filter((a) => a.complaint_id === complaintId),
        };
      }
    }

    if (!complaint) {
      const err = new Error('Complaint not found.');
      err.statusCode = 404;
      throw err;
    }

    // Role-based Access Enforcement
    if (user.role === 'student' && complaint.student_id !== user.id) {
      const err = new Error('Access denied: You do not have permission to view this complaint.');
      err.statusCode = 403;
      throw err;
    }

    if (user.role === 'staff') {
      const isAssigned =
        complaint.assigned_staff_id === user.id ||
        (complaint.assignments && complaint.assignments.some((a) => a.staff_id === user.id));
      if (!isAssigned) {
        const err = new Error('Access denied: This complaint is not assigned to your account.');
        err.statusCode = 403;
        throw err;
      }
    }

    return complaint;
  }

  /**
   * List Complaints for Student (their own only)
   */
  async getStudentComplaints(studentId, { status, category, priority, search, page = 1, limit = 10 } = {}) {
    let list = inMemoryComplaints.filter((c) => c.student_id === studentId);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('complaints').select(`
          *,
          building:buildings (name, code),
          floor:floors (floor_name),
          room:rooms (room_number)
        `, { count: 'exact' }).eq('student_id', studentId).order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (category) query = query.eq('category', category);
        if (priority) query = query.eq('priority', priority);
        if (search) query = query.ilike('title', `%${search}%`);

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (!error && data) {
          return { data, total: count || data.length, page, limit };
        }
      } catch (err) {
        logger.warn(`Supabase getStudentComplaints notice: ${err.message}`);
      }
    }

    // In-memory filtering
    if (status) list = list.filter((c) => c.status === status);
    if (category) list = list.filter((c) => c.category === category);
    if (priority) list = list.filter((c) => c.priority === priority);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
    }

    const total = list.length;
    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit).map((c) => ({
      ...c,
      building: SEED_BUILDINGS.find((b) => b.id === c.building_id),
      floor: SEED_FLOORS.find((f) => f.id === c.floor_id),
      room: SEED_ROOMS.find((r) => r.id === c.room_id),
    }));

    return { data: paged, total, page, limit };
  }

  /**
   * List Complaints for Staff (assigned to them only)
   */
  async getStaffComplaints(staffId, { status, priority, category, search, page = 1, limit = 10 } = {}) {
    let list = inMemoryComplaints.filter((c) => c.assigned_staff_id === staffId);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('complaints').select(`
          *,
          building:buildings (name, code),
          floor:floors (floor_name),
          room:rooms (room_number),
          student:profiles!student_id (full_name, email)
        `, { count: 'exact' }).eq('assigned_staff_id', staffId).order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (priority) query = query.eq('priority', priority);
        if (category) query = query.eq('category', category);
        if (search) query = query.ilike('title', `%${search}%`);

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (!error && data) {
          return { data, total: count || data.length, page, limit };
        }
      } catch (err) {
        logger.warn(`Supabase getStaffComplaints notice: ${err.message}`);
      }
    }

    if (status) list = list.filter((c) => c.status === status);
    if (priority) list = list.filter((c) => c.priority === priority);
    if (category) list = list.filter((c) => c.category === category);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
    }

    const total = list.length;
    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit).map((c) => ({
      ...c,
      building: SEED_BUILDINGS.find((b) => b.id === c.building_id),
      floor: SEED_FLOORS.find((f) => f.id === c.floor_id),
      room: SEED_ROOMS.find((r) => r.id === c.room_id),
    }));

    return { data: paged, total, page, limit };
  }

  /**
   * List Complaints for Admin (all complaints with filters)
   */
  async getAdminComplaints({ status, priority, category, buildingId, assigned, search, page = 1, limit = 10 } = {}) {
    let list = [...inMemoryComplaints];

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('complaints').select(`
          *,
          building:buildings (name, code),
          floor:floors (floor_name),
          room:rooms (room_number),
          student:profiles!student_id (full_name, email)
        `, { count: 'exact' }).order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (priority) query = query.eq('priority', priority);
        if (category) query = query.eq('category', category);
        if (buildingId) query = query.eq('building_id', buildingId);
        if (assigned === 'true') query = query.not('assigned_staff_id', 'is', null);
        if (assigned === 'false') query = query.is('assigned_staff_id', null);
        if (search) query = query.ilike('title', `%${search}%`);

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (!error && data) {
          return { data, total: count || data.length, page, limit };
        }
      } catch (err) {
        logger.warn(`Supabase getAdminComplaints notice: ${err.message}`);
      }
    }

    if (status) list = list.filter((c) => c.status === status);
    if (priority) list = list.filter((c) => c.priority === priority);
    if (category) list = list.filter((c) => c.category === category);
    if (buildingId) list = list.filter((c) => c.building_id === buildingId);
    if (assigned === 'true') list = list.filter((c) => Boolean(c.assigned_staff_id));
    if (assigned === 'false') list = list.filter((c) => !c.assigned_staff_id);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
    }

    const total = list.length;
    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit).map((c) => ({
      ...c,
      building: SEED_BUILDINGS.find((b) => b.id === c.building_id),
      floor: SEED_FLOORS.find((f) => f.id === c.floor_id),
      room: SEED_ROOMS.find((r) => r.id === c.room_id),
      student: { full_name: 'Alex Rivera', email: 'alex.rivera@campus.edu' },
    }));

    return { data: paged, total, page, limit };
  }

  /**
   * Admin: Review Complaint (submitted -> under_review)
   */
  async reviewComplaint(complaintId, adminUser) {
    const complaint = await this.getComplaintById(complaintId, adminUser);
    this.validateStatusTransition(complaint.status, 'under_review');

    complaint.status = 'under_review';
    complaint.updated_at = new Date().toISOString();

    const comment = 'Complaint reviewed by campus administration.';
    await this.recordStatusTransition(complaint, 'under_review', adminUser.id, comment);

    await logAudit({
      userId: adminUser.id,
      action: 'COMPLAINT_REVIEWED',
      entityId: complaintId,
    });

    await createNotification({
      userId: complaint.student_id,
      title: 'Complaint Under Review',
      message: `Your ticket "${complaint.title}" is now under review by campus administrators.`,
    });

    return complaint;
  }

  /**
   * Admin: Reject Complaint (requires reason)
   */
  async rejectComplaint(complaintId, rejectionReason, adminUser) {
    const complaint = await this.getComplaintById(complaintId, adminUser);
    this.validateStatusTransition(complaint.status, 'rejected');

    complaint.status = 'rejected';
    complaint.rejection_reason = rejectionReason;
    complaint.updated_at = new Date().toISOString();

    const comment = `Complaint rejected: ${rejectionReason}`;
    await this.recordStatusTransition(complaint, 'rejected', adminUser.id, comment);

    await logAudit({
      userId: adminUser.id,
      action: 'COMPLAINT_REJECTED',
      entityId: complaintId,
      metadata: { reason: rejectionReason },
    });

    await createNotification({
      userId: complaint.student_id,
      title: 'Complaint Rejected',
      message: `Your ticket "${complaint.title}" was not approved: ${rejectionReason}`,
      type: 'complaint_rejected',
    });

    return complaint;
  }

  /**
   * Admin: Assign Staff Member
   */
  async assignStaff(complaintId, staffId, notes, adminUser) {
    const complaint = await this.getComplaintById(complaintId, adminUser);
    this.validateStatusTransition(complaint.status, 'assigned');

    const timestamp = new Date().toISOString();
    complaint.status = 'assigned';
    complaint.assigned_staff_id = staffId;
    complaint.assigned_to = staffId;
    complaint.updated_at = timestamp;

    const assignmentRecord = {
      id: `a-${Date.now()}`,
      complaint_id: complaintId,
      staff_id: staffId,
      assigned_by: adminUser.id,
      assigned_at: timestamp,
      completed_at: null,
    };
    inMemoryAssignments.push(assignmentRecord);

    const comment = notes
      ? `Assigned to technician with instructions: "${notes}"`
      : 'Assigned to department technician.';

    await this.recordStatusTransition(complaint, 'assigned', adminUser.id, comment);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('complaint_assignments').insert(assignmentRecord);
      } catch (err) {
        logger.warn(`Supabase assignStaff notice: ${err.message}`);
      }
    }

    await logAudit({
      userId: adminUser.id,
      action: 'COMPLAINT_ASSIGNED',
      entityId: complaintId,
      metadata: { staffId, notes },
    });

    // Notify Staff & Student
    await createNotification({
      userId: staffId,
      title: 'New Maintenance Ticket Assigned',
      message: `You have been assigned to ticket: "${complaint.title}"`,
    });

    await createNotification({
      userId: complaint.student_id,
      title: 'Technician Assigned',
      message: `A department technician has been assigned to your ticket "${complaint.title}".`,
    });

    return complaint;
  }

  /**
   * Admin: Update Priority
   */
  async updatePriority(complaintId, newPriority, adminUser) {
    const complaint = await this.getComplaintById(complaintId, adminUser);
    const oldPriority = complaint.priority;
    complaint.priority = newPriority.toLowerCase();
    complaint.updated_at = new Date().toISOString();

    const comment = `Priority adjusted from ${oldPriority.toUpperCase()} to ${newPriority.toUpperCase()}.`;
    await this.recordStatusTransition(complaint, complaint.status, adminUser.id, comment);

    await logAudit({
      userId: adminUser.id,
      action: 'PRIORITY_UPDATED',
      entityId: complaintId,
      metadata: { oldPriority, newPriority },
    });

    return complaint;
  }

  /**
   * Staff: Start Work (assigned -> in_progress)
   */
  async startWork(complaintId, staffUser) {
    const complaint = await this.getComplaintById(complaintId, staffUser);
    this.validateStatusTransition(complaint.status, 'in_progress');

    complaint.status = 'in_progress';
    complaint.updated_at = new Date().toISOString();

    const comment = 'Technician has arrived at location and commenced maintenance work.';
    await this.recordStatusTransition(complaint, 'in_progress', staffUser.id, comment);

    await logAudit({
      userId: staffUser.id,
      action: 'COMPLAINT_STARTED',
      entityId: complaintId,
    });

    await createNotification({
      userId: complaint.student_id,
      title: 'Maintenance in Progress',
      message: `Technician has started work on your ticket "${complaint.title}".`,
    });

    return complaint;
  }

  /**
   * Staff: Add Progress Update Comment
   */
  async addProgressUpdate(complaintId, comment, staffUser) {
    const complaint = await this.getComplaintById(complaintId, staffUser);
    complaint.updated_at = new Date().toISOString();

    const updateRecord = {
      id: `u-${Date.now()}`,
      complaint_id: complaintId,
      updated_by: staffUser.id,
      status: complaint.status,
      comment,
      created_at: new Date().toISOString(),
    };

    inMemoryUpdates.push(updateRecord);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('complaint_updates').insert(updateRecord);
        await supabase.from('complaints').update({ updated_at: complaint.updated_at }).eq('id', complaintId);
      } catch (err) {
        logger.warn(`Supabase progress update notice: ${err.message}`);
      }
    }

    await logAudit({
      userId: staffUser.id,
      action: 'COMPLAINT_UPDATED',
      entityId: complaintId,
      metadata: { comment },
    });

    return updateRecord;
  }

  /**
   * Staff: Mark as Resolved (in_progress -> resolved)
   */
  async resolveComplaint(complaintId, resolutionComment, staffUser) {
    const complaint = await this.getComplaintById(complaintId, staffUser);
    this.validateStatusTransition(complaint.status, 'resolved');

    const timestamp = new Date().toISOString();
    complaint.status = 'resolved';
    complaint.resolved_at = timestamp;
    complaint.updated_at = timestamp;

    const comment = `Work completed by technician: ${resolutionComment}`;
    await this.recordStatusTransition(complaint, 'resolved', staffUser.id, comment);

    await logAudit({
      userId: staffUser.id,
      action: 'COMPLAINT_RESOLVED',
      entityId: complaintId,
      metadata: { resolutionComment },
    });

    await createNotification({
      userId: complaint.student_id,
      title: 'Issue Marked as Resolved',
      message: `Maintenance finished for "${complaint.title}". Please verify if the issue is actually resolved.`,
      type: 'action_required',
    });

    return complaint;
  }

  /**
   * Student: Verify Resolution (resolved -> verified)
   */
  async verifyResolution(complaintId, studentUser) {
    const complaint = await this.getComplaintById(complaintId, studentUser);
    this.validateStatusTransition(complaint.status, 'verified');

    complaint.status = 'verified';
    complaint.updated_at = new Date().toISOString();

    const comment = 'Student confirmed and verified that the issue has been successfully resolved.';
    await this.recordStatusTransition(complaint, 'verified', studentUser.id, comment);

    await logAudit({
      userId: studentUser.id,
      action: 'COMPLAINT_VERIFIED',
      entityId: complaintId,
    });

    if (complaint.assigned_staff_id) {
      await createNotification({
        userId: complaint.assigned_staff_id,
        title: 'Resolution Verified by Student',
        message: `Student verified resolution for ticket "${complaint.title}". Great job!`,
      });
    }

    return complaint;
  }

  /**
   * Student: Reopen Complaint (resolved -> reopened, requires reason)
   */
  async reopenComplaint(complaintId, reopenReason, studentUser) {
    const complaint = await this.getComplaintById(complaintId, studentUser);
    this.validateStatusTransition(complaint.status, 'reopened');

    complaint.status = 'reopened';
    complaint.reopen_reason = reopenReason;
    complaint.resolved_at = null;
    complaint.updated_at = new Date().toISOString();

    const comment = `Student reported issue still persists: "${reopenReason}". Ticket reopened.`;
    await this.recordStatusTransition(complaint, 'reopened', studentUser.id, comment);

    await logAudit({
      userId: studentUser.id,
      action: 'COMPLAINT_REOPENED',
      entityId: complaintId,
      metadata: { reopenReason },
    });

    if (complaint.assigned_staff_id) {
      await createNotification({
        userId: complaint.assigned_staff_id,
        title: 'Ticket Reopened by Student',
        message: `Student reopened ticket "${complaint.title}": ${reopenReason}`,
        type: 'alert',
      });
    }

    return complaint;
  }

  /**
   * Upload Evidence
   */
  async addEvidence(complaintId, file, user) {
    const complaint = await this.getComplaintById(complaintId, user);
    const timestamp = new Date().toISOString();
    const id = `ev-${Date.now()}`;

    let fileUrl = `https://storage.campuscoins.local/evidence/${complaintId}/${file.originalname}`;
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const filePath = `${complaintId}/evidence/${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { data: storageData, error: uploadErr } = await supabase.storage
          .from('complaints')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (!uploadErr && storageData) {
          const { data: publicUrlData } = supabase.storage.from('complaints').getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            fileUrl = publicUrlData.publicUrl;
          }
        }
      } catch (err) {
        logger.warn(`Supabase Storage upload notice: ${err.message}`);
      }
    }

    // In-memory record or data URL representation for previewing
    if (file.mimetype.startsWith('image/')) {
      const base64 = file.buffer.toString('base64');
      fileUrl = `data:${file.mimetype};base64,${base64}`;
    }

    const evidenceEntry = {
      id,
      complaint_id: complaintId,
      file_url: fileUrl,
      file_type: file.mimetype,
      uploaded_by: user.id,
      created_at: timestamp,
    };

    inMemoryEvidence.push(evidenceEntry);

    if (supabase) {
      try {
        await supabase.from('complaint_evidence').insert(evidenceEntry);
      } catch (err) {
        logger.warn(`Supabase complaint_evidence insert notice: ${err.message}`);
      }
    }

    await logAudit({
      userId: user.id,
      action: 'EVIDENCE_UPLOADED',
      entityId: complaintId,
      metadata: { fileType: file.mimetype, fileName: file.originalname },
    });

    return evidenceEntry;
  }

  /**
   * Helper to persist status transitions across Supabase and in-memory
   */
  async recordStatusTransition(complaint, newStatus, actorId, comment) {
    const updateRecord = {
      id: `u-${Date.now()}`,
      complaint_id: complaint.id,
      updated_by: actorId,
      status: newStatus,
      comment,
      created_at: new Date().toISOString(),
    };

    inMemoryUpdates.push(updateRecord);

    const memIndex = inMemoryComplaints.findIndex((c) => c.id === complaint.id);
    if (memIndex !== -1) {
      inMemoryComplaints[memIndex] = {
        ...inMemoryComplaints[memIndex],
        status: newStatus,
        priority: complaint.priority || inMemoryComplaints[memIndex].priority,
        updated_at: complaint.updated_at,
        resolved_at: complaint.resolved_at !== undefined ? complaint.resolved_at : inMemoryComplaints[memIndex].resolved_at,
        assigned_staff_id: complaint.assigned_staff_id !== undefined ? complaint.assigned_staff_id : inMemoryComplaints[memIndex].assigned_staff_id,
        assigned_to: complaint.assigned_to !== undefined ? complaint.assigned_to : inMemoryComplaints[memIndex].assigned_to,
        rejection_reason: complaint.rejection_reason !== undefined ? complaint.rejection_reason : inMemoryComplaints[memIndex].rejection_reason,
        reopen_reason: complaint.reopen_reason !== undefined ? complaint.reopen_reason : inMemoryComplaints[memIndex].reopen_reason,
      };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('complaints').update({
          status: newStatus,
          priority: complaint.priority,
          updated_at: complaint.updated_at,
          resolved_at: complaint.resolved_at,
          assigned_staff_id: complaint.assigned_staff_id,
          rejection_reason: complaint.rejection_reason,
          reopen_reason: complaint.reopen_reason,
        }).eq('id', complaint.id);

        await supabase.from('complaint_updates').insert(updateRecord);
      } catch (err) {
        logger.warn(`Supabase transition notice: ${err.message}`);
      }
    }
  }

  /**
   * Active Staff list for Admin dropdown
   */
  async getStaffList() {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, department_id, staff_id')
          .eq('role', 'staff')
          .eq('is_active', true)
          .order('full_name');
        if (!error && data?.length) return data;
      } catch (err) {
        logger.warn(`Supabase getStaffList notice: ${err.message}`);
      }
    }

    // Fallback seed staff
    return [
      { id: 'b8000000-0000-0000-0000-000000000002', full_name: 'David Vance', email: 'd.vance@campus.edu', staff_id: 'STF-402' },
      { id: 'b8000000-0000-0000-0000-000000000004', full_name: 'Sarah Jenkins', email: 's.jenkins@campus.edu', staff_id: 'STF-405' },
      { id: 'b8000000-0000-0000-0000-000000000005', full_name: 'Marcus Brody', email: 'm.brody@campus.edu', staff_id: 'STF-408' },
    ];
  }
}

module.exports = new ComplaintService();
