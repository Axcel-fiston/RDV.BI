import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const me = await api.auth.me();
        setUser(me);
        setAuthError(null);
      } catch (err) {
        setUser(null);
        setAuthError({ type: 'auth_required', message: err.message });
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const login = async () => {
    api.auth.redirectToLogin('/Dashboard');
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

