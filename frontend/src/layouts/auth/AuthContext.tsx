import type { RegisterDto } from 'src/services/auth.service';

import { useState, useEffect, useContext, useCallback, createContext } from 'react';

import { apiService } from 'src/api';
import authService from 'src/services/auth.service';


interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' ;
  photoURL ?: string
  username ?: string
}


interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAuthenticated(true);
        setUser(parsedUser);
        apiService.setAuthToken(token);
      } catch (e) {
        console.warn('Invalid stored user JSON:', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);



  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });

      if (!data?.token?.accessToken) throw new Error('No access token returned from API');

      setUser(data.user);
      setAuthenticated(true);

      localStorage.setItem('access_token', data.token.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      apiService.setAuthToken(data.token.accessToken);
    } catch (err) {
      setAuthenticated(false);
      setUser(null);
      throw err;
    }
  }, []);

  const register = useCallback(async (formData: RegisterDto) => {
    try {
      const data = await authService.register(formData);

      if (!data?.token?.accessToken) throw new Error('No access token returned from API');

      setUser(data.user);
      setAuthenticated(true);

      localStorage.setItem('access_token', data.token.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      apiService.setAuthToken(data.token.accessToken);
    } catch (err) {
      setAuthenticated(false);
      setUser(null);
      throw err;
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setAuthenticated(false);
    setUser(null);
    apiService.clearAuthToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
