'use client';

import { useAuthContext } from '@/lib/auth-context';

export default function useAuth() {
  return useAuthContext();
}
