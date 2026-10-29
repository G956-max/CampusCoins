import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { MOCK_USERS, ROLES, DEFAULT_API_URL } from '../config/constants';
import { walletApi, checkServerHealth } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState({ balance: 480, lifetime_earned: 920, lifetime_spent: 440 });
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [serverUrl, setServerUrl] = useState(DEFAULT_API_URL);

  // Initialize session & saved role
  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      setLoading(true);

      // Load custom server URL if configured
      const savedUrl = await AsyncStorage.getItem('campuscoins_api_url');
      if (savedUrl) {
        setServerUrl(savedUrl);
      }

      // Check server health
      try {
        await checkServerHealth();
        setServerOnline(true);
      } catch (err) {
        setServerOnline(false);
      }

      // Check if real Supabase session exists
      if (isSupabaseConfigured() && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
          setLoading(false);
          return;
        }
      }

      // Fallback to saved mock role or default to Student
      const savedRole = (await AsyncStorage.getItem('campuscoins_mock_role')) || ROLES.STUDENT;
      const mockProfile = MOCK_USERS[savedRole] || MOCK_USERS.student;
      
      setUser({ id: mockProfile.id, email: mockProfile.email });
      setProfile(mockProfile);
      setWallet(mockProfile.wallet || { balance: 480, lifetime_earned: 920, lifetime_spent: 440 });

      // Try fetching live wallet from backend
      try {
        const liveWallet = await walletApi.getWallet();
        if (liveWallet?.data) {
          setWallet(liveWallet.data);
        }
      } catch (e) {
        // use mock wallet
      }
    } catch (error) {
      console.warn('Session load notice:', error);
      // Fallback to student demo
      setProfile(MOCK_USERS.student);
      setUser({ id: MOCK_USERS.student.id, email: MOCK_USERS.student.email });
      setWallet(MOCK_USERS.student.wallet);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    if (!supabase) return;
    try {
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profData) {
        setProfile(profData);
      }

      const { data: walData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (walData) {
        setWallet(walData);
      }
    } catch (e) {
      console.warn('Profile fetch error:', e);
    }
  };

  // Demo Login Quick-Switcher (One-tap for demo)
  const loginWithDemo = async (roleName = ROLES.STUDENT) => {
    const selected = MOCK_USERS[roleName] || MOCK_USERS.student;
    await AsyncStorage.setItem('campuscoins_mock_role', selected.role);
    await AsyncStorage.setItem('campuscoins_mock_user_id', selected.id);

    setUser({ id: selected.id, email: selected.email });
    setProfile(selected);
    setWallet(selected.wallet || { balance: 480, lifetime_earned: 920, lifetime_spent: 440 });

    try {
      const liveWallet = await walletApi.getWallet();
      if (liveWallet?.data) {
        setWallet(liveWallet.data);
      }
    } catch (e) {
      // ignore
    }
  };

  // Real Supabase Login
  const login = async (email, password) => {
    if (!isSupabaseConfigured() || !supabase) {
      // Mock login check
      if (email.includes('staff')) {
        await loginWithDemo(ROLES.STAFF);
      } else if (email.includes('admin')) {
        await loginWithDemo(ROLES.ADMIN);
      } else {
        await loginWithDemo(ROLES.STUDENT);
      }
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    setUser(data.user);
    await loadUserProfile(data.user.id);
    return { success: true, user: data.user };
  };

  // Real Supabase Sign Up
  const register = async (email, password, fullName, studentId) => {
    if (!isSupabaseConfigured() || !supabase) {
      await loginWithDemo(ROLES.STUDENT);
      return { success: true };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          student_id: studentId,
          role: 'student',
        },
      },
    });

    if (error) throw error;
    return { success: true, user: data.user };
  };

  // Logout
  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    await AsyncStorage.removeItem('campuscoins_mock_role');
    await AsyncStorage.removeItem('campuscoins_mock_user_id');
    setUser(null);
    setProfile(null);
  };

  // Refresh wallet balance
  const refreshWallet = async () => {
    try {
      const res = await walletApi.getWallet();
      if (res?.data) {
        setWallet(res.data);
      }
    } catch (e) {
      // ignore
    }
  };

  // Update server connection URL
  const updateServerUrl = async (newUrl) => {
    const cleanUrl = newUrl.trim().replace(/\/+$/, '');
    await AsyncStorage.setItem('campuscoins_api_url', cleanUrl);
    setServerUrl(cleanUrl);
    try {
      await checkServerHealth();
      setServerOnline(true);
      return true;
    } catch (e) {
      setServerOnline(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        wallet,
        loading,
        serverOnline,
        serverUrl,
        login,
        register,
        loginWithDemo,
        logout,
        refreshWallet,
        updateServerUrl,
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

