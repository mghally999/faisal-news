'use client';

import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import styles from './Toast.module.css';

const ICONS = {
  info: Info,
  success: CheckCircle2,
  error: XCircle
};

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className={styles.region} role="region" aria-label="Notifications">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant] || Info;
        return (
          <div key={t.id} className={`${styles.toast} ${styles[t.variant] || ''}`} role="status">
            <span className={styles.icon}><Icon size={18} /></span>
            <p className={styles.message}>{t.message}</p>
            <button
              type="button"
              className={styles.close}
              aria-label="Dismiss"
              onClick={() => onDismiss(t.id)}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
