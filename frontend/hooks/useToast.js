'use client';

import { useToastContext } from '@/lib/toast-context';

export default function useToast() {
  return useToastContext();
}
