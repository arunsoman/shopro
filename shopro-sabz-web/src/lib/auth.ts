import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

export interface User {
  name: string;
  email?: string;
  phone_number?: string;
  shopro_user_type?: string;
  sub: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load token from localStorage on initialization
  const storedToken = localStorage.getItem('sabz_token');
  let initialUser: User | null = null;
  
  if (storedToken) {
    try {
      const decoded: any = jwtDecode(storedToken);
      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('sabz_token');
      } else {
        initialUser = {
          name: decoded.name || 'Unknown User',
          email: decoded.email,
          phone_number: decoded.phone_number,
          shopro_user_type: decoded.shopro_user_type,
          sub: decoded.sub || '',
        };
      }
    } catch (e) {
      console.error('Invalid token in local storage', e);
      localStorage.removeItem('sabz_token');
    }
  }

  return {
    token: initialUser ? storedToken : null,
    user: initialUser,
    isAuthenticated: !!initialUser,
    login: (token: string) => {
      try {
        const decoded: any = jwtDecode(token);
        const user: User = {
          name: decoded.name || 'Unknown User',
          email: decoded.email,
          phone_number: decoded.phone_number,
          shopro_user_type: decoded.shopro_user_type,
          sub: decoded.sub || '',
        };
        localStorage.setItem('sabz_token', token);
        set({ token, user, isAuthenticated: true });
      } catch (e) {
        console.error('Failed to parse token', e);
      }
    },
    logout: () => {
      localStorage.removeItem('sabz_token');
      set({ token: null, user: null, isAuthenticated: false });
    },
  };
});
