import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollLoadMoreSentinelProps {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  visibleCount: number;
  totalCount: number;
  pageSize: number;
  hasMore: boolean;
  onLoadMore: () => void;
  itemLabel?: string;
}

export const ScrollLoadMoreSentinel: React.FC<ScrollLoadMoreSentinelProps> = ({
  sentinelRef,
  visibleCount,
  totalCount,
  pageSize,
  hasMore,
  onLoadMore,
  itemLabel = 'items',
}) => {
  if (!hasMore || totalCount === 0) return null;

  const remaining = Math.max(0, totalCount - visibleCount);
  const nextBatch = Math.min(pageSize, remaining);

  return (
    <div
      ref={sentinelRef}
      data-testid="scroll-load-more-sentinel"
      className="pt-4 pb-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 text-center"
    >
      <span className="text-xs font-medium text-stone-500 dark:text-stone-400 tabular-nums">
        Showing {visibleCount} of {totalCount} {itemLabel}
      </span>
      <button
        type="button"
        onClick={onLoadMore}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition-colors cursor-pointer"
      >
        <span>Load {nextBatch} more</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
