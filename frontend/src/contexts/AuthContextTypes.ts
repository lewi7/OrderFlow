import { createContext } from 'react';
import type { User, LoginRequest, RestaurantRegistrationRequest } from '../types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RestaurantRegistrationRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); 