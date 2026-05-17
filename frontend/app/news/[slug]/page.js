import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { serverFetch } from '@/lib/api';
import ArticleGrid from '@/components/ArticleGrid/ArticleGrid';
import ProtectedClient from '@/components/ProtectedClient';
import SaveArticleButton from './SaveArticleButton';
import styles from './page.module.css';

export const revalidate = 600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const decodeSlug = (slug) => {
  try { return decodeURIComponent(slug); } catch { return null; }
};

const safeFetch = async (path, params) => {
  try { return await serverFetch(path, params); } catch { return { articles: [] }; }
};

const findArticleByUrl = (collections, url) => {
  for (const c of collections) {
    if (!c || !Array.isArray(c.articles)) continue;
    const hit = c.articles.find((a) => a && a.url === url);
    if (hit) return hit;
  }
  return null;
};

const fetchArticle = async (url) => {
  const u = new URL(url);
  const candidates = await Promise.all([
    safeFetch('/api/news/headlines', { country: 'us', pageSize: 50 }),
    safeFetch('/api/news/search', { q: u.hostname.replace('www.', '').split('.')[0], pageSize: 30 })
  ]);
  return findArticleByUrl(candidates, url);
};

const cleanSource = (article) => {
  if (!article) return '';
  if (article.source && typeof article.source === 'object') return article.source.name;
  return article.source || '';
};

export async function generateMetadata({ params }) {
  const p = await params;
  const url = decodeSlug(p.slug);
  if (!url) return { title: 'Article not found' };
  const article = await fetchArticle(url);
  if (!article) {
    return {
      title: 'Article',
      description: 'Read this story on Faisal News.'
    };
  }
  const source = cleanSource(article);
  const description = (article.description || article.content || 'Read this story on Faisal News.').slice(0, 200);
  return {
    title: article.title,
    description,
    authors: article.author ? [{ name: article.author }] : undefined,
    alternates: { canonical: `/news/${encodeURIComponent(article.url)}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description,
      url: `${SITE_URL}/news/${encodeURIComponent(article.url)}`,
      siteName: 'Faisal News',
      publishedTime: article.publishedAt,
      authors: article.author ? [article.author] : undefined,
      images: article.urlToImage ? [{ url: article.urlToImage, alt: article.title }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.urlToImage ? [article.urlToImage] : undefined
    },
    other: source ? { 'article:publisher': source } : undefined
  };
}

export default async function ArticlePage({ params }) {
  const p = await params;
  const url = decodeSlug(p.slug);
  if (!url) notFound();

  const article = await fetchArticle(url);
  if (!article) notFound();

  const source = cleanSource(article);
  const published = article.publishedAt ? new Date(article.publishedAt) : null;

  const related = await safeFetch('/api/news/search', {
    q: (article.title || '').split(' ').slice(0, 4).join(' ') || source,
    pageSize: 6
  });
  const relatedArticles = (related.articles || []).filter((a) => a.url && a.url !== article.url).slice(0, 6);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    image: article.urlToImage ? [article.urlToImage] : undefined,
    author: article.author ? [{ '@type': 'Person', name: article.author }] : undefined,
    publisher: {
      '@type': 'Organization',
      name: source || 'Faisal News'
    },
    description: article.description || undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/news/${encodeURIComponent(article.url)}` }
  };

  return (
    <ProtectedClient>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className={`${styles.shell} container`}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/news">News</Link>
          <span aria-hidden="true">·</span>
          {source ? <span>{source}</span> : null}
        </nav>

        <header className={styles.head}>
          <h1 className={styles.title}>{article.title}</h1>
          {article.description ? <p className={styles.dek}>{article.description}</p> : null}
          <div className={styles.meta}>
            {article.author ? <span>By {article.author}</span> : null}
            {published ? (
              <time dateTime={published.toISOString()}>{format(published, 'MMMM d, yyyy · h:mm a')}</time>
            ) : null}
          </div>
        </header>

        {article.urlToImage ? (
          <figure className={styles.figure}>
            <img src={article.urlToImage} alt={article.title} />
            <figcaption className={styles.figcap}>{source}</figcaption>
          </figure>
        ) : null}

        {article.content ? (
          <div className={styles.body}>
            <p>{article.content.replace(/\s*\[\+\d+ chars\]\s*$/, '')}</p>
          </div>
        ) : null}

        <div className={styles.actions}>
          <SaveArticleButton article={article} />
          <a className={styles.readOriginal} href={article.url} target="_blank" rel="noopener noreferrer">
            Read on {source || 'original site'} <ExternalLink size={16} />
          </a>
        </div>
      </article>

      {relatedArticles.length ? (
        <section className={`${styles.related} container`}>
          <header className={styles.relatedHead}>
            <h2 className={styles.relatedTitle}>Related stories</h2>
            <Link href="/news" className={styles.relatedLink}>
              All news <ArrowUpRight size={16} />
            </Link>
          </header>
          <ArticleGrid articles={relatedArticles} columns={3} />
        </section>
      ) : null}
    </ProtectedClient>
  );
}
