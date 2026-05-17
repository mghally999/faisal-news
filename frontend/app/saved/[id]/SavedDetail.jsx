'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, ExternalLink, Save, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import useToast from '@/hooks/useToast';
import Spinner from '@/components/Spinner/Spinner';
import styles from './page.module.css';

export default function SavedDetail({ id }) {
  const router = useRouter();
  const toast = useToast();
  const [item, setItem] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initialNotes = useRef('');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/api/saved/${id}`);
        setItem(data);
        setNotes(data.notes || '');
        initialNotes.current = data.notes || '';
      } catch (err) {
        toast.error(err.message || 'Could not load article');
        router.replace('/saved');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router, toast]);

  const persist = async (value) => {
    if (value === initialNotes.current) return;
    setSaving(true);
    try {
      const data = await api.patch(`/api/saved/${id}`, { notes: value || null });
      setItem(data);
      initialNotes.current = value;
      toast.success('Notes saved');
    } catch (err) {
      toast.error(err.message || 'Could not save notes');
    } finally {
      setSaving(false);
    }
  };

  const onRemove = async () => {
    try {
      await api.delete(`/api/saved/${id}`);
      toast.success('Removed from library');
      router.push('/saved');
    } catch (err) {
      toast.error(err.message || 'Could not remove');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <Spinner label="Loading article" />
      </div>
    );
  }

  if (!item) return null;

  const published = item.publishedAt ? new Date(item.publishedAt) : null;

  return (
    <section className={`${styles.shell} container`}>
      <Link href="/saved" className={styles.back}><ArrowLeft size={16} /> Back to library</Link>

      <article className={styles.card}>
        {item.imageUrl ? (
          <div className={styles.hero}>
            <img src={item.imageUrl} alt="" />
          </div>
        ) : null}

        <div className={styles.body}>
          <div className={styles.meta}>
            {item.source ? <span className={styles.source}>{item.source}</span> : null}
            {published ? <time dateTime={published.toISOString()}>{format(published, 'MMM d, yyyy')}</time> : null}
          </div>

          <h1 className={styles.title}>{item.title}</h1>
          {item.description ? <p className={styles.desc}>{item.description}</p> : null}

          <a className={styles.openOriginal} href={item.articleUrl} target="_blank" rel="noopener noreferrer">
            Open the original <ExternalLink size={14} />
          </a>

          <div className={styles.notesBlock}>
            <label htmlFor="notes" className={styles.notesLabel}>Your notes</label>
            <textarea
              id="notes"
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={(e) => persist(e.target.value)}
              placeholder="Capture quotes, sources, follow-ups…"
              rows={8}
              maxLength={4000}
            />
            <div className={styles.notesActions}>
              <span className={styles.count}>{notes.length} / 4000</span>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={() => persist(notes)}
                disabled={saving || notes === initialNotes.current}
              >
                <Save size={16} /> {saving ? 'Saving…' : 'Save notes'}
              </button>
            </div>
          </div>

          <button type="button" className={styles.removeBtn} onClick={onRemove}>
            <Trash2 size={16} /> Remove from library
          </button>
        </div>
      </article>
    </section>
  );
}
