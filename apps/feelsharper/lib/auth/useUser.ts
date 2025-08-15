import { useAuth } from '@/components/auth/AuthProvider';

export function useUser() {
  return useAuth();
}