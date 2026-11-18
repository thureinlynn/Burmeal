import React from 'react';
import { DailySpecialPost } from '../types';
import { getCountryFlag } from '../utils/countries';
import {
  formatDailySpecialTimestamp,
  formatRemainingTime,
  getDailySpecialToggleLabel,
  hasLineClampOverflow,
  shouldShowDailySpecialMoreToggle,
} from '../utils/dailySpecialHelpers';
import { buildDailySpecialSharePayload } from '../utils/shareHelpers';
import { LightboxImageData, normalizeLightboxImage } from '../utils/imageLightboxHelpers';
import { ShareButton } from './ShareButton';
import { ArrowRight, Clock, Edit2, Store, Trash2 } from 'lucide-react';

interface DailySpecialFeedCardProps {
  post: DailySpecialPost;
  onSelectShop?: (shopId: string) => void;
  onEdit?: (post: DailySpecialPost) => void;
  onDelete?: (post: DailySpecialPost) => void;
  onViewImage?: (image: LightboxImageData) => void;
  isDeleting?: boolean;
  hideVisitShopAction?: boolean;
}

export const DailySpecialFeedCard: React.FC<DailySpecialFeedCardProps> = ({
  post,
  onSelectShop,
  onEdit,
  onDelete,
  onViewImage,
  isDeleting = false,
  hideVisitShopAction = false,
}) => {
  const [avatarFailed, setAvatarFailed] = React.useState(false);
  const [imageFailed, setImageFailed] = React.useState(false);
  const [isPostExpanded, setIsPostExpanded] = React.useState(false);
  const [isPostOverflowing, setIsPostOverflowing] = React.useState(false);
  const postParagraphRef = React.useRef<HTMLParagraphElement | null>(null);

  React.useEffect(() => {
    setIsPostExpanded(false);
  }, [post.id, post.post]);

  React.useLayoutEffect(() => {
    const el = postParagraphRef.current;
    if (!el || isPostExpanded) return;

    const measure = () => {
      setIsPostOverflowing(hasLineClampOverflow(el.scrollHeight, el.clientHeight));
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
  }, [post.post, isPostExpanded]);

  const showMoreToggle = shouldShowDailySpecialMoreToggle(isPostExpanded, isPostOverflowing);

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
            variant="icon-box"
            ariaLabel={`Share ${post.title}`}
            getPayload={() =>
              buildDailySpecialSharePayload(
                { shopId: post.shopId, shopName: post.shopName, title: post.title },
                typeof window !== 'undefined' ? window.location.href : 'https://burmeal.app/'
              )
            }
          />
          {onEdit && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onEdit(post)}
              aria-label={`Edit ${post.title}`}
              title="Edit Daily Special Post"
              data-testid={`edit-daily-special-${post.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}
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
      <div className="px-4 sm:px-5 pb-3.5">
        <h3 className="text-base sm:text-lg font-bold font-display text-stone-900 dark:text-stone-100 leading-snug mb-2">
          {post.title}
        </h3>
        <p
          ref={postParagraphRef}
          data-testid={`daily-special-body-${post.id}`}
          className={`text-sm text-stone-700 dark:text-stone-300 whitespace-pre-line leading-relaxed ${
            isPostExpanded ? '' : 'line-clamp-3'
          }`}
        >
          {post.post}
        </p>
        {showMoreToggle && (
          <button
            type="button"
            onClick={() => setIsPostExpanded((prev) => !prev)}
            data-testid={`daily-special-more-${post.id}`}
            aria-expanded={isPostExpanded}
            className="mt-0.5 inline-block text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline cursor-pointer"
          >
            {getDailySpecialToggleLabel(isPostExpanded)}
          </button>
        )}
      </div>

      {/* Optional Uploaded Photo */}
      {post.image && !imageFailed && (
        <div className="bg-stone-100 dark:bg-stone-950 border-t border-b border-stone-100 dark:border-stone-800">
          {onViewImage ? (
            <button
              type="button"
              onClick={() => {
                const payload = normalizeLightboxImage({
                  src: post.image,
                  alt: post.title,
                  title: post.title,
                  subtitle: post.shopName,
                  badge: 'Daily Special (48h)',
                });
                if (payload) onViewImage(payload);
              }}
              data-testid={`daily-special-image-btn-${post.id}`}
              aria-label={`View full image of ${post.title}`}
              className="block w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <img
                src={post.image}
                alt={post.title}
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="w-full max-h-[480px] object-cover mx-auto block"
              />
            </button>
          ) : (
            <img
              src={post.image}
              alt={post.title}
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="w-full max-h-[480px] object-cover mx-auto block"
            />
          )}
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
