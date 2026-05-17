'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import styles from './AuthForm.module.css';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const router = useRouter();
  const search = useSearchParams();
  const { login, register } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isRegister) {
        await register({ email, password, name: name || undefined });
        toast.success('Welcome to Faisal News');
      } else {
        await login({ email, password });
        toast.success('Welcome back');
      }
      const next = search.get('next');
      router.push(next || '/news');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <h1 className={styles.title}>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <p className={styles.subtitle}>
          {isRegister ? 'Save articles, take notes, build your daily brief.' : 'Sign in to your Faisal News library.'}
        </p>

        <form className={styles.form} onSubmit={onSubmit}>
          {isRegister ? (
            <label className={styles.field}>
              <span className={styles.label}>Display name <span className={styles.optional}>(optional)</span></span>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={80}
              />
            </label>
          ) : null}
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete={isRegister ? 'email' : 'username'}
              required
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={8}
              required
            />
            {isRegister ? <span className={styles.hint}>At least 8 characters.</span> : null}
          </label>

          {error ? <div className={styles.error} role="alert">{error}</div> : null}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className={styles.alt}>
          {isRegister ? (
            <>Already have an account? <Link href="/login">Sign in</Link></>
          ) : (
            <>New here? <Link href="/register">Create an account</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
