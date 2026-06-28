import { useMutation } from '@tanstack/react-query';
import type { UpdateProfileInput } from '@daily-hub/shared';
import { useAuth } from '../../contexts/auth';
import { updateProfile } from '../auth/api';

/** Salva o perfil e reflete o usuário atualizado no contexto de auth. */
export function useUpdateProfile() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (user) => setUser(user),
  });
}
