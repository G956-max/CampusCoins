import api from './api';

export const complaintApi = {
  // Location Cascading
  getBuildings: async () => {
    const res = await api.get('/api/locations/buildings');
    return res.data;
  },
  getFloors: async (buildingId) => {
    const res = await api.get('/api/locations/floors', {
      params: buildingId ? { buildingId } : {},
    });
    return res.data;
  },
  getRooms: async (floorId) => {
    const res = await api.get('/api/locations/rooms', {
      params: floorId ? { floorId } : {},
    });
    return res.data;
  },

  // Student Endpoints
  createComplaint: async (payload) => {
    const res = await api.post('/api/complaints', payload);
    return res.data || res;
  },
  getMyComplaints: async (params = {}) => {
    const res = await api.get('/api/complaints/my', { params });
    return res;
  },
  getComplaintDetails: async (id) => {
    const res = await api.get(`/api/complaints/${id}`);
    return res;
  },
  uploadEvidence: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/api/complaints/${id}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data || res;
  },
  verifyResolution: async (id) => {
    const res = await api.post(`/api/complaints/${id}/verify`);
    return res;
  },
  reopenComplaint: async (id, reopenReason) => {
    const res = await api.post(`/api/complaints/${id}/reopen`, {
      reopen_reason: reopenReason,
    });
    return res;
  },

  // Staff Endpoints
  getStaffComplaints: async (params = {}) => {
    const res = await api.get('/api/staff/complaints', { params });
    return res;
  },
  getStaffComplaintDetails: async (id) => {
    const res = await api.get(`/api/staff/complaints/${id}`);
    return res;
  },
  startWork: async (id) => {
    const res = await api.post(`/api/staff/complaints/${id}/start`);
    return res;
  },
  addProgressUpdate: async (id, comment) => {
    const res = await api.post(`/api/staff/complaints/${id}/update`, { comment });
    return res;
  },
  resolveComplaint: async (id, resolutionComment) => {
    const res = await api.post(`/api/staff/complaints/${id}/resolve`, {
      resolution_comment: resolutionComment,
    });
    return res;
  },
  uploadStaffEvidence: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/api/staff/complaints/${id}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data || res;
  },

  // Admin Endpoints
  getAllComplaints: async (params = {}) => {
    const res = await api.get('/api/admin/complaints', { params });
    return res;
  },
  getAdminComplaintDetails: async (id) => {
    const res = await api.get(`/api/admin/complaints/${id}`);
    return res;
  },
  reviewComplaint: async (id) => {
    const res = await api.post(`/api/admin/complaints/${id}/review`);
    return res;
  },
  rejectComplaint: async (id, rejectionReason) => {
    const res = await api.post(`/api/admin/complaints/${id}/reject`, {
      rejection_reason: rejectionReason,
    });
    return res;
  },
  assignStaff: async (id, staffId, notes = '') => {
    const res = await api.post(`/api/admin/complaints/${id}/assign`, {
      staff_id: staffId,
      notes,
    });
    return res;
  },
  updatePriority: async (id, priority) => {
    const res = await api.patch(`/api/admin/complaints/${id}/priority`, {
      priority,
    });
    return res;
  },
  getStaffList: async () => {
    const res = await api.get('/api/admin/complaints/staff-list');
    return res.data || res;
  },
};

export default complaintApi;
