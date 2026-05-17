import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm/AuthForm';
import Spinner from '@/components/Spinner/Spinner';

export const metadata = {
  title: 'Create your account',
  description: 'Join Faisal News and build a personal library of the stories you want to remember.',
  alternates: { canonical: '/register' },
  robots: { index: true, follow: true }
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}><Spinner /></div>}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
