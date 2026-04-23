import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

type Admin = {
  id: number;
  email: string;
  role: string;
  name?: string;
  lastLoginAt?: string | null;
};

type LoginResponse = {
  data: {
    token: string;
    admin: Admin;
  };
};

type MeResponse = {
  data: {
    admin: Admin;
  };
};

type AdminAuthContextValue = {
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = 'spotme_admin_auth';

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function readStoredToken() {
  return localStorage.getItem(STORAGE_KEY);
}

function writeStoredToken(token: string) {
  localStorage.setItem(STORAGE_KEY, token);
}

function clearStoredToken() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentToken = readStoredToken();
    if (!currentToken) {
      setLoading(false);
      return;
    }

    setToken(currentToken);
    apiRequest<MeResponse>('/admin/auth/me', { token: currentToken })
      .then((response) => {
        setAdmin(response.data.admin);
      })
      .catch(() => {
        clearStoredToken();
        setToken(null);
        setAdmin(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiRequest<LoginResponse>('/admin/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    writeStoredToken(response.data.token);
    setToken(response.data.token);
    setAdmin(response.data.admin);
  };

  const logout = async () => {
    const currentToken = readStoredToken();
    try {
      if (currentToken) {
        await apiRequest('/admin/auth/logout', {
          method: 'POST',
          token: currentToken,
        });
      }
    } catch {
      // Ignore logout transport failures and clear local session anyway.
    } finally {
      clearStoredToken();
      setToken(null);
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
