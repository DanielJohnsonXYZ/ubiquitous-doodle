// Simple auth helpers for password protection and demo mode

const AUTH_COOKIE_NAME = 'ri_auth';
const DEMO_MODE_KEY = 'ri_demo_mode';

export type AuthMode = 'authenticated' | 'demo' | null;

export interface AuthState {
  mode: AuthMode;
  isDemo: boolean;
  isAuthenticated: boolean;
}

// Valid invite codes (you can add more or store in env/database)
const VALID_INVITE_CODES = process.env.NEXT_PUBLIC_INVITE_CODES?.split(',') || [];

export function verifyPassword(password: string): boolean {
  const masterPassword = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD;
  if (!masterPassword) return true; // If no password set, allow access
  return password === masterPassword;
}

export function verifyInviteCode(code: string): boolean {
  if (VALID_INVITE_CODES.length === 0) return false;
  return VALID_INVITE_CODES.includes(code.trim().toUpperCase());
}

export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { mode: null, isDemo: false, isAuthenticated: false };
  }

  const authCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.split('=')[1];

  const isDemo = localStorage.getItem(DEMO_MODE_KEY) === 'true';

  if (authCookie === 'authenticated') {
    return { mode: 'authenticated', isDemo: false, isAuthenticated: true };
  }

  if (isDemo) {
    return { mode: 'demo', isDemo: true, isAuthenticated: false };
  }

  return { mode: null, isDemo: false, isAuthenticated: false };
}

export function setAuthenticated(): void {
  // Set cookie for 7 days
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  document.cookie = `${AUTH_COOKIE_NAME}=authenticated; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  localStorage.removeItem(DEMO_MODE_KEY);
}

export function setDemoMode(): void {
  localStorage.setItem(DEMO_MODE_KEY, 'true');
  // Clear auth cookie if any
  document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function logout(): void {
  document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  localStorage.removeItem(DEMO_MODE_KEY);
}
