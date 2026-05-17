'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import Trie from '@/lib/trie';
import useDebounce from '@/hooks/useDebounce';
import styles from './SearchBar.module.css';

const STORAGE_KEY = 'faisal-news:search-history';
const HISTORY_LIMIT = 50;

const loadHistory = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
};

const saveHistory = (history) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
  } catch {}
};

const extractKeywords = (headlines) => {
  if (!Array.isArray(headlines)) return [];
  const words = new Set();
  for (const h of headlines) {
    if (!h || !h.title) continue;
    h.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4)
      .forEach((w) => words.add(w));
  }
  return Array.from(words);
};

export default function SearchBar({ headlines = [], placeholder = 'Search world headlines…' }) {
  const router = useRouter();
  const search = useSearchParams();
  const [value, setValue] = useState(search.get('q') || '');
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const wrapRef = useRef(null);
  const debounced = useDebounce(value, 180);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const trie = useMemo(() => {
    const t = new Trie();
    history.forEach((h) => t.insert(h));
    extractKeywords(headlines).forEach((w) => t.insert(w));
    return t;
  }, [history, headlines]);

  const suggestions = useMemo(() => {
    if (!debounced || debounced.length < 2) return [];
    return trie.wordsWithPrefix(debounced.toLowerCase(), 6);
  }, [debounced, trie]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const commit = (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const next = [trimmed, ...history.filter((h) => h !== trimmed.toLowerCase())].slice(0, HISTORY_LIMIT);
    setHistory(next);
    saveHistory(next);
    setOpen(false);
    router.push(`/news?q=${encodeURIComponent(trimmed)}`);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    commit(value);
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <form className={styles.form} onSubmit={onSubmit} role="search">
        <Search size={18} className={styles.icon} aria-hidden="true" />
        <input
          type="search"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={(e) => { setValue(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          aria-label="Search news"
          autoComplete="off"
        />
        <button type="submit" className={styles.button}>Search</button>
      </form>
      {open && suggestions.length > 0 ? (
        <ul className={styles.menu} role="listbox">
          {suggestions.map((s) => (
            <li key={s}>
              <button type="button" className={styles.option} onClick={() => { setValue(s); commit(s); }}>
                <Search size={14} aria-hidden="true" />
                <span>{s}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
