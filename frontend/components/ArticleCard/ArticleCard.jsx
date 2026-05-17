import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';
import styles from './ArticleCard.module.css';

const slugifyUrl = (url) => encodeURIComponent(url);

const cleanSource = (article) => {
  if (article.source && typeof article.source === 'object') return article.source.name;
  return article.source || '';
};

export default function ArticleCard({ article, variant = 'default' }) {
  if (!article || !article.url) return null;
  const slug = slugifyUrl(article.url);
  const published = article.publishedAt ? new Date(article.publishedAt) : null;
  const source = cleanSource(article);
  const klass = `${styles.card} ${variant === 'feature' ? styles.feature : ''} ${variant === 'compact' ? styles.compact : ''}`;

  return (
    <article className={klass}>
      <Link href={`/news/${slug}`} className={styles.media} aria-label={article.title}>
        {article.urlToImage ? (
          <img src={article.urlToImage} alt="" loading="lazy" />
        ) : (
          <div className={styles.fallback} aria-hidden="true">
            <span>{source ? source.slice(0, 2) : 'NW'}</span>
          </div>
        )}
      </Link>
      <div className={styles.body}>
        <div className={styles.meta}>
          {source ? <span className={styles.source}>{source}</span> : null}
          {published ? <time dateTime={published.toISOString()}>{formatDistanceToNow(published, { addSuffix: true })}</time> : null}
        </div>
        <h3 className={styles.title}>
          <Link href={`/news/${slug}`}>{article.title}</Link>
        </h3>
        {article.description ? <p className={styles.desc}>{article.description}</p> : null}
        <Link href={`/news/${slug}`} className={styles.cta}>
          Read story <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
