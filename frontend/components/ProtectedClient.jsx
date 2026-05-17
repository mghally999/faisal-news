'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Spinner from '@/components/Spinner/Spinner';

export default function ProtectedClient({ children }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) {
      const next = encodeURIComponent(pathname || '/');
      router.replace(`/login?next=${next}`);
    }
  }, [ready, user, router, pathname]);

  if (!ready || !user) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <Spinner label="Loading your library" />
      </div>
    );
  }

  return children;
}
