import React from 'react';
import { DailySpecialPost } from '../types';
import { getCountryFlag } from '../utils/countries';
import {
  formatDailySpecialTimestamp,
  formatRemainingTime,
} from '../utils/dailySpecialHelpers';
import { buildDailySpecialSharePayload } from '../utils/shareHelpers';
import { ShareButton } from './ShareButton';
import { ArrowRight, Clock, Store, Trash2 } from 'lucide-react';

interface DailySpecialFeedCardProps {
  post: DailySpecialPost;
  onSelectShop?: (shopId: string) => void;
  onDelete?: (post: DailySpecialPost) => void;
  isDeleting?: boolean;
  hideVisitShopAction?: boolean;
}

export const DailySpecialFeedCard: React.FC<DailySpecialFeedCardProps> = ({
  post,
  onSelectShop,
  onDelete,
  isDeleting = false,
  hideVisitShopAction = false,
}) => {
  const [avatarFailed, setAvatarFailed] = React.useState(false);
  const [imageFailed, setImageFailed] = React.useState(false);

  const countryFlag = getCountryFlag(post.shopCountry);
  const uploadTimestamp = formatDailySpecialTimestamp(post.createdAt);
  const remainingLabel = formatRemainingTime(post);
  const locationLabel = [post.shopCity, post.shopRegion].filter(Boolean).join(', ');

  return (
    <article
      data-testid={`daily-special-post-${post.id}`}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden transition-colors"
    >
      {/* Post Header: Shop Avatar + Name + Exact Upload Date & Time + Actions */}
      <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {post.shopAvatarImage && !avatarFailed ? (
            <img
              src={post.shopAvatarImage}
              alt={post.shopName}
              onError={() => setAvatarFailed(true)}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {onSelectShop ? (
                <button
                  type="button"
                  onClick={() => onSelectShop(post.shopId)}
                  className="text-sm font-bold text-stone-900 dark:text-stone-100 hover:text-amber-700 dark:hover:text-amber-400 hover:underline truncate cursor-pointer"
                >
                  {post.shopName}
                </button>
              ) : (
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  {post.shopName}
                </span>
              )}
              {post.shopCountry && (
                <span className="text-sm shrink-0" title={post.shopCountry}>
                  {countryFlag}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              <time
                dateTime={post.createdAt}
                className="font-medium text-stone-600 dark:text-stone-300"
              >
                {uploadTimestamp}
              </time>
              {locationLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate max-w-[180px]">{locationLabel}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium tabular-nums">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{remainingLabel}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <ShareButton
            variant="icon-inline"
            ariaLabel={`Share ${post.title}`}
            getPayload={() =>
              buildDailySpecialSharePayload(
                { shopId: post.shopId, shopName: post.shopName, title: post.title },
                typeof window !== 'undefined' ? window.location.href : 'https://burmeal.app/'
              )
            }
          />
          {onDelete && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(post)}
              aria-label={`Delete ${post.title}`}
              title="Delete Daily Special Post"
              className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Title & Prose */}
      <div className="px-4 sm:px-5 pb-3.5 space-y-2">
        <h3 className="text-base sm:text-lg font-bold font-display text-stone-900 dark:text-stone-100 leading-snug">
          {post.title}
        </h3>
        <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-line leading-relaxed">
          {post.post}
        </p>
      </div>

      {/* Optional Uploaded Photo */}
      {post.image && !imageFailed && (
        <div className="bg-stone-100 dark:bg-stone-950 border-t border-b border-stone-100 dark:border-stone-800">
          <img
            src={post.image}
            alt={post.title}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full max-h-[480px] object-cover mx-auto block"
          />
        </div>
      )}

      {/* Post Footer */}
      <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 text-xs border-t border-stone-100 dark:border-stone-800">
        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          Daily Special (48h)
        </span>
        {!hideVisitShopAction && onSelectShop && (
          <button
            type="button"
            onClick={() => onSelectShop(post.shopId)}
            className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer"
          >
            <span>Visit Shop &amp; Contact</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </article>
  );
};
