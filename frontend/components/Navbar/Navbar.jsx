'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, LogIn, LogOut, Newspaper, UserPlus } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const { user, ready, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} container`}>
        <Link href={user ? '/news' : '/'} className={styles.brand} aria-label="Faisal News home">
          <span className={styles.brandMark}>F</span>
          <span className={styles.brandWord}>Faisal<span className={styles.brandAccent}> News</span></span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <ul className={styles.list}>
            {user ? (
              <>
                <li>
                  <Link
                    href="/news"
                    className={`${styles.link} ${pathname === '/news' || pathname.startsWith('/news/') ? styles.linkActive : ''}`}
                  >
                    News
                  </Link>
                </li>
                <li>
                  <Link
                    href="/saved"
                    className={`${styles.link} ${pathname.startsWith('/saved') ? styles.linkActive : ''}`}
                  >
                    Saved
                  </Link>
                </li>
              </>
            ) : null}
          </ul>
        </nav>

        <div className={styles.actions}>
          {!ready ? null : user ? (
            <>
              <Link href="/saved" className={styles.iconBtn} aria-label="Saved">
                <Bookmark size={18} />
              </Link>
              <span className={styles.userLabel}>{user.name || user.email.split('@')[0]}</span>
              <button type="button" className={styles.ghost} onClick={logout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.ghost}>
                <LogIn size={16} />
                <span>Login</span>
              </Link>
              <Link href="/register" className={styles.primary}>
                <UserPlus size={16} />
                <span>Sign up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
