import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/authApi';
import { DEFAULT_USER } from '../lib/demoData';

// ─── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

// ─── Provider ───────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const session = await authApi.getCurrentSession();

        if (isMounted) {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const subscription = authApi.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (fullName, email, password) => {
    const result = await authApi.register({
      fullName: fullName || email.split('@')[0],
      email,
      password,
    });

    setUser(result.session?.user ?? null);
    return result;
  }, []);

  const resendSignupConfirmation = useCallback(
    (email) => authApi.resendSignupConfirmation(email),
    [],
  );

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const result = await authApi.login({ email, password });

    setUser(result.session?.user ?? result.user ?? null);
    return result;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(
    async (updates) => {
      const updatedUser = await authApi.updateUserMetadata(updates);
      setUser(updatedUser);
      return updatedUser;
    },
    [],
  );

  // ── Update settings ───────────────────────────────────────────────────────
  const updateSettings = useCallback(
    async (settings) => {
      if (settings?.theme) {
        document.documentElement.setAttribute(
          'data-theme',
          settings.theme,
        );
      }
      return settings;
    },
    [],
  );

  // ─── Context value ────────────────────────────────────────────────────────
  const value = {
    user,
    loading,
    isLoading: loading,
    isAuthenticated: !!user,
    // Showcase credentials (useful for UI hints)
    demoEmail: DEFAULT_USER.email,
    demoPassword: DEFAULT_USER.password,
    register,
    resendSignupConfirmation,
    login,
    logout,
    updateProfile,
    updateUserMetadata: updateProfile,
    updateSettings,
    // Legacy aliases used by the old Profile.jsx / contexts/AuthContext.jsx
    error: null,
    clearError: () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Protected route ─────────────────────────────────────────────────────────

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};
