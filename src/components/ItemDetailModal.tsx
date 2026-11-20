import React, { useState, useEffect } from 'react';
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

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const currentIndex = items && item ? items.findIndex((i) => i.id === item.id) : -1;

  useEffect(() => {
    if (!items || items.length <= 1 || currentIndex === -1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [items, currentIndex, onSelectItem]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchEndX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null || !items || items.length <= 1 || currentIndex === -1) {
      setTouchStartX(null);
      setTouchEndX(null);
      return;
    }
    const diffX = touchEndX - touchStartX;
    const threshold = 50;
    if (diffX > threshold) {
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      onSelectItem?.(items[prevIndex]);
    } else if (diffX < -threshold) {
      const nextIndex = (currentIndex + 1) % items.length;
      onSelectItem?.(items[nextIndex]);
    }
    setTouchStartX(null);
    setTouchEndX(null);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-250"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-10 p-1.5 rounded-full bg-black/50 text-stone-100 hover:bg-black/70 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative aspect-[16/10] w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
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
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
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
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/80 flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onToggleSave(item)}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
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
            onClick={() => {
              onClose();
              onVisitShop(item.shopId);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer min-w-[170px]"
          >
            <Store className="w-4 h-4" />
            <span>{t.viewShopProfile} & {t.contactShop}</span>
            <ArrowRight className="w-4 h-4" />
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
