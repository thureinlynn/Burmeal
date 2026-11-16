import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getNextVisibleLimit,
  hasRemainingItems,
  isNearBottomForLoadMore,
  slicePaginatedItems,
} from '../utils/paginationHelpers';

export function useInfiniteScrollLimit<T>(
  items: readonly T[],
  pageSize: number,
  resetKey: string,
  enabled: boolean = true
): {
  visibleItems: T[];
  visibleCount: number;
  totalCount: number;
  hasMore: boolean;
  loadMore: () => void;
  sentinelRef: RefObject<HTMLDivElement | null>;
} {
  const [visibleLimit, setVisibleLimit] = useState<number>(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasUserScrolledRef = useRef<boolean>(false);
  const lastLoadAtRef = useRef<number>(0);

  const totalCount = items.length;

  useEffect(() => {
    setVisibleLimit(pageSize);
    hasUserScrolledRef.current = false;
    lastLoadAtRef.current = 0;
  }, [pageSize, resetKey]);

  const loadMore = useCallback(() => {
    const now = Date.now();
    if (now - lastLoadAtRef.current < 140) return;
    lastLoadAtRef.current = now;
    setVisibleLimit((prev) => getNextVisibleLimit(prev, totalCount, pageSize));
  }, [pageSize, totalCount]);

  const hasMore = hasRemainingItems(visibleLimit, totalCount);

  useEffect(() => {
    if (!enabled || !hasMore || typeof window === 'undefined') return;

    const markScrolledAndCheck = () => {
      hasUserScrolledRef.current = true;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const viewportH = window.innerHeight || 0;
      const docH = document.documentElement?.scrollHeight || document.body?.scrollHeight || 0;
      if (isNearBottomForLoadMore(scrollY, viewportH, docH, 280)) {
        loadMore();
      }
    };

    const markScrolled = () => {
      hasUserScrolledRef.current = true;
    };

    window.addEventListener('scroll', markScrolledAndCheck, { passive: true });
    window.addEventListener('wheel', markScrolled, { passive: true });
    window.addEventListener('touchmove', markScrolled, { passive: true });

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && sentinelRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const scrollY = window.scrollY || window.pageYOffset || 0;
          if (entry?.isIntersecting && (hasUserScrolledRef.current || scrollY > 12)) {
            loadMore();
          }
        },
        { rootMargin: '220px 0px', threshold: 0 }
      );
      observer.observe(sentinelRef.current);
    }

    return () => {
      window.removeEventListener('scroll', markScrolledAndCheck);
      window.removeEventListener('wheel', markScrolled);
      window.removeEventListener('touchmove', markScrolled);
      observer?.disconnect();
    };
  }, [enabled, hasMore, loadMore, visibleLimit]);

  const visibleItems = useMemo(
    () => slicePaginatedItems(items, visibleLimit),
    [items, visibleLimit]
  );

  return {
    visibleItems,
    visibleCount: Math.min(visibleLimit, totalCount),
    totalCount,
    hasMore,
    loadMore,
    sentinelRef,
  };
}
