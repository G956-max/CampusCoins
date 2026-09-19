import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, mapAuthError } from '../config/supabase';
import { ROLES } from '../constants/roles';
import { MOCK_STUDENT_DATA, MOCK_STAFF_DATA, MOCK_ADMIN_DATA } from '../constants/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const isConfigured = isSupabaseConfigured();

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Fetch user profile and wallet from Supabase
  const fetchProfileAndWallet = useCallback(async (userId) => {
    if (!supabase || !userId) return { profile: null, wallet: null };

    try {
      // 1. Fetch Profile with department join
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          student_id,
          staff_id,
          department_id,
          profile_image_url,
          year,
          section,
          phone,
          is_active,
          created_at,
          updated_at,
          department:departments (id, name, code)
        `)
        .eq('id', userId)
        .single();

      if (profileErr && profileErr.code !== 'PGRST116') {
        console.warn('[Auth] Profile fetch notice:', profileErr.message);
      }

      // 2. Fetch Wallet
      const { data: walletData, error: walletErr } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (walletErr) {
        console.warn('[Auth] Wallet fetch notice:', walletErr.message);
      }

      const activeProfile = profileData || null;
      const activeWallet = walletData || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 };

      setProfile(activeProfile);
      setWallet(activeWallet);

      return { profile: activeProfile, wallet: activeWallet };
    } catch (err) {
      console.error('[Auth] Error fetching profile/wallet:', err);
      return { profile: null, wallet: null };
    }
  }, []);

  // Initialize Auth state
  useEffect(() => {
    if (!isConfigured) {
      // Phase 1 Mock Fallback when Supabase keys are not yet provided
      const savedRole = localStorage.getItem('campuscoins_mock_role') || ROLES.STUDENT;
      const isAuth = localStorage.getItem('campuscoins_is_authenticated') === 'true';

      let mockProfile = MOCK_STUDENT_DATA.profile;
      if (savedRole === ROLES.STAFF) mockProfile = MOCK_STAFF_DATA.profile;
      if (savedRole === ROLES.ADMIN) mockProfile = MOCK_ADMIN_DATA.profile;

      if (isAuth) {
        setUser({ id: 'mock-user-id', email: mockProfile.email });
        setProfile({
          ...mockProfile,
          full_name: mockProfile.name,
          department: { name: mockProfile.department || 'Computer Science and Engineering', code: 'CSE' },
        });
        setWallet({
          balance: savedRole === ROLES.STUDENT ? 480 : 0,
          lifetime_earned: 650,
          lifetime_spent: 170,
        });
      }
      setLoading(false);
      return;
    }

    // Real Supabase Auth Initializer
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted && initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfileAndWallet(initialSession.user.id);
        }
      } catch (err) {
        console.error('[Auth] Initial session error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            await fetchProfileAndWallet(newSession.user.id);
          }
        } else {
          setProfile(null);
          setWallet({ balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [isConfigured, fetchProfileAndWallet]);

  // Login handler
  const login = async ({ email, password, role = ROLES.STUDENT }) => {
    setLoading(true);
    setAuthError(null);

    if (!isConfigured) {
      // Mock Login Fallback
      await new Promise((r) => setTimeout(r, 350));
      let p = MOCK_STUDENT_DATA.profile;
      if (role === ROLES.STAFF || email.includes('staff')) p = MOCK_STAFF_DATA.profile;
      if (role === ROLES.ADMIN || email.includes('admin')) p = MOCK_ADMIN_DATA.profile;

      const mockProf = {
        ...p,
        email,
        full_name: p.name,
        department: { name: p.department || 'Computer Science and Engineering', code: 'CSE' },
      };

      setUser({ id: 'mock-user-id', email });
      setProfile(mockProf);
      setWallet({
        balance: mockProf.role === ROLES.STUDENT ? 480 : 0,
        lifetime_earned: 650,
        lifetime_spent: 170,
      });
      localStorage.setItem('campuscoins_is_authenticated', 'true');
      localStorage.setItem('campuscoins_mock_role', mockProf.role);
      setLoading(false);
      return { user: { email }, profile: mockProf };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(mapAuthError(error));
      }

      const { user: authUser, session: authSession } = data;
      setSession(authSession);
      setUser(authUser);

      // Fetch loaded profile
      const { profile: loadedProfile, wallet: loadedWallet } = await fetchProfileAndWallet(authUser.id);

      // Account status check
      if (loadedProfile && loadedProfile.is_active === false) {
        await supabase.auth.signOut();
        throw new Error('Your account is currently inactive. Please contact the administrator.');
      }

      setLoading(false);
      return { user: authUser, profile: loadedProfile, wallet: loadedWallet };
    } catch (err) {
      setLoading(false);
      const friendlyMsg = mapAuthError(err);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  // Registration handler
  const register = async ({ fullName, collegeEmail, password, role }) => {
    setLoading(true);
    setAuthError(null);

    // Enforce role security: public register only allows student or staff
    const assignedRole = role === ROLES.STAFF ? ROLES.STAFF : ROLES.STUDENT;

    if (!isConfigured) {
      // Mock Register Fallback
      await new Promise((r) => setTimeout(r, 400));
      const mockProf = {
        name: fullName,
        full_name: fullName,
        email: collegeEmail,
        role: assignedRole,
        student_id: assignedRole === ROLES.STUDENT ? `STU-${Math.floor(1000 + Math.random() * 9000)}` : null,
        staff_id: assignedRole === ROLES.STAFF ? `STF-${Math.floor(100 + Math.random() * 900)}` : null,
        department: { name: 'Computer Science and Engineering', code: 'CSE' },
      };

      setUser({ id: 'mock-user-id', email: collegeEmail });
      setProfile(mockProf);
      setWallet({ balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
      localStorage.setItem('campuscoins_is_authenticated', 'true');
      localStorage.setItem('campuscoins_mock_role', assignedRole);
      setLoading(false);
      return { user: { email: collegeEmail }, profile: mockProf, emailConfirmationRequired: false };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: collegeEmail.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: assignedRole,
          },
        },
      });

      if (error) {
        throw new Error(mapAuthError(error));
      }

      const { user: authUser, session: authSession } = data;
      const emailConfirmationRequired = !authSession;

      if (authUser && authSession) {
        setSession(authSession);
        setUser(authUser);
        await fetchProfileAndWallet(authUser.id);
      }

      setLoading(false);
      return {
        user: authUser,
        emailConfirmationRequired,
      };
    } catch (err) {
      setLoading(false);
      const friendlyMsg = mapAuthError(err);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    if (isConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[Auth] SignOut notice:', err);
      }
    }

    setUser(null);
    setProfile(null);
    setSession(null);
    setWallet({ balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
    localStorage.removeItem('campuscoins_is_authenticated');
    localStorage.removeItem('campuscoins_mock_role');
    setLoading(false);
  };

  // Refresh profile & wallet manually
  const refreshProfile = async () => {
    if (user?.id) {
      return await fetchProfileAndWallet(user.id);
    }
  };

  // Update safe profile fields
  const updateProfile = async (updates) => {
    if (!profile) throw new Error('No profile loaded');

    // Filter to safe, editable fields only
    const safeUpdates = {
      full_name: updates.full_name ?? profile.full_name,
      phone: updates.phone ?? profile.phone,
      year: updates.year ?? profile.year,
      section: updates.section ?? profile.section,
      profile_image_url: updates.profile_image_url ?? profile.profile_image_url,
      department_id: updates.department_id ?? profile.department_id,
      updated_at: new Date().toISOString(),
    };

    if (!isConfigured) {
      // Mock update
      setProfile((prev) => ({
        ...prev,
        ...safeUpdates,
        name: safeUpdates.full_name,
      }));
      return { success: true };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('id', profile.id)
        .select(`
          *,
          department:departments (id, name, code)
        `)
        .single();

      if (error) throw error;

      setProfile(data);
      return { success: true, data };
    } catch (err) {
      console.error('[Auth] Error updating profile:', err);
      throw new Error(mapAuthError(err));
    }
  };

  // Mock role switcher for Phase 1/Phase 2 test convenience
  const switchRole = (newRole) => {
    let p = MOCK_STUDENT_DATA.profile;
    if (newRole === ROLES.STAFF) p = MOCK_STAFF_DATA.profile;
    if (newRole === ROLES.ADMIN) p = MOCK_ADMIN_DATA.profile;

    const mockProf = {
      ...p,
      full_name: p.name,
      department: { name: p.department || 'Computer Science and Engineering', code: 'CSE' },
    };

    setUser({ id: 'mock-user-id', email: p.email });
    setProfile(mockProf);
    setWallet({
      balance: newRole === ROLES.STUDENT ? 480 : 0,
      lifetime_earned: 650,
      lifetime_spent: 170,
    });
    localStorage.setItem('campuscoins_is_authenticated', 'true');
    localStorage.setItem('campuscoins_mock_role', newRole);
  };

  // Computed state
  const isAuthenticated = Boolean(user && (profile || !isConfigured));
  const effectiveRole = profile?.role || user?.user_metadata?.role || ROLES.STUDENT;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        wallet,
        role: effectiveRole,
        isAuthenticated,
        loading,
        authError,
        isSupabaseConfigured: isConfigured,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
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

export default AuthContext;
