import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../constants/roles';
import { MOCK_STUDENT_DATA, MOCK_STAFF_DATA, MOCK_ADMIN_DATA } from '../constants/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Default to student for Phase 1 preview, or check localStorage
  const [user, setUser] = useState(() => {
    const savedRole = localStorage.getItem('campuscoins_mock_role') || ROLES.STUDENT;
    if (savedRole === ROLES.STAFF) return MOCK_STAFF_DATA.profile;
    if (savedRole === ROLES.ADMIN) return MOCK_ADMIN_DATA.profile;
    return MOCK_STUDENT_DATA.profile;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('campuscoins_is_authenticated') === 'true';
  });

  const [loading, setLoading] = useState(false);

  const login = async ({ email, password, role = ROLES.STUDENT }) => {
    setLoading(true);
    // Simulate slight auth latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    let profile = MOCK_STUDENT_DATA.profile;
    if (role === ROLES.STAFF || email.includes('staff')) {
      profile = { ...MOCK_STAFF_DATA.profile, email };
    } else if (role === ROLES.ADMIN || email.includes('admin')) {
      profile = { ...MOCK_ADMIN_DATA.profile, email };
    } else {
      profile = { ...MOCK_STUDENT_DATA.profile, email };
    }

    setUser(profile);
    setIsAuthenticated(true);
    localStorage.setItem('campuscoins_is_authenticated', 'true');
    localStorage.setItem('campuscoins_mock_role', profile.role);
    setLoading(false);
    return profile;
  };

  const register = async ({ fullName, collegeEmail, role }) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newProfile = {
      name: fullName,
      email: collegeEmail,
      role: role || ROLES.STUDENT,
      department: 'General Engineering',
      studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setUser(newProfile);
    setIsAuthenticated(true);
    localStorage.setItem('campuscoins_is_authenticated', 'true');
    localStorage.setItem('campuscoins_mock_role', newProfile.role);
    setLoading(false);
    return newProfile;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('campuscoins_is_authenticated');
  };

  const switchRole = (newRole) => {
    let profile = MOCK_STUDENT_DATA.profile;
    if (newRole === ROLES.STAFF) profile = MOCK_STAFF_DATA.profile;
    if (newRole === ROLES.ADMIN) profile = MOCK_ADMIN_DATA.profile;

    setUser(profile);
    setIsAuthenticated(true);
    localStorage.setItem('campuscoins_is_authenticated', 'true');
    localStorage.setItem('campuscoins_mock_role', newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || ROLES.STUDENT,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
