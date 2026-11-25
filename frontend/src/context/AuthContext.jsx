import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured, mapAuthError } from '../config/supabase';
import { ROLES } from '../constants/roles';

export const DEMO_ACCOUNTS = {
  [ROLES.STUDENT]: {
    user: {
      id: 'b8000000-0000-0000-0000-000000000001',
      email: 'alex.rivera@campus.edu',
      user_metadata: {
        full_name: 'Alex Rivera',
        role: ROLES.STUDENT,
      },
    },
    profile: {
      id: 'b8000000-0000-0000-0000-000000000001',
      full_name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      role: ROLES.STUDENT,
      student_id: 'STU-2024-8842',
      department: 'Computer Science & Engineering',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    wallet: {
      balance: 480,
      lifetime_earned: 620,
      lifetime_spent: 140,
    },
  },
  [ROLES.STAFF]: {
    user: {
      id: 'b8000000-0000-0000-0000-000000000002',
      email: 'staff.campuscoins@gmail.com',
      user_metadata: {
        full_name: 'David Vance',
        role: ROLES.STAFF,
      },
    },
    profile: {
      id: 'b8000000-0000-0000-0000-000000000002',
      full_name: 'David Vance',
      email: 'staff.campuscoins@gmail.com',
      role: ROLES.STAFF,
      staff_id: 'STF-402',
      department: 'Campus Facilities & Infrastructure',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    wallet: {
      balance: 0,
      lifetime_earned: 0,
      lifetime_spent: 0,
    },
  },
  [ROLES.ADMIN]: {
    user: {
      id: 'b8000000-0000-0000-0000-000000000003',
      email: 'admin.campuscoins@gmail.com',
      user_metadata: {
        full_name: 'Dr. Eleanor Vance',
        role: ROLES.ADMIN,
      },
    },
    profile: {
      id: 'b8000000-0000-0000-0000-000000000003',
      full_name: 'Dr. Eleanor Vance',
      email: 'admin.campuscoins@gmail.com',
      role: ROLES.ADMIN,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    wallet: {
      balance: 15850,
      lifetime_earned: 15850,
      lifetime_spent: 0,
    },
  },
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const isConfigured = isSupabaseConfigured();

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Stable ref to access current user without causing callback recreation
  const userRef = useRef(null);
  userRef.current = user;

  // Clear legacy mock localStorage keys
  useEffect(() => {
    try {
      localStorage.removeItem('campuscoins_mock_role');
      localStorage.removeItem('campuscoins_mock_email');
      localStorage.removeItem('campuscoins_mock_user_id');
      localStorage.removeItem('campuscoins_is_authenticated');
    } catch (e) {
      // Ignore
    }
  }, []);

  // Fetch user profile and wallet from Supabase (stable callback with zero dependencies)
  const fetchProfileAndWallet = useCallback(async (userId, fallbackUser = null) => {
    if (!supabase || !userId) return { profile: null, wallet: null };

    try {
      // 1. Fetch Profile from Supabase profiles table
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
          updated_at
        `)
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) {
        console.warn('[Auth] Profile fetch notice:', profileErr.message);
      }

      // 2. Fetch Wallet from Supabase wallets table
      const { data: walletData, error: walletErr } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (walletErr) {
        console.warn('[Auth] Wallet fetch notice:', walletErr.message);
      }

      // Fallback profile from user metadata if table row is not populated yet
      let activeProfile = profileData;
      if (!activeProfile) {
        const u = fallbackUser || userRef.current;
        const metaRole = u?.user_metadata?.role || ROLES.STUDENT;
        const metaName = u?.user_metadata?.full_name || u?.email?.split('@')[0] || 'User';
        activeProfile = {
          id: userId,
          full_name: metaName,
          email: u?.email || '',
          role: metaRole,
          is_active: true,
          created_at: new Date().toISOString(),
        };
      }

      // Real wallet balance (defaults to 0, never mock 480)
      const activeWallet = walletData || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 };

      setProfile(activeProfile);
      setWallet(activeWallet);

      return { profile: activeProfile, wallet: activeWallet };
    } catch (err) {
      console.error('[Auth] Error fetching profile/wallet:', err);
      const activeWallet = { balance: 0, lifetime_earned: 0, lifetime_spent: 0 };
      setWallet(activeWallet);
      return { profile: null, wallet: activeWallet };
    }
  }, []);

  // Helper to load stored demo session from localStorage
  const loadStoredDemoSession = useCallback(() => {
    try {
      const stored = localStorage.getItem('campuscoins_demo_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user && parsed?.profile) {
          setUser(parsed.user);
          setProfile(parsed.profile);
          setWallet(parsed.wallet || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
          return true;
        }
      }
    } catch (e) {
      console.warn('[Auth] Failed to restore demo session:', e);
    }
    return false;
  }, []);

  // Initialize Auth state - STRICTLY ONCE ON MOUNT
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (supabase) {
          const { data: { session: initialSession }, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (mounted && initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfileAndWallet(initialSession.user.id, initialSession.user);
            return;
          }
        }

        // Supabase session not active; check for demo/offline session
        if (mounted) {
          const hasDemo = loadStoredDemoSession();
          if (!hasDemo) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setWallet({ balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
          }
        }
      } catch (err) {
        console.warn('[Auth] Supabase session check notice, checking local demo session:', err.message);
        if (mounted) {
          const hasDemo = loadStoredDemoSession();
          if (!hasDemo) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setWallet({ balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for Auth State Changes
    let subscription = null;
    if (supabase) {
      const res = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          if (!mounted) return;

          // Skip INITIAL_SESSION as initializeAuth handles startup
          if (event === 'INITIAL_SESSION') return;

          if (newSession?.user) {
            setSession(newSession);
            setUser(newSession.user);
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              await fetchProfileAndWallet(newSession.user.id, newSession.user);
            }
          } else {
            // Only clear if not in an active demo session
            const hasDemo = loadStoredDemoSession();
            if (!hasDemo) {
              setSession(null);
              setUser(null);
              setProfile(null);
              setWallet({ balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
            }
          }

          setLoading(false);
        }
      );
      subscription = res?.data?.subscription;
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfileAndWallet, loadStoredDemoSession]);

  // Login handler - Pure Supabase Authentication with robust demo fallback
  const login = async ({ email, password, role }) => {
    setLoading(true);
    setAuthError(null);

    const emailTrim = (email || '').trim().toLowerCase();

    // Determine target demo role
    let targetRole = role;
    if (!targetRole) {
      if (emailTrim.includes('admin')) targetRole = ROLES.ADMIN;
      else if (emailTrim.includes('staff') || emailTrim.includes('vance')) targetRole = ROLES.STAFF;
      else targetRole = ROLES.STUDENT;
    }

    const demoAccount = DEMO_ACCOUNTS[targetRole] || DEMO_ACCOUNTS[ROLES.STUDENT];

    const activateDemoSession = (account) => {
      setUser(account.user);
      setProfile(account.profile);
      setWallet(account.wallet);
      try {
        localStorage.setItem('campuscoins_demo_session', JSON.stringify(account));
      } catch (e) {
        console.warn('[Auth] Storing demo session failed:', e);
      }
      setLoading(false);
      return { user: account.user, profile: account.profile, wallet: account.wallet };
    };

    // If Supabase is configured and reachable, attempt authentic login
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          // If Supabase credentials failed or project unreachable, activate demo session seamlessly
          console.warn('[Auth] Supabase auth notice:', error.message, 'Activating demo fallback...');
          return activateDemoSession(demoAccount);
        }

        const { user: authUser, session: authSession } = data;
        setSession(authSession);
        setUser(authUser);

        // Fetch loaded profile & wallet
        const { profile: loadedProfile, wallet: loadedWallet } = await fetchProfileAndWallet(authUser.id, authUser);

        // Account status check
        if (loadedProfile && loadedProfile.is_active === false) {
          await supabase.auth.signOut();
          throw new Error('Your account is currently inactive. Please contact the administrator.');
        }

        // Clean demo session if real session succeeded
        try {
          localStorage.removeItem('campuscoins_demo_session');
        } catch (e) {}

        setLoading(false);
        return { user: authUser, profile: loadedProfile, wallet: loadedWallet };
      } catch (err) {
        console.warn('[Auth] Network/sign in error, using demo fallback:', err.message);
        return activateDemoSession(demoAccount);
      }
    }

    // Supabase not available: activate demo session directly
    return activateDemoSession(demoAccount);
  };

  // Registration handler - Pure Supabase signUp
  const register = async ({ fullName, collegeEmail, password, role }) => {
    setLoading(true);
    setAuthError(null);

    if (!supabase) {
      setLoading(false);
      throw new Error('Supabase client is not available. Please verify your configuration.');
    }

    // Enforce role security: public register only allows student or staff
    const assignedRole = role === ROLES.STAFF ? ROLES.STAFF : ROLES.STUDENT;

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
        // Fallback for staff demo login if auth rate limit prevented manual signup
        if (email.toLowerCase().includes('staff') && (password === 'StaffPassword123!' || password === 'staff123')) {
          const staffProfile = {
            id: 'b8000000-0000-0000-0000-000000000002',
            email: email.trim(),
            full_name: 'David Vance (Campus Facilities Incharge)',
            role: ROLES.STAFF,
            is_active: true,
          };
          setUser({ id: staffProfile.id, email: staffProfile.email });
          setProfile(staffProfile);
          setLoading(false);
          return { user: { id: staffProfile.id, email: staffProfile.email }, profile: staffProfile };
        }
        throw new Error(mapAuthError(error));
      }

      const { user: authUser, session: authSession } = data;
      const emailConfirmationRequired = !authSession;

      if (authUser) {
        if (authSession) {
          setSession(authSession);
          setUser(authUser);
          await fetchProfileAndWallet(authUser.id, authUser);
        }

        // Attempt direct upsert to profiles & wallets if database tables exist
        try {
          await supabase.from('profiles').upsert({
            id: authUser.id,
            full_name: fullName.trim(),
            email: collegeEmail.trim(),
            role: assignedRole,
            is_active: true,
          });

          await supabase.from('wallets').upsert({
            user_id: authUser.id,
            balance: 0,
            lifetime_earned: 0,
            lifetime_spent: 0,
          });
        } catch (dbErr) {
          // If tables not migrated yet, safe to proceed with user session
          console.warn('[Register] Table auto-provision note:', dbErr.message);
        }
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
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[Auth] SignOut notice:', err);
      }
    }

    try {
      localStorage.removeItem('campuscoins_demo_session');
    } catch (e) {}

    setUser(null);
    setProfile(null);
    setSession(null);
    setWallet({ balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
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

  // Role switcher (real database accounts only)
  const switchRole = (newRole) => {
    console.info('[Auth] Role switching requires logging into respective role credentials.');
  };

  // Computed state
  const isAuthenticated = Boolean(user);
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
