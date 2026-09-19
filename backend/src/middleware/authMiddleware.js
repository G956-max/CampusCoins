const { getSupabaseClient } = require('../config/supabase');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Mock Profile Registry for Offline / Preview Evaluation
 */
const MOCK_PROFILES = {
  'mock-student-id': {
    id: 'b8000000-0000-0000-0000-000000000001',
    email: 'alex.rivera@campus.edu',
    full_name: 'Alex Rivera',
    role: 'student',
    student_id: 'STU-2024-8842',
  },
  'mock-staff-id': {
    id: 'b8000000-0000-0000-0000-000000000002',
    email: 'd.vance@campus.edu',
    full_name: 'David Vance',
    role: 'staff',
    staff_id: 'STF-402',
  },
  'mock-admin-id': {
    id: 'b8000000-0000-0000-0000-000000000003',
    email: 'admin.office@campus.edu',
    full_name: 'Dr. Eleanor Vance',
    role: 'admin',
  },
};

/**
 * Authenticate JWT from Supabase or Fallback Test Header
 */
const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const mockRoleHeader = req.headers['x-mock-role'];
  const mockUserIdHeader = req.headers['x-mock-user-id'];

  // 1. Mock / Preview Fallback (via header or mock token)
  if (mockRoleHeader || mockUserIdHeader || (authHeader && authHeader.includes('mock-'))) {
    const role = mockRoleHeader || (authHeader?.includes('staff') ? 'staff' : authHeader?.includes('admin') ? 'admin' : 'student');
    let baseProfile = MOCK_PROFILES['mock-student-id'];
    if (role === 'staff') baseProfile = MOCK_PROFILES['mock-staff-id'];
    if (role === 'admin') baseProfile = MOCK_PROFILES['mock-admin-id'];

    req.user = {
      ...baseProfile,
      role,
      id: mockUserIdHeader || baseProfile.id,
    };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication token missing or invalid', 401);
  }

  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseClient();

  // 2. Real Supabase JWT if client is configured
  if (supabase && token) {
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);

      if (authErr || !user) {
        logger.warn(`Invalid Supabase token: ${authErr?.message || 'User not found'}`);
        return sendError(res, 'Invalid or expired authentication session', 401);
      }

      // Fetch Profile to load server-side verified role
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileErr || !profile) {
        const fallbackRole = user.user_metadata?.role || 'student';
        req.user = {
          id: user.id,
          email: user.email,
          role: fallbackRole,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        };
        return next();
      }

      if (profile.is_active === false) {
        return sendError(res, 'Your account is currently inactive. Please contact administrator.', 403);
      }

      req.user = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        full_name: profile.full_name,
        department_id: profile.department_id,
      };

      return next();
    } catch (err) {
      logger.error('Error during Supabase token verification:', err.message);
      return sendError(res, 'Authentication verification failed', 401);
    }
  }

  return sendError(res, 'Authentication token missing or invalid', 401);
};

/**
 * Role-Based Access Guard Middleware
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated user', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, `Forbidden: Requires one of [${allowedRoles.join(', ')}] role`, 403);
    }

    next();
  };
};

module.exports = {
  verifyAuth,
  requireRole,
  MOCK_PROFILES,
};
