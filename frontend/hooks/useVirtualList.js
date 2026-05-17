'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export default function useVirtualList({ items, rowHeight, overscan = 4, containerRef }) {
  const [range, setRange] = useState({ start: 0, end: Math.min(items.length, 20) });
  const sentinelTopRef = useRef(null);
  const sentinelBottomRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const target = containerRef && containerRef.current ? containerRef.current : window;
    const isWindow = target === window;

    const compute = () => {
      const scrollTop = isWindow ? window.scrollY : target.scrollTop;
      const viewport = isWindow ? window.innerHeight : target.clientHeight;
      const offset = scrollRef.current ? scrollRef.current.getBoundingClientRect().top + (isWindow ? window.scrollY : target.scrollTop) - (isWindow ? 0 : target.getBoundingClientRect().top) : 0;
      const relTop = Math.max(0, scrollTop - offset);
      const startIdx = Math.max(0, Math.floor(relTop / rowHeight) - overscan);
      const visibleCount = Math.ceil(viewport / rowHeight) + overscan * 2;
      const endIdx = Math.min(items.length, startIdx + visibleCount);
      setRange({ start: startIdx, end: endIdx });
    };

    compute();
    target.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      target.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [items.length, rowHeight, overscan, containerRef]);

  const visibleItems = useMemo(() => items.slice(range.start, range.end), [items, range]);
  const topPadding = range.start * rowHeight;
  const bottomPadding = Math.max(0, (items.length - range.end) * rowHeight);

  return { visibleItems, topPadding, bottomPadding, scrollRef, sentinelTopRef, sentinelBottomRef, range };
}
