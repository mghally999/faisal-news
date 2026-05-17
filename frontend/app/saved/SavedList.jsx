'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import useToast from '@/hooks/useToast';
import Spinner from '@/components/Spinner/Spinner';
import EmptyState from '@/components/EmptyState/EmptyState';
import styles from './page.module.css';

export default function SavedList() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/api/saved', { query: { pageSize: 50 } });
        setItems(data.items || []);
      } catch (err) {
        toast.error(err.message || 'Could not load your library');
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const onDelete = async (id) => {
    const prev = items;
    setItems((cur) => cur.filter((i) => i.id !== id));
    try {
      await api.delete(`/api/saved/${id}`);
      toast.success('Removed from library');
    } catch (err) {
      setItems(prev);
      toast.error(err.message || 'Could not remove article');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <Spinner label="Loading your library" />
      </div>
    );
  }

  return (
    <section className={`${styles.shell} container`}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Your library</p>
        <h1 className={styles.title}>Saved stories</h1>
        <p className={styles.subtitle}>
          A private archive of the articles you’ve set aside. Add notes, refer back, or read again later.
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your library is empty"
          description="Save an article from the news feed and it will appear here."
          action={<Link href="/news" className={styles.cta}>Browse the news</Link>}
        />
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              {item.imageUrl ? (
                <div className={styles.thumb}>
                  <img src={item.imageUrl} alt="" loading="lazy" />
                </div>
              ) : (
                <div className={styles.thumbFallback} aria-hidden="true">
                  <span>{item.source ? item.source.slice(0, 2) : 'NW'}</span>
                </div>
              )}
              <div className={styles.itemBody}>
                <div className={styles.itemMeta}>
                  {item.source ? <span className={styles.itemSource}>{item.source}</span> : null}
                  <span>Saved {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                </div>
                <h2 className={styles.itemTitle}>{item.title}</h2>
                {item.description ? <p className={styles.itemDesc}>{item.description}</p> : null}
                {item.notes ? (
                  <blockquote className={styles.notes}>{item.notes}</blockquote>
                ) : null}
                <div className={styles.itemActions}>
                  <Link href={`/saved/${item.id}`} className={styles.itemBtn}>
                    <Pencil size={15} /> {item.notes ? 'Edit note' : 'Add note'}
                  </Link>
                  <a className={styles.itemBtn} href={item.articleUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={15} /> Open original
                  </a>
                  <button
                    type="button"
                    className={`${styles.itemBtn} ${styles.delete}`}
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
