import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MenuItem } from '../types';
import { formatPrice } from '../utils/filter';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { getCountryFlag } from '../utils/countries';
import { buildItemSharePayload } from '../utils/shareHelpers';
import { LightboxImageData, normalizeLightboxImage } from '../utils/imageLightboxHelpers';
import { ShareButton } from './ShareButton';
import { X, Bookmark, Store, Leaf, ShieldCheck, Calendar, Clock, ArrowRight } from 'lucide-react';

interface ItemDetailModalProps {
  item: MenuItem | null;
  items?: MenuItem[];
  onClose: () => void;
  onToggleSave: (item: MenuItem) => void;
  onVisitShop: (shopId: string) => void;
  onViewImage?: (image: LightboxImageData) => void;
  onSelectItem?: (item: MenuItem) => void;
}

const SWIPE_CLOSE_THRESHOLD = 90;
const CLOSE_ANIMATION_MS = 220;

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  items,
  onClose,
  onToggleSave,
  onVisitShop,
  onViewImage,
  onSelectItem,
}) => {
  const { t } = useLanguage();
  const { selectedCountry } = useLocation();

  const [isClosing, setIsClosing] = useState(false);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDraggingDown, setIsDraggingDown] = useState(false);

  const scrollBodyRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);
  const gestureRef = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    offsetY: number;
    startedAtTop: boolean;
    axis: 'none' | 'x' | 'y' | 'scroll';
  } | null>(null);

  const currentIndex = items && item ? items.findIndex((i) => i.id === item.id) : -1;

  // Reset modal animation and drag state whenever a new item opens
  useEffect(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    isClosingRef.current = false;
    setIsClosing(false);
    setDragOffsetY(0);
    setIsDraggingDown(false);
    if (scrollBodyRef.current) {
      scrollBodyRef.current.scrollTop = 0;
    }
  }, [item?.id]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const triggerAnimatedClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsDraggingDown(false);
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      isClosingRef.current = false;
      setDragOffsetY(0);
      setIsClosing(false);
      onClose();
    }, CLOSE_ANIMATION_MS);
  }, [onClose]);

  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        triggerAnimatedClose();
        return;
      }
      if (!items || items.length <= 1 || currentIndex === -1) return;
      if (e.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        onSelectItem?.(items[prevIndex]);
      } else if (e.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % items.length;
        onSelectItem?.(items[nextIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, items, currentIndex, onSelectItem, triggerAnimatedClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isClosingRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const bodyEl = scrollBodyRef.current;
    const insideScrollBody = Boolean(bodyEl && e.target instanceof Node && bodyEl.contains(e.target));
    const startedAtTop = !insideScrollBody || (bodyEl ? bodyEl.scrollTop <= 2 : true);

    gestureRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      offsetY: 0,
      startedAtTop,
      axis: 'none',
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const g = gestureRef.current;
    if (!g || isClosingRef.current || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const dx = touch.clientX - g.startX;
    const dy = touch.clientY - g.startY;
    g.lastX = touch.clientX;

    if (g.axis === 'none') {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      const bodyAtTop = (scrollBodyRef.current?.scrollTop ?? 0) <= 2;
      if (Math.abs(dy) > Math.abs(dx)) {
        if (dy > 0 && g.startedAtTop && bodyAtTop) {
          g.axis = 'y';
        } else {
          g.axis = 'scroll';
        }
      } else {
        g.axis = 'x';
      }
    }

    if (g.axis === 'y') {
      const nextOffset = Math.max(0, Math.min(dy, 420));
      g.offsetY = nextOffset;
      setIsDraggingDown(true);
      setDragOffsetY(nextOffset);
    }
  };

  const handleTouchEnd = () => {
    const g = gestureRef.current;
    gestureRef.current = null;
    if (!g || isClosingRef.current) return;

    if (g.axis === 'y') {
      if (g.offsetY >= SWIPE_CLOSE_THRESHOLD) {
        triggerAnimatedClose();
      } else {
        setIsDraggingDown(false);
        setDragOffsetY(0);
      }
      return;
    }

    if (g.axis === 'x' && items && items.length > 1 && currentIndex !== -1) {
      const diffX = g.lastX - g.startX;
      const threshold = 50;
      if (diffX > threshold) {
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        onSelectItem?.(items[prevIndex]);
      } else if (diffX < -threshold) {
        const nextIndex = (currentIndex + 1) % items.length;
        onSelectItem?.(items[nextIndex]);
      }
    }
  };

  if (!item) return null;

  // Use the shop's country currency so saved items and dishes keep their genuine local currency
  const itemCurrencyCountry = item.shopCountry || item.country || selectedCountry;
  const formattedPrice = formatPrice(item.price, itemCurrencyCountry);
  const badgeLabel =
    item.menuType === 'SPECIAL'
      ? t.todaySpecial
      : item.menuType === 'WEEKLY'
      ? t.weeklyHighlight
      : t.masterMenu;
  const lightboxPayload = normalizeLightboxImage({
    src: item.image,
    alt: item.title,
    title: item.title,
    subtitle: [item.shopName, formattedPrice].filter(Boolean).join(' · '),
    badge: badgeLabel,
  });

  const dragProgress = Math.min(dragOffsetY / 320, 1);
  const backdropOpacityStyle = isDraggingDown
    ? { opacity: Math.max(0.12, 1 - dragProgress * 0.85) }
    : undefined;

  const cardDragStyle: React.CSSProperties | undefined = isDraggingDown
    ? {
        transform: `translateY(${dragOffsetY}px) scale(${1 - dragProgress * 0.06})`,
        opacity: Math.max(0.35, 1 - dragProgress * 0.6),
        transition: 'none',
      }
    : isClosing && dragOffsetY > 0
    ? {
        transform: `translateY(${Math.max(dragOffsetY + 140, 260)}px) scale(0.92)`,
        opacity: 0,
        transition: `transform ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.4, 0, 1, 1), opacity ${CLOSE_ANIMATION_MS}ms ease-out`,
      }
    : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      data-testid="item-detail-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerAnimatedClose();
        }
      }}
      style={backdropOpacityStyle}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs ${
        isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'
      }`}
    >
      <div
        data-testid="item-detail-modal-card"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={cardDragStyle}
        className={`bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] transition-transform duration-200 ${
          !isDraggingDown && !cardDragStyle
            ? isClosing
              ? 'animate-modal-card-out'
              : 'animate-modal-card-in'
            : ''
        }`}
      >
        {/* Mobile Swipe-Down Drag Handle */}
        <div
          aria-hidden="true"
          className="sm:hidden absolute top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center justify-center px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-xs"
        >
          <span className="w-9 h-1 rounded-full bg-white/90 shadow-xs" />
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={triggerAnimatedClose}
          data-testid="item-detail-close-btn"
          className="absolute right-3.5 top-3.5 z-10 p-1.5 rounded-full bg-black/50 text-stone-100 hover:bg-black/75 active:scale-90 transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative aspect-[16/10] w-full bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0">
          {lightboxPayload && onViewImage ? (
            <button
              type="button"
              onClick={() => onViewImage(lightboxPayload)}
              data-testid="item-detail-image-btn"
              aria-label={`View full image of ${item.title}`}
              className="block w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ) : (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Badges on image */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 pointer-events-none">
            {item.isVegetarian && (
              <span className="bg-emerald-600/90 text-white text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur">
                <Leaf className="w-3.5 h-3.5" />
                {t.vegetarian}
              </span>
            )}
            {item.isHalal && (
              <span className="bg-sky-700/90 text-white text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t.halal}
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur ${
                item.menuType === 'SPECIAL'
                  ? 'bg-rose-600'
                  : item.menuType === 'WEEKLY'
                  ? 'bg-amber-600'
                  : 'bg-stone-800'
              }`}
            >
              {item.menuType === 'SPECIAL'
                ? t.todaySpecial
                : item.menuType === 'WEEKLY'
                ? t.weeklyHighlight
                : t.masterMenu}
            </span>

            <span className="text-xl font-bold tabular-nums bg-stone-900/80 px-2.5 py-0.5 rounded backdrop-blur">
              {formatPrice(item.price, itemCurrencyCountry)}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div ref={scrollBodyRef} className="p-5 flex-1 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1 flex-wrap">
              <span className="font-semibold text-amber-700 dark:text-amber-400">{item.shopName}</span>
              {item.shopCountry && (
                <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                  <span>{getCountryFlag(item.shopCountry)}</span>
                  <span>{item.shopCountry}</span>
                </span>
              )}
              <span aria-hidden="true">·</span>
              <span>{item.category}</span>
            </div>

            <h2 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">{item.title}</h2>
          </div>

          <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
            {item.description}
          </p>

          {/* Schedule availability box */}
          {item.menuType === 'SPECIAL' && item.specialDate && (
            <div className="flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 p-2.5 rounded-lg">
              <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>
                <strong>{t.todaySpecial}:</strong> {t.servedOn} {item.specialDate}
              </span>
            </div>
          )}

          {item.menuType === 'WEEKLY' && item.availableDays && (
            <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 p-2.5 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>{t.weeklyHighlight}:</strong> {t.availableOn} {item.availableDays.join(', ')}
              </span>
            </div>
          )}

          {item.menuType === 'PERMANENT' && (
            <div className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 p-2.5 rounded-lg">
              <strong>{t.masterMenu}:</strong> {t.everyday}
            </div>
          )}

          {/* Direct Ordering Notice */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/70 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300">
            <p className="font-semibold text-stone-800 dark:text-stone-100 mb-0.5">Direct Kitchen Ordering</p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Orders for this dish are placed directly with the culinary team. Visit the shop profile below to connect via WhatsApp, Viber, LINE, or phone call.
            </p>
          </div>
        </div>

        {/* Footer actions: Save item + Share item + Prominent Visit Shop Profile */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/80 flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => onToggleSave(item)}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
              item.isSaved
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${item.isSaved ? 'fill-current text-amber-600 dark:text-amber-400' : ''}`} />
            <span>{item.isSaved ? t.saved : t.saveItem}</span>
          </button>

          <ShareButton
            variant="button"
            ariaLabel={`Share ${item.title}`}
            getPayload={() =>
              buildItemSharePayload(
                { id: item.id, title: item.title, shopName: item.shopName },
                typeof window !== 'undefined' ? window.location.href : 'https://burmeal.app/'
              )
            }
          />

          <button
            type="button"
            data-testid="visit-shop-profile-btn"
            onClick={() => {
              onClose();
              onVisitShop(item.shopId);
            }}
            className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.97] cursor-pointer min-w-[170px]"
          >
            <Store className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            <span>{t.viewShopProfile} & {t.contactShop}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Dot Indicators */}
        {items && items.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-2.5 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 shrink-0">
            {items.slice(0, 15).map((it, idx) => (
              <button
                key={it.id}
                onClick={() => onSelectItem?.(it)}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 h-2 bg-amber-600 dark:bg-amber-500'
                    : 'w-2 h-2 bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'
                }`}
                aria-label={`Go to item ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
