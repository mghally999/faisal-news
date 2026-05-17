'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import { api } from '@/lib/api';
import styles from './SaveArticleButton.module.css';

const cleanSource = (article) => {
  if (!article) return '';
  if (article.source && typeof article.source === 'object') return article.source.name;
  return article.source || '';
};

export default function SaveArticleButton({ article }) {
  const { user } = useAuth();
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    if (!user) {
      toast.info('Sign in to save articles');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/saved', {
        articleUrl: article.url,
        title: article.title,
        description: article.description || null,
        imageUrl: article.urlToImage || null,
        source: cleanSource(article) || null,
        publishedAt: article.publishedAt || null
      });
      setSaved(true);
      toast.success('Saved to your library');
    } catch (err) {
      if (err.code === 'ALREADY_SAVED') {
        setSaved(true);
        toast.info('Already in your library');
      } else {
        toast.error(err.message || 'Could not save article');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.btn} ${saved ? styles.saved : ''}`}
      onClick={onSave}
      disabled={busy || saved}
    >
      {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      <span>{saved ? 'Saved' : busy ? 'Saving…' : 'Save article'}</span>
    </button>
  );
}
