// src/hooks/use-auth.ts
import { useState, useEffect, useCallback } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Save to localStorage whenever token/user changes
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }, [token, user]);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };
}
