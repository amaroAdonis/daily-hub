import type {
  AuthResponseDto,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  UserDto,
} from '@daily-hub/shared';
import { api } from '../../lib/api';

export const register = (input: RegisterInput) =>
  api<AuthResponseDto>('/auth/register', { method: 'POST', body: JSON.stringify(input) });

export const login = (input: LoginInput) =>
  api<AuthResponseDto>('/auth/login', { method: 'POST', body: JSON.stringify(input) });

export const getMe = () => api<UserDto>('/auth/me');

export const updateProfile = (input: UpdateProfileInput) =>
  api<UserDto>('/auth/me', { method: 'PATCH', body: JSON.stringify(input) });
