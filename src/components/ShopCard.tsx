import React, { useState, useEffect } from 'react';
import { Shop } from '../types';
import { Store, MessageCircle, Heart, MapPin } from 'lucide-react';
import { buildContactLinks } from '../utils/filter';
import { getCountryFlag } from '../utils/countries';
import { resolveCoverDesign, getLocalCountryCoverDesign } from '../utils/coverDesigns';
import { getShopProfileImage } from '../utils/shopLocationHelpers';
import { useLanguage } from '../context/LanguageContext';

interface ShopCardProps {
  shop: Shop;
  onFollowToggle?: (shopId: string) => void;
  onSelectShop: (shopId: string) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onFollowToggle, onSelectShop }) => {
  const { t } = useLanguage();
  const contact = buildContactLinks({
    whatsappPhone: shop.whatsappPhone,
    viberPhone: shop.viberPhone,
    lineId: shop.lineId,
    facebookUrl: shop.facebookUrl,
    phoneNumber: shop.phoneNumber,
    shopName: shop.name,
  });

  const countryFlag = getCountryFlag(shop.country);
  const profileImageSrc = getShopProfileImage(shop);
  const [coverSrc, setCoverSrc] = useState<string>(() =>
    resolveCoverDesign(shop.coverImage, shop.country, shop.region)
  );
  const [profileImgFailed, setProfileImgFailed] = useState(false);

  useEffect(() => {
    setCoverSrc(resolveCoverDesign(shop.coverImage, shop.country, shop.region));
  }, [shop.coverImage, shop.country, shop.region]);

  useEffect(() => {
    setProfileImgFailed(false);
  }, [profileImageSrc]);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all flex flex-col group">
      {/* Cover Header */}
      <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden cursor-pointer" onClick={() => onSelectShop(shop.id)}>
        <img
          src={coverSrc}
          alt={shop.name}
          referrerPolicy="no-referrer"
          onError={() => {
            const fallback = getLocalCountryCoverDesign(shop.country, shop.region);
            if (coverSrc !== fallback) setCoverSrc(fallback);
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Order & Pick-Up Insight badge replacing generic status */}
        <div className="absolute top-2.5 right-2.5">
          <span className="text-[10px] font-bold tracking-wide px-2.5 py-0.5 rounded-full backdrop-blur-md bg-stone-900/80 text-amber-300 border border-amber-400/40 shadow-xs flex items-center gap-1">
            <Store className="w-3 h-3 text-amber-400" />
            <span>Direct Pick-Up</span>
          </span>
        </div>

        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sm shrink-0">{countryFlag}</span>
            <span className="truncate font-medium">{shop.city || shop.locationArea}</span>
          </div>
          <span className="text-stone-200 font-medium shrink-0 tabular-nums">
            {shop.itemCount || 0} {t.dishes}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="cursor-pointer flex items-center gap-2.5 min-w-0" onClick={() => onSelectShop(shop.id)}>
              {profileImageSrc && !profileImgFailed ? (
                <img
                  src={profileImageSrc}
                  alt={shop.name}
                  referrerPolicy="no-referrer"
                  onError={() => setProfileImgFailed(true)}
                  className="w-9 h-9 rounded-lg object-cover border border-stone-200 dark:border-stone-700 bg-stone-100 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg border border-stone-200 dark:border-stone-700 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                  {shop.name}
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium truncate">
                  {shop.cuisineType}
                </p>
              </div>
            </div>

            {onFollowToggle && (
              <button
                onClick={() => onFollowToggle(shop.id)}
                className={`p-2 rounded-xl border transition-colors shrink-0 ${
                  (shop as any).isFollowed
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                title={(shop as any).isFollowed ? 'Unfollow shop' : 'Follow shop for daily updates'}
              >
                <Heart className={`w-4 h-4 ${(shop as any).isFollowed ? 'fill-current text-rose-500' : ''}`} />
              </button>
            )}
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed mb-3">
            {shop.bio}
          </p>

          {/* Kitchen Pick-Up Insight */}
          <div className="text-[11px] bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 rounded-xl px-2.5 py-1.5 text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-2.5">
            <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0 text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Store className="w-3 h-3 text-amber-600" />
              <span>Insight:</span>
            </span>
            <span className="truncate text-[11px]">
              Direct contact with cook &bull; Pick up at address
            </span>
          </div>

          {/* Detailed Address line */}
          <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              {[shop.address, shop.city, shop.country].filter(Boolean).join(', ')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {contact.whatsappUrl && (
              <a
                href={contact.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xs transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            )}
            {contact.fbUrl && (
              <a
                href={contact.fbUrl}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-xs font-bold transition-colors"
                title="Facebook"
              >
                f
              </a>
            )}
            {contact.telUrl && (
              <a
                href={contact.telUrl}
                className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-xs transition-colors"
                title="Call Phone"
              >
                <Store className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <button
            onClick={() => onSelectShop(shop.id)}
            className="px-3 py-1.5 bg-stone-900 dark:bg-stone-800 hover:bg-amber-600 dark:hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {t.viewShopProfile}
          </button>
        </div>
      </div>
    </div>
  );
};
