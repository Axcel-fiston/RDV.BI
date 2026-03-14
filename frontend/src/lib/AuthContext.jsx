import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAccessToken, getStoredUser, clearSession } from '@/api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initialUser = getStoredUser();
  const [user, setUser] = useState(initialUser);
  const [isLoadingAuth, setIsLoadingAuth] = useState(() => !initialUser && Boolean(getAccessToken()));
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (initialUser) {
      setIsLoadingAuth(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setIsLoadingAuth(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const me = await api.auth.me();
        setUser(me);
        setAuthError(null);
      } catch (err) {
        clearSession();
        setUser(null);
        setAuthError({ type: 'auth_required', message: err.message });
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const user = await api.auth.login({ email, password });
    setUser(user);
    setAuthError(null);
    return user;
  };

  const logout = () => {
    api.auth.logout();
  };

  const navigateToLogin = () => {
    window.location.href = '/AdminLogin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        login,
        logout,
        navigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext) ?? {
    user: null,
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authError: null,
    login: () => {},
    logout: () => {},
    navigateToLogin: () => {},
  };
}

