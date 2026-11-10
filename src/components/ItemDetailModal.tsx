import React from 'react';
import { MenuItem } from '../types';
import { formatPrice } from '../utils/filter';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { X, Bookmark, Store, Leaf, ShieldCheck, Calendar, Clock, ArrowRight } from 'lucide-react';

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onToggleSave: (item: MenuItem) => void;
  onVisitShop: (shopId: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onToggleSave,
  onVisitShop,
}) => {
  const { t } = useLanguage();
  const { selectedCountry } = useLocation();
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-stone-200 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-10 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges on image */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
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

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
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
              {formatPrice(item.price, selectedCountry)}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span className="font-semibold text-amber-700">{item.shopName}</span>
              <span aria-hidden="true">·</span>
              <span>{item.category}</span>
            </div>

            <h2 className="text-xl font-bold font-display text-stone-900">{item.title}</h2>
          </div>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            {item.description}
          </p>

          {/* Schedule availability box */}
          {item.menuType === 'SPECIAL' && item.specialDate && (
            <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
              <Calendar className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>{t.todaySpecial}:</strong> {t.servedOn} {item.specialDate}
              </span>
            </div>
          )}

          {item.menuType === 'WEEKLY' && item.availableDays && (
            <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>{t.weeklyHighlight}:</strong> {t.availableOn} {item.availableDays.join(', ')}
              </span>
            </div>
          )}

          {item.menuType === 'PERMANENT' && (
            <div className="text-xs text-stone-600 bg-stone-50 border border-stone-200 p-2.5 rounded-lg">
              <strong>{t.masterMenu}:</strong> {t.everyday}
            </div>
          )}

          {/* Direct Ordering Notice */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
            <p className="font-semibold text-stone-800 mb-0.5">Direct Kitchen Ordering</p>
            <p className="text-[11px] text-stone-500">
              Orders for this dish are placed directly with the culinary team. Visit the shop profile below to connect via WhatsApp, Viber, LINE, or phone call.
            </p>
          </div>
        </div>

        {/* Footer actions: Save item + Prominent Visit Shop Profile */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/80 flex items-center gap-3">
          <button
            onClick={() => onToggleSave(item)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
              item.isSaved
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${item.isSaved ? 'fill-current text-amber-600' : ''}`} />
            <span>{item.isSaved ? t.saved : t.saveItem}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onVisitShop(item.shopId);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>{t.viewShopProfile} & {t.contactShop}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
