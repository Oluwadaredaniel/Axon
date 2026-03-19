import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function useAuth(requireAuth = true) {
  const { user, loading, initialized, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) initialize();
  }, [initialized, initialize]);

  useEffect(() => {
    if (!initialized) return;
    if (requireAuth && !user) {
      router.push('/auth/login');
    }
  }, [initialized, user, requireAuth, router]);

  return { user, loading, initialized };
}

export function useRequireAdmin() {
  const { user, initialized, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) initialize();
  }, [initialized, initialize]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!user.is_admin) {
      router.push('/dashboard');
    }
  }, [initialized, user, router]);

  return { user, initialized };
}