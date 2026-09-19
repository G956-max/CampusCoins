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
    return res.data;
  },
  getMyComplaints: async (params = {}) => {
    const res = await api.get('/api/complaints/my', { params });
    return res.data;
  },
  getComplaintDetails: async (id) => {
    const res = await api.get(`/api/complaints/${id}`);
    return res.data;
  },
  uploadEvidence: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/api/complaints/${id}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  verifyResolution: async (id) => {
    const res = await api.post(`/api/complaints/${id}/verify`);
    return res.data;
  },
  reopenComplaint: async (id, reopenReason) => {
    const res = await api.post(`/api/complaints/${id}/reopen`, {
      reopen_reason: reopenReason,
    });
    return res.data;
  },

  // Staff Endpoints
  getStaffComplaints: async (params = {}) => {
    const res = await api.get('/api/staff/complaints', { params });
    return res.data;
  },
  getStaffComplaintDetails: async (id) => {
    const res = await api.get(`/api/staff/complaints/${id}`);
    return res.data;
  },
  startWork: async (id) => {
    const res = await api.post(`/api/staff/complaints/${id}/start`);
    return res.data;
  },
  addProgressUpdate: async (id, comment) => {
    const res = await api.post(`/api/staff/complaints/${id}/update`, { comment });
    return res.data;
  },
  resolveComplaint: async (id, resolutionComment) => {
    const res = await api.post(`/api/staff/complaints/${id}/resolve`, {
      resolution_comment: resolutionComment,
    });
    return res.data;
  },
  uploadStaffEvidence: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/api/staff/complaints/${id}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Admin Endpoints
  getAllComplaints: async (params = {}) => {
    const res = await api.get('/api/admin/complaints', { params });
    return res.data;
  },
  getAdminComplaintDetails: async (id) => {
    const res = await api.get(`/api/admin/complaints/${id}`);
    return res.data;
  },
  reviewComplaint: async (id) => {
    const res = await api.post(`/api/admin/complaints/${id}/review`);
    return res.data;
  },
  rejectComplaint: async (id, rejectionReason) => {
    const res = await api.post(`/api/admin/complaints/${id}/reject`, {
      rejection_reason: rejectionReason,
    });
    return res.data;
  },
  assignStaff: async (id, staffId, notes = '') => {
    const res = await api.post(`/api/admin/complaints/${id}/assign`, {
      staff_id: staffId,
      notes,
    });
    return res.data;
  },
  updatePriority: async (id, priority) => {
    const res = await api.patch(`/api/admin/complaints/${id}/priority`, {
      priority,
    });
    return res.data;
  },
  getStaffList: async () => {
    const res = await api.get('/api/admin/complaints/staff-list');
    return res.data;
  },
};

export default complaintApi;
