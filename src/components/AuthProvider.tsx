'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthState, getAuthState, setAuthenticated, setDemoMode, logout as logoutFn, verifyPassword, verifyInviteCode } from '@/lib/auth';

interface AuthContextType extends AuthState {
  login: (password: string) => boolean;
  loginWithInviteCode: (code: string) => boolean;
  enterDemoMode: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    mode: null,
    isDemo: false,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check auth state on mount
    const state = getAuthState();
    setAuthState(state);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Redirect to login if accessing dashboard without auth
    if (!loading && pathname?.startsWith('/dashboard')) {
      const state = getAuthState();
      if (!state.isAuthenticated && !state.isDemo) {
        router.push('/login');
      }
    }
  }, [loading, pathname, router]);

  const login = (password: string): boolean => {
    if (verifyPassword(password)) {
      setAuthenticated();
      setAuthState({ mode: 'authenticated', isDemo: false, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const loginWithInviteCode = (code: string): boolean => {
    if (verifyInviteCode(code)) {
      setAuthenticated();
      setAuthState({ mode: 'authenticated', isDemo: false, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const enterDemoMode = () => {
    setDemoMode();
    setAuthState({ mode: 'demo', isDemo: true, isAuthenticated: false });
  };

  const logout = () => {
    logoutFn();
    setAuthState({ mode: null, isDemo: false, isAuthenticated: false });
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        loginWithInviteCode,
        enterDemoMode,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
