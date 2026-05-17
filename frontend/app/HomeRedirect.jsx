'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Spinner from '@/components/Spinner/Spinner';
import styles from './HomeRedirect.module.css';

export default function HomeRedirect() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    router.replace(user ? '/news' : '/login');
  }, [ready, user, router]);

  return (
    <div className={styles.loading}>
      <Spinner label={user ? 'Loading the newsroom' : 'Redirecting to sign in'} />
    </div>
  );
}
