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

  // Helper to build a complete demo user and profile
  const getDemoUserData = (targetRole = ROLES.STUDENT, email = null) => {
    const cleanEmail = email?.trim().toLowerCase() || '';
    let role = targetRole;
    if (cleanEmail.includes('vance') || cleanEmail.includes('staff')) role = ROLES.STAFF;
    if (cleanEmail.includes('admin')) role = ROLES.ADMIN;

    let p = MOCK_STUDENT_DATA.profile;
    let userId = 'b8000000-0000-0000-0000-000000000001';
    let studentId = 'STU-2024-8842';
    let staffId = null;
    let balance = 480;

    if (role === ROLES.STAFF) {
      p = MOCK_STAFF_DATA.profile;
      userId = 'b8000000-0000-0000-0000-000000000002';
      studentId = null;
      staffId = 'STF-402';
      balance = 0;
    } else if (role === ROLES.ADMIN) {
      p = MOCK_ADMIN_DATA.profile;
      userId = 'b8000000-0000-0000-0000-000000000003';
      studentId = null;
      staffId = 'ADM-001';
      balance = 0;
    }

    const effectiveRole = p.role || role;
    const userEmail = email ? email.trim() : p.email;

    const mockUser = {
      id: userId,
      email: userEmail,
      user_metadata: {
        full_name: p.name,
        role: effectiveRole,
      },
    };

    const mockProf = {
      ...p,
      id: userId,
      email: userEmail,
      full_name: p.name,
      role: effectiveRole,
      student_id: studentId,
      staff_id: staffId,
      department_id: 'd0000000-0000-0000-0000-000000000001',
      department: { id: 'd0000000-0000-0000-0000-000000000001', name: p.department || 'Computer Science and Engineering', code: 'CSE' },
      is_active: true,
    };

    const mockWallet = {
      balance: effectiveRole === ROLES.STUDENT ? balance : 0,
      lifetime_earned: 650,
      lifetime_spent: 170,
    };

    return { user: mockUser, profile: mockProf, wallet: mockWallet };
  };

  // Initialize Auth state
  useEffect(() => {
    if (!isConfigured) {
      // Phase 1 Mock Fallback when Supabase keys are not yet provided
      const savedRole = localStorage.getItem('campuscoins_mock_role') || ROLES.STUDENT;
      const savedEmail = localStorage.getItem('campuscoins_mock_email');
      const isAuth = localStorage.getItem('campuscoins_is_authenticated') === 'true';

      if (isAuth) {
        const demoData = getDemoUserData(savedRole, savedEmail);
        setUser(demoData.user);
        setProfile(demoData.profile);
        setWallet(demoData.wallet);
      }
      setLoading(false);
      return;
    }

    // Real Supabase Auth Initializer with Demo Mode persistence
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted && initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfileAndWallet(initialSession.user.id);
        } else if (mounted) {
          // If no Supabase cloud session, check if a demo session was active
          const isDemoAuth = localStorage.getItem('campuscoins_is_authenticated') === 'true';
          const savedRole = localStorage.getItem('campuscoins_mock_role') || ROLES.STUDENT;
          const savedEmail = localStorage.getItem('campuscoins_mock_email');

          if (isDemoAuth) {
            const demoData = getDemoUserData(savedRole, savedEmail);
            setUser(demoData.user);
            setProfile(demoData.profile);
            setWallet(demoData.wallet);
          }
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

        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            await fetchProfileAndWallet(newSession.user.id);
          }
        } else {
          // Only clear if not in demo mode
          const isDemoAuth = localStorage.getItem('campuscoins_is_authenticated') === 'true';
          const savedRole = localStorage.getItem('campuscoins_mock_role');
          if (!isDemoAuth || !savedRole) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setWallet({ balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
          }
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
  const login = async ({ email, password, role = ROLES.STUDENT, isDemo = false }) => {
    setLoading(true);
    setAuthError(null);

    const isCampusEmail = email?.trim().toLowerCase().endsWith('@campus.edu');

    // 1. Direct Demo Access (Instant login without network latency)
    if (isDemo || !isConfigured) {
      await new Promise((r) => setTimeout(r, 150));
      const demoData = getDemoUserData(role, email);
      setUser(demoData.user);
      setProfile(demoData.profile);
      setWallet(demoData.wallet);
      localStorage.setItem('campuscoins_is_authenticated', 'true');
      localStorage.setItem('campuscoins_mock_role', demoData.profile.role);
      localStorage.setItem('campuscoins_mock_email', demoData.user.email);
      localStorage.setItem('campuscoins_mock_user_id', demoData.user.id);
      setLoading(false);
      return demoData;
    }

    // 2. Real Supabase Authentication
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // If Supabase rejected a campus demo email, fall back smoothly to demo access
        if (isCampusEmail) {
          console.info('[Auth] Supabase credentials rejected demo email. Falling back to local demo session.');
          const demoData = getDemoUserData(role, email);
          setUser(demoData.user);
          setProfile(demoData.profile);
          setWallet(demoData.wallet);
          localStorage.setItem('campuscoins_is_authenticated', 'true');
          localStorage.setItem('campuscoins_mock_role', demoData.profile.role);
          localStorage.setItem('campuscoins_mock_email', demoData.user.email);
          localStorage.setItem('campuscoins_mock_user_id', demoData.user.id);
          setLoading(false);
          return demoData;
        }

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

      // Clear any mock overrides for real Supabase users
      localStorage.removeItem('campuscoins_mock_role');
      localStorage.removeItem('campuscoins_mock_email');
      localStorage.removeItem('campuscoins_mock_user_id');
      localStorage.setItem('campuscoins_is_authenticated', 'true');

      setLoading(false);
      return { user: authUser, profile: loadedProfile, wallet: loadedWallet };
    } catch (err) {
      if (isCampusEmail) {
        const demoData = getDemoUserData(role, email);
        setUser(demoData.user);
        setProfile(demoData.profile);
        setWallet(demoData.wallet);
        localStorage.setItem('campuscoins_is_authenticated', 'true');
        localStorage.setItem('campuscoins_mock_role', demoData.profile.role);
        localStorage.setItem('campuscoins_mock_email', demoData.user.email);
        localStorage.setItem('campuscoins_mock_user_id', demoData.user.id);
        setLoading(false);
        return demoData;
      }

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
    localStorage.removeItem('campuscoins_mock_email');
    localStorage.removeItem('campuscoins_mock_user_id');
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

  // Mock role switcher for test convenience
  const switchRole = (newRole) => {
    const demoData = getDemoUserData(newRole);
    setUser(demoData.user);
    setProfile(demoData.profile);
    setWallet(demoData.wallet);
    localStorage.setItem('campuscoins_is_authenticated', 'true');
    localStorage.setItem('campuscoins_mock_role', demoData.profile.role);
    localStorage.setItem('campuscoins_mock_email', demoData.user.email);
    localStorage.setItem('campuscoins_mock_user_id', demoData.user.id);
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
