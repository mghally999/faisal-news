import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm/AuthForm';
import Spinner from '@/components/Spinner/Spinner';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to your Faisal News account to access your personal library of saved stories.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: true }
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}><Spinner /></div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
