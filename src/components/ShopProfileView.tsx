import React, { useState, useEffect } from 'react';
import { Shop, MenuItem, MenuType, DailySpecialPost } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { buildContactLinks } from '../utils/filter';
import { getCountryFlag } from '../utils/countries';
import { resolveCoverDesign, getLocalCountryCoverDesign } from '../utils/coverDesigns';
import {
  buildGoogleMapsDirectionsUrl,
  getShopProfileImage,
  hasValidCoordinates,
} from '../utils/shopLocationHelpers';
import { partitionDailySpecialPosts } from '../utils/dailySpecialHelpers';
import { PAGE_LIMITS } from '../utils/paginationHelpers';
import { useInfiniteScrollLimit } from '../hooks/useInfiniteScrollLimit';
import { buildShopSharePayload } from '../utils/shareHelpers';
import { LightboxImageData } from '../utils/imageLightboxHelpers';
import { ShareButton } from './ShareButton';
import { MenuCard } from './MenuCard';
import { DailySpecialFeedCard } from './DailySpecialFeedCard';
import { ScrollLoadMoreSentinel } from './ScrollLoadMoreSentinel';
import {
  MapPin,
  Heart,
  MessageCircle,
  Phone,
  Store,
  ArrowLeft,
  Sparkles,
  Navigation,
  Megaphone,
} from 'lucide-react';

interface ShopProfileViewProps {
  shop: Shop;
  menuItems: MenuItem[];
  dailySpecialPosts?: DailySpecialPost[];
  onBack: () => void;
  onFollowToggle: (shopId: string) => void;
  onToggleSave: (item: MenuItem) => void;
  onSelectItem: (item: MenuItem) => void;
  onViewImage?: (image: LightboxImageData) => void;
}

export const ShopProfileView: React.FC<ShopProfileViewProps> = ({
  shop,
  menuItems,
  dailySpecialPosts = [],
  onBack,
  onFollowToggle,
  onToggleSave,
  onSelectItem,
  onViewImage,
}) => {
  const { t } = useLanguage();
  const [selectedMenuType, setSelectedMenuType] = useState<MenuType>('ALL');
  const [coverSrc, setCoverSrc] = useState<string>(() =>
    resolveCoverDesign(shop.coverImage, shop.country, shop.region)
  );
  const [profileImgFailed, setProfileImgFailed] = useState(false);

  const profileImageSrc = getShopProfileImage(shop);

  useEffect(() => {
    setCoverSrc(resolveCoverDesign(shop.coverImage, shop.country, shop.region));
  }, [shop.coverImage, shop.country, shop.region]);

  useEffect(() => {
    setProfileImgFailed(false);
  }, [profileImageSrc]);

  const contact = buildContactLinks({
    whatsappPhone: shop.whatsappPhone,
    viberPhone: shop.viberPhone,
    lineId: shop.lineId,
    facebookUrl: shop.facebookUrl,
    phoneNumber: shop.phoneNumber,
    shopName: shop.name,
  });

  const singleActiveSpecialPost = React.useMemo(() => {
    const shopOnly = dailySpecialPosts.filter((p) => p.shopId === shop.id);
    const active = partitionDailySpecialPosts(shopOnly).active;
    if (active.length === 0) return null;
    const p = active[0];
    return {
      ...p,
      shopName: p.shopName || shop.name,
      shopAvatarImage: p.shopAvatarImage || profileImageSrc,
      shopCountry: p.shopCountry || shop.country,
      shopRegion: p.shopRegion || shop.region,
      shopCity: p.shopCity || shop.city,
    };
  }, [dailySpecialPosts, shop, profileImageSrc]);

  const weeklyItems = React.useMemo(
    () => menuItems.filter((i) => i.menuType === 'WEEKLY'),
    [menuItems]
  );
  const regularItems = React.useMemo(
    () => menuItems.filter((i) => i.menuType === 'PERMANENT'),
    [menuItems]
  );
  const allMenuItems = React.useMemo(
    () => menuItems.filter((i) => i.menuType === 'WEEKLY' || i.menuType === 'PERMANENT'),
    [menuItems]
  );
  const filteredItems =
    selectedMenuType === 'WEEKLY'
      ? weeklyItems
      : selectedMenuType === 'PERMANENT'
      ? regularItems
      : allMenuItems;

  const paginatedDishes = useInfiniteScrollLimit(
    filteredItems,
    PAGE_LIMITS.WEEKLY_AND_MASTER,
    `${shop.id}:${selectedMenuType}`,
    true
  );

  const countryFlag = getCountryFlag(shop.country);
  const directionsUrl = buildGoogleMapsDirectionsUrl(shop);
  const hasPinnedCoords = hasValidCoordinates(shop.latitude, shop.longitude);

  return (
    <div
      key={shop.id}
      data-testid="shop-profile-view"
      className="space-y-6 animate-shop-expand"
    >
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
            src={coverSrc}
            alt={shop.name}
            className="w-full h-full object-cover opacity-85"
            referrerPolicy="no-referrer"
            onError={() => {
              const fallback = getLocalCountryCoverDesign(shop.country, shop.region);
              if (coverSrc !== fallback) setCoverSrc(fallback);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Share & Follow buttons in top right */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <ShareButton
              variant="banner-button"
              ariaLabel={`Share ${shop.name}`}
              getPayload={() =>
                buildShopSharePayload(
                  { id: shop.id, name: shop.name, city: shop.city, country: shop.country },
                  typeof window !== 'undefined' ? window.location.href : 'https://burmeal.app/'
                )
              }
            />
            <button
              onClick={() => onFollowToggle(shop.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md backdrop-blur ${
                (shop as any).isFollowed
                  ? 'bg-rose-600 text-white'
                  : 'bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 hover:bg-white dark:hover:bg-stone-800 dark:border dark:border-stone-700'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${(shop as any).isFollowed ? 'fill-current' : ''}`} />
              <span>{(shop as any).isFollowed ? t.following : t.follow}</span>
            </button>
          </div>

          {/* Bottom Title & Details */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3 text-white">
            {profileImageSrc && !profileImgFailed ? (
              <img
                src={profileImageSrc}
                alt={shop.name}
                onError={() => setProfileImgFailed(true)}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-white dark:border-stone-700 object-cover bg-stone-800 shadow-md shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-white/90 dark:border-stone-700 bg-amber-600/90 text-white flex items-center justify-center shadow-md shrink-0">
                <Store className="w-7 h-7" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-widest block truncate">
                {shop.cuisineType}
              </span>
              <h1 className="text-xl sm:text-3xl font-bold font-display text-white truncate">
                {shop.name}
              </h1>
              <div className="flex items-center gap-x-2 gap-y-0.5 text-xs text-stone-200 mt-0.5 flex-wrap">
                <span className="flex items-center flex-wrap gap-x-1 font-medium max-w-full">
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
        <div className="p-4 sm:p-6 bg-stone-50/50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 space-y-3">
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed max-w-3xl">
            {shop.bio}
          </p>

          {/* Location & Address Display with Country, Flag, and Direction Button */}
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
                {hasPinnedCoords && (
                  <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Map Pin: {Number(shop.latitude).toFixed(5)}, {Number(shop.longitude).toFixed(5)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Direction</span>
                </a>
              )}

              {shop.phoneNumber && (
                <a
                  href={`tel:${shop.phoneNumber}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{shop.phoneNumber}</span>
                </a>
              )}
            </div>
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

      {/* Single Active Daily Special Post (Moved out of menu tabs: shown at end of contact, before All Item / Weekly Highlights / Regular Menu) */}
      {singleActiveSpecialPost && (
        <section aria-label={t.dailySpecialButton} className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2 uppercase tracking-wide">
              <Megaphone className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>{t.dailySpecialButton}</span>
            </h2>
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              48h update
            </span>
          </div>
          <DailySpecialFeedCard
            post={singleActiveSpecialPost}
            onViewImage={onViewImage}
            hideVisitShopAction
          />
        </section>
      )}

      {/* Menu Tabs (All Item default, Weekly Highlights, Regular Menu) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={() => setSelectedMenuType('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedMenuType === 'ALL'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400'
            }`}
          >
            {t.allItems} ({allMenuItems.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedMenuType('WEEKLY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedMenuType === 'WEEKLY'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-amber-600'
            }`}
          >
            {t.weeklyMenus} ({weeklyItems.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedMenuType('PERMANENT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedMenuType === 'PERMANENT'
                ? 'bg-stone-800 dark:bg-stone-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {t.regularMaster} ({regularItems.length})
          </button>
        </div>

        <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums">
          {filteredItems.length} {t.dishes}
        </span>
      </div>

      {/* Dish Grid for All Item / Weekly Highlights / Regular Menu */}
      <div key={selectedMenuType} className="animate-tab-enter">
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-8 text-center text-xs text-stone-400">
            {t.noDishesFound}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {paginatedDishes.visibleItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={{
                    ...item,
                    shopCountry: item.shopCountry || shop.country,
                    shopName: item.shopName || shop.name,
                  }}
                  onToggleSave={onToggleSave}
                  onSelectItem={onSelectItem}
                  onViewImage={onViewImage}
                />
              ))}
            </div>
            <ScrollLoadMoreSentinel
              sentinelRef={paginatedDishes.sentinelRef}
              visibleCount={paginatedDishes.visibleCount}
              totalCount={paginatedDishes.totalCount}
              pageSize={PAGE_LIMITS.WEEKLY_AND_MASTER}
              hasMore={paginatedDishes.hasMore}
              onLoadMore={paginatedDishes.loadMore}
              itemLabel="dishes"
            />
          </div>
        )}
      </div>
    </div>
  );
};
