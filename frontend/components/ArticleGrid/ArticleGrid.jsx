'use client';

import { useMemo, useRef } from 'react';
import ArticleCard from '@/components/ArticleCard/ArticleCard';
import useVirtualList from '@/hooks/useVirtualList';
import styles from './ArticleGrid.module.css';

const ROW_HEIGHT = 420;
const VIRTUAL_THRESHOLD = 30;

const groupIntoRows = (items, columns) => {
  const rows = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }
  return rows;
};

export default function ArticleGrid({ articles, columns = 3 }) {
  const containerRef = useRef(null);
  const rows = useMemo(() => groupIntoRows(articles, columns), [articles, columns]);
  const virtualize = articles.length > VIRTUAL_THRESHOLD;

  const { visibleItems, topPadding, bottomPadding, scrollRef } = useVirtualList({
    items: rows,
    rowHeight: ROW_HEIGHT,
    overscan: 2,
    containerRef
  });

  if (!articles.length) return null;

  if (!virtualize) {
    return (
      <div className={styles.grid} style={{ '--cols': columns }}>
        {articles.map((a) => (
          <ArticleCard key={a.url} article={a} />
        ))}
      </div>
    );
  }

  return (
    <div ref={scrollRef} className={styles.virtualWrap}>
      <div style={{ height: topPadding }} />
      {visibleItems.map((row, idx) => (
        <div key={`row-${idx}`} className={styles.row} style={{ minHeight: ROW_HEIGHT, '--cols': columns }}>
          {row.map((a) => (
            <ArticleCard key={a.url} article={a} />
          ))}
        </div>
      ))}
      <div style={{ height: bottomPadding }} />
    </div>
  );
}
