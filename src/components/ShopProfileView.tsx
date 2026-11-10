import React, { useState } from 'react';
import { Shop, MenuItem, MenuType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { buildContactLinks } from '../utils/filter';
import { getCountryFlag } from '../utils/countries';
import { MenuCard } from './MenuCard';
import {
  MapPin,
  Heart,
  MessageCircle,
  Phone,
  Store,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Building,
  Navigation,
} from 'lucide-react';

interface ShopProfileViewProps {
  shop: Shop;
  menuItems: MenuItem[];
  onBack: () => void;
  onFollowToggle: (shopId: string) => void;
  onToggleSave: (item: MenuItem) => void;
  onSelectItem: (item: MenuItem) => void;
}

export const ShopProfileView: React.FC<ShopProfileViewProps> = ({
  shop,
  menuItems,
  onBack,
  onFollowToggle,
  onToggleSave,
  onSelectItem,
}) => {
  const { t } = useLanguage();
  const [selectedMenuType, setSelectedMenuType] = useState<MenuType | 'ALL'>('ALL');

  const contact = buildContactLinks({
    whatsappPhone: shop.whatsappPhone,
    viberPhone: shop.viberPhone,
    lineId: shop.lineId,
    facebookUrl: shop.facebookUrl,
    phoneNumber: shop.phoneNumber,
    shopName: shop.name,
  });

  const filteredItems = menuItems.filter((i) => {
    if (selectedMenuType === 'ALL') return true;
    return i.menuType === selectedMenuType;
  });

  const countryFlag = getCountryFlag(shop.country);

  return (
    <div className="space-y-6">
      {/* Top back button */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>
      </div>

      {/* Shop Cover & Profile Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs transition-colors">
        <div className="relative h-44 sm:h-64 w-full bg-stone-900 overflow-hidden">
          <img
            src={shop.coverImage}
            alt={shop.name}
            className="w-full h-full object-cover opacity-85"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Follow button in top right */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => onFollowToggle(shop.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md backdrop-blur ${
                (shop as any).isFollowed
                  ? 'bg-rose-600 text-white'
                  : 'bg-white/90 text-stone-900 hover:bg-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${(shop as any).isFollowed ? 'fill-current' : ''}`} />
              <span>{(shop as any).isFollowed ? t.following : t.follow}</span>
            </button>
          </div>

          {/* Bottom Title & Details */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3 text-white">
            <img
              src={shop.avatarImage}
              alt={shop.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-white object-cover bg-stone-800 shadow-md shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-widest block truncate">
                {shop.cuisineType}
              </span>
              <h1 className="text-xl sm:text-3xl font-bold font-display text-white truncate">
                {shop.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-stone-200 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 truncate font-medium">
                  <span className="text-sm" role="img" aria-label={shop.country || 'Country'}>
                    {countryFlag}
                  </span>
                  <span>{shop.city || shop.locationArea}</span>
                  {shop.region && <span className="opacity-80">· {shop.region}</span>}
                  {shop.country && <span className="opacity-90">({shop.country})</span>}
                </span>
                <span>·</span>
                <span className="tabular-nums">{shop.followerCount || 0} {t.followers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Full Address Section */}
        <div className="p-4 sm:p-6 bg-stone-50/50 dark:bg-stone-850/50 border-b border-stone-200 dark:border-stone-800 space-y-3">
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed max-w-3xl">
            {shop.bio}
          </p>

          {/* Location & Address Display with Country and Flag */}
          <div className="p-3.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span>{shop.address || shop.locationArea}</span>
                  <span className="text-sm">{countryFlag}</span>
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  {[shop.city, shop.region, shop.country].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>

            {shop.phoneNumber && (
              <a
                href={`tel:${shop.phoneNumber}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-lg self-end sm:self-auto transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{shop.phoneNumber}</span>
              </a>
            )}
          </div>

          {/* Direct Contact & Kitchen Pick-Up Insight Banner */}
          <div className="p-3.5 bg-amber-500/10 dark:bg-amber-950/40 rounded-xl border border-amber-300/60 dark:border-amber-800/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <span>Direct Contact &bull; Kitchen Pick-Up Model</span>
              </h4>
              <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed mt-0.5">
                BurMeal connects you directly with authentic Burmese home cooks. Reach out via WhatsApp, Viber, or phone to place your order, confirm availability, and pick up fresh homemade motherland food directly at this kitchen address.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 4: DEDICATED CONTACT & DIRECT ORDERING SECTION */}
        <div id="contact-channels" className="p-4 sm:p-6 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <h2 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100 uppercase tracking-wide">
              {t.contactChannels}
            </h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mb-4">
            {t.orderNote}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {contact.whatsappUrl ? (
              <a
                href={contact.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            ) : (
              <div className="py-2.5 px-3 bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 rounded-xl text-xs text-center border border-stone-200 dark:border-stone-700 font-medium select-none">
                WhatsApp N/A
              </div>
            )}

            {contact.viberUrl ? (
              <a
                href={contact.viberUrl}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>Viber Chat</span>
              </a>
            ) : (
              <div className="py-2.5 px-3 bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 rounded-xl text-xs text-center border border-stone-200 dark:border-stone-700 font-medium select-none">
                Viber N/A
              </div>
            )}

            {contact.lineUrl ? (
              <a
                href={contact.lineUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>LINE Order</span>
              </a>
            ) : (
              <div className="py-2.5 px-3 bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 rounded-xl text-xs text-center border border-stone-200 dark:border-stone-700 font-medium select-none">
                LINE N/A
              </div>
            )}

            {contact.fbUrl ? (
              <a
                href={contact.fbUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>Facebook</span>
              </a>
            ) : contact.telUrl ? (
              <a
                href={contact.telUrl}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-900 dark:bg-stone-700 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Kitchen</span>
              </a>
            ) : (
              <div className="py-2.5 px-3 bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 rounded-xl text-xs text-center border border-stone-200 dark:border-stone-700 font-medium select-none">
                Phone N/A
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3 Menu Types Filter Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setSelectedMenuType('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedMenuType === 'ALL'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {t.allMenus} ({menuItems.length})
          </button>
          <button
            onClick={() => setSelectedMenuType('SPECIAL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedMenuType === 'SPECIAL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-rose-600'
            }`}
          >
            {t.dailySpecials}
          </button>
          <button
            onClick={() => setSelectedMenuType('WEEKLY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedMenuType === 'WEEKLY'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-amber-600'
            }`}
          >
            {t.weeklyMenus}
          </button>
          <button
            onClick={() => setSelectedMenuType('PERMANENT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedMenuType === 'PERMANENT'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            {t.regularMaster}
          </button>
        </div>

        <span className="text-xs text-stone-400 dark:text-stone-500">
          {filteredItems.length} {t.dishes}
        </span>
      </div>

      {/* Dishes Grid (at least 2 items per row in mobile UI) */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-8 text-center text-xs text-stone-400">
          {t.noDishesFound}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onToggleSave={onToggleSave}
              onSelectItem={onSelectItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};
