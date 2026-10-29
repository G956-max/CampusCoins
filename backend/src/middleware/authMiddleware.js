const config = require('../config/env');
const { getSupabaseClient } = require('../config/supabase');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Predefined test / mock profiles for offline development and automated test suites
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
    email: 'david.vance@campus.edu',
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
  'other-student-999': {
    id: 'b8000000-0000-0000-0000-000000000999',
    email: 'other.student@campus.edu',
    full_name: 'Jordan Lee (Other Student)',
    role: 'student',
    student_id: 'STU-2024-9999',
  },
  'unassigned-staff-999': {
    id: 'b8000000-0000-0000-0000-000000000998',
    email: 'unassigned.staff@campus.edu',
    full_name: 'Unassigned Staff Member',
    role: 'staff',
    staff_id: 'STF-998',
  },
};

/**
 * Verify Authentication Middleware
 * Enforces production security: Never trusts mock headers or client-supplied roles in production.
 * Supports explicit development/test mock auth only when ALLOW_DEV_MOCK_AUTH=true or NODE_ENV=test.
 */
const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const mockRoleHeader = req.headers['x-mock-role'];
  const mockUserIdHeader = req.headers['x-mock-user-id'];

  // Check if mock authentication was attempted
  const isMockAuthAttempt = Boolean(
    mockRoleHeader ||
    mockUserIdHeader ||
    (authHeader && authHeader.includes('mock-'))
  );

  // 1. Production Security Guard: Reject mock auth unconditionally in production
  if (isMockAuthAttempt) {
    if (config.nodeEnv === 'production' || !config.allowDevMockAuth) {
      logger.warn('[SECURITY ALERT] Unauthorized mock authentication attempt rejected in production.');
      return sendError(res, 'Invalid authentication credentials. Mock authentication is disabled in this environment.', 401);
    }

    // Explicit dev/test mode mock authorization:
    let role = mockRoleHeader;
    if (!role && authHeader) {
      if (authHeader.includes('admin')) role = 'admin';
      else if (authHeader.includes('staff')) role = 'staff';
      else role = 'student';
    }
    if (!role) role = 'student';

    // Resolve user ID & profile
    const userIdKey = mockUserIdHeader || (role === 'staff' ? 'mock-staff-id' : role === 'admin' ? 'mock-admin-id' : 'mock-student-id');
    const mockProfile = MOCK_PROFILES[userIdKey] || {
      id: mockUserIdHeader || `mock-${role}-id`,
      email: `${role}.dev@campus.edu`,
      full_name: `Dev ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role,
    };

    req.user = {
      ...mockProfile,
      role: mockProfile.role || role,
    };

    return next();
  }

  // 2. Real JWT Authentication via Supabase
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication token missing or invalid', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token || token.trim() === '') {
    return sendError(res, 'Authentication token missing', 401);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    // If Supabase credentials are missing and mock auth is not enabled, fail safely
    if (config.nodeEnv === 'production' || !config.allowDevMockAuth) {
      logger.error('[AUTH] Supabase client is not configured in production environment.');
      return sendError(res, 'Authentication service currently unavailable.', 503);
    }
    // Development fallback
    req.user = MOCK_PROFILES['mock-student-id'];
    return next();
  }

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);

    if (authErr || !user) {
      logger.warn(`[AUTH] Invalid token: ${authErr?.message || 'User not found'}`);
      return sendError(res, 'Invalid or expired authentication session', 401);
    }

    // Fetch verified profile from database to determine true role (never trust client)
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, department_id, is_active, student_id, staff_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr) {
      logger.error(`[AUTH] Database error fetching user profile: ${profileErr.message}`);
      return sendError(res, 'Error verifying account permissions', 500);
    }

    // Handle case where profile row has not been created yet
    let activeProfile = profile;
    if (!activeProfile) {
      const metaRole = user.user_metadata?.role === 'staff' ? 'staff' : (user.user_metadata?.role === 'admin' ? 'admin' : 'student');
      activeProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'User'),
        role: metaRole,
        is_active: true,
      };
      try {
        await supabase.from('profiles').insert(activeProfile);
      } catch (e) {
        // Ignore if profiles table does not exist yet
      }
    }

    if (activeProfile.is_active !== true) {
      logger.warn(`[AUTH] Inactive account access attempt: ${user.id}`);
      return sendError(res, 'Your account is currently inactive. Please contact the administrator.', 403);
    }

    const PERMITTED_ROLES = ['student', 'staff', 'admin'];
    if (!activeProfile.role || !PERMITTED_ROLES.includes(activeProfile.role)) {
      logger.error(`[AUTH] User ${user.id} has invalid/unrecognized role: "${activeProfile.role}". Failing closed.`);
      return sendError(res, 'Invalid account role or authorization configuration.', 403);
    }

    const assignedRole = activeProfile.role;

    req.user = {
      id: user.id,
      email: activeProfile.email || user.email,
      role: assignedRole,
      full_name: activeProfile.full_name || activeProfile.email?.split('@')[0] || 'User',
      department_id: activeProfile.department_id || null,
      student_id: activeProfile.student_id || null,
      staff_id: activeProfile.staff_id || null,
      is_active: activeProfile.is_active,
    };

    return next();
  } catch (err) {
    logger.error(`[AUTH] Unexpected verification exception: ${err.message}`);
    return sendError(res, 'Authentication verification failed', 401);
  }
};

/**
 * Role-Based Access Guard Middleware
 * Enforces Student, Staff, and Admin permissions on the server
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated user', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden: Access requires one of [${allowedRoles.join(', ')}] permissions. Current role: ${req.user.role}`,
        403
      );
    }

    next();
  };
};

module.exports = {
  verifyAuth,
  requireRole,
  MOCK_PROFILES,
};
