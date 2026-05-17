import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import SearchBar from '@/components/SearchBar/SearchBar';
import ArticleGrid from '@/components/ArticleGrid/ArticleGrid';
import EmptyState from '@/components/EmptyState/EmptyState';
import ProtectedClient from '@/components/ProtectedClient';
import styles from './page.module.css';

export const revalidate = 300;

export async function generateMetadata({ searchParams }) {
  const sp = (await searchParams) || {};
  const q = sp.q ? String(sp.q) : null;
  const category = sp.category ? String(sp.category) : null;
  const title = q
    ? `Search: ${q}`
    : category
      ? `${category.charAt(0).toUpperCase()}${category.slice(1)} headlines`
      : 'Latest news';
  return {
    title,
    description: q
      ? `Faisal News results for “${q}”. Curated, real-time coverage.`
      : 'The latest headlines, refreshed throughout the day. Search, filter, and save the stories that matter.',
    alternates: { canonical: '/news' }
  };
}

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'business', label: 'Business' },
  { key: 'technology', label: 'Technology' },
  { key: 'science', label: 'Science' },
  { key: 'sports', label: 'Sports' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'health', label: 'Health' }
];

const safeFetch = async (path, params) => {
  try {
    return await serverFetch(path, params);
  } catch {
    return { articles: [] };
  }
};

export default async function NewsPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const q = sp.q ? String(sp.q).trim() : '';
  const category = sp.category ? String(sp.category) : '';
  const page = sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;
  const pageSize = 20;

  const data = q
    ? await safeFetch('/api/news/search', { q, page, pageSize })
    : await safeFetch('/api/news/headlines', { country: 'us', category: category || undefined, page, pageSize });

  const articles = (data.articles || []).filter((a) => a && a.url && a.title);
  const totalResults = data.totalResults || articles.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

  return (
    <ProtectedClient>
    <section className={`${styles.shell} container`}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Faisal News · Edition</p>
        <h1 className={styles.title}>{q ? `Results for “${q}”` : category ? `${category.charAt(0).toUpperCase()}${category.slice(1)} headlines` : 'The latest headlines'}</h1>
        <p className={styles.subtitle}>
          Search a topic, scan a category, or browse the most-discussed stories of the moment.
        </p>
        <SearchBar headlines={articles} />
      </header>

      <nav className={styles.tabs} aria-label="Categories">
        {CATEGORIES.map((c) => {
          const active = (c.key === '' && !category && !q) || c.key === category;
          const href = c.key ? `/news?category=${c.key}` : '/news';
          return (
            <Link key={c.key || 'all'} href={href} className={`${styles.tab} ${active ? styles.tabActive : ''}`}>
              {c.label}
            </Link>
          );
        })}
      </nav>

      {articles.length ? (
        <>
          <ArticleGrid articles={articles} columns={3} />
          {totalPages > 1 ? (
            <div className={styles.pager}>
              {page > 1 ? (
                <Link
                  className={styles.pageBtn}
                  href={{ pathname: '/news', query: { ...(q ? { q } : {}), ...(category ? { category } : {}), page: page - 1 } }}
                >
                  ← Previous
                </Link>
              ) : <span className={styles.pagePlaceholder} />}
              <span className={styles.pageMeta}>Page {page} of {totalPages}</span>
              {page < totalPages ? (
                <Link
                  className={styles.pageBtn}
                  href={{ pathname: '/news', query: { ...(q ? { q } : {}), ...(category ? { category } : {}), page: page + 1 } }}
                >
                  Next →
                </Link>
              ) : <span className={styles.pagePlaceholder} />}
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          title={q ? `No results for “${q}”` : 'No headlines available'}
          description={q ? 'Try a broader search or pick a category above.' : 'Check back shortly — fresh stories arrive throughout the day.'}
        />
      )}
    </section>
    </ProtectedClient>
  );
}
