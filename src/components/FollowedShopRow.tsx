import React from 'react';
import { Shop, MenuItem } from '../types';
import { Heart, MapPin, Store, ArrowRight, MessageCircle, Phone, Clock, Utensils, Sparkles } from 'lucide-react';
import { buildContactLinks, formatPrice } from '../utils/filter';
import { getCountryFlag } from '../utils/countries';
import { useLanguage } from '../context/LanguageContext';
import { resolveCoverDesign, buildShopCoverSeed, pickRandomFoodCoverDesign } from '../utils/coverDesigns';

interface FollowedShopRowProps {
  shop: Shop;
  dishes?: MenuItem[];
  onSelectShop: (shopId: string) => void;
  onToggleFollow: (shopId: string) => void;
  onSelectDish?: (dish: MenuItem) => void;
}

export const FollowedShopRow: React.FC<FollowedShopRowProps> = ({
  shop,
  dishes = [],
  onSelectShop,
  onToggleFollow,
  onSelectDish,
}) => {
  const { t } = useLanguage();
  const flag = getCountryFlag(shop.country);
  const [coverSrc, setCoverSrc] = React.useState<string>(() =>
    resolveCoverDesign(shop.coverImage, buildShopCoverSeed(shop.id, shop.name))
  );
  React.useEffect(() => {
    setCoverSrc(resolveCoverDesign(shop.coverImage, buildShopCoverSeed(shop.id, shop.name)));
  }, [shop.id, shop.name, shop.coverImage]);

  const contact = buildContactLinks({
    whatsappPhone: shop.whatsappPhone,
    viberPhone: shop.viberPhone,
    lineId: shop.lineId,
    facebookUrl: shop.facebookUrl,
    phoneNumber: shop.phoneNumber,
    shopName: shop.name,
  });

  const shopDishes = dishes.filter((d) => d.shopId === shop.id).slice(0, 3);

  return (
    <div className="bg-white/85 dark:bg-stone-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-stone-800/90 p-4 sm:p-5 shadow-xs hover:border-amber-400/80 dark:hover:border-amber-500/70 hover:shadow-md transition-all duration-300 flex flex-col gap-4 group">
      {/* Top Section: Shop Info & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Media + Brand */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0 w-full md:w-auto">
          {/* Shop Visual */}
          <div
            onClick={() => onSelectShop(shop.id)}
            className="relative w-20 h-20 sm:w-28 sm:h-24 rounded-2xl overflow-hidden shrink-0 cursor-pointer bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 group-hover:shadow-sm transition-all"
          >
            <img
              src={coverSrc}
              alt={shop.name}
              referrerPolicy="no-referrer"
              onError={() => setCoverSrc((prev) => pickRandomFoodCoverDesign(prev))}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            
            {/* Country Flag Tag */}
            <span className="absolute top-1.5 left-1.5 text-xs bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-md" title={shop.country}>
              {flag}
            </span>

            {/* Avatar overlay */}
            <img
              src={shop.avatarImage}
              alt={shop.name}
              referrerPolicy="no-referrer"
              className="absolute bottom-1.5 right-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white/90 shadow-xs object-cover bg-stone-200"
            />
          </div>

          {/* Name & Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3
                onClick={() => onSelectShop(shop.id)}
                className="text-base sm:text-lg font-bold font-display text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer truncate transition-colors"
              >
                {shop.name}
              </h3>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                {shop.cuisineType}
              </span>

              {/* Order & Pick-Up Insight Pill replacing verified badge */}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 inline-flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                <span>Direct Contact • Pick-Up</span>
              </span>
            </div>

            {/* Location & Operating Hours */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400 mb-1">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate">{shop.city || shop.locationArea}, {shop.country}</span>
              </span>

              {shop.operatingHours && (
                <span className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{shop.operatingHours}</span>
                </span>
              )}
            </div>

            {/* Kitchen & Pick-Up Address Insight */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-stone-700 dark:text-stone-300 mb-1.5">
              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 shrink-0 text-[10px] uppercase tracking-wide">
                <Store className="w-3 h-3 text-amber-600" />
                <span>Kitchen Insight:</span>
              </span>
              <span className="truncate">
                Direct chat with cook &bull; Pick up at address: <span className="font-semibold text-stone-900 dark:text-stone-100">{[shop.address, shop.city].filter(Boolean).join(', ') || shop.locationArea}</span>
              </span>
            </div>

            {/* Bio line */}
            {shop.bio && (
              <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 leading-relaxed max-w-xl">
                {shop.bio}
              </p>
            )}

            {/* Contact quick actions */}
            <div className="flex items-center gap-1.5 mt-2">
              {contact.whatsappUrl && (
                <a
                  href={contact.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-[10px] font-bold inline-flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              )}
              {contact.telUrl && (
                <a
                  href={contact.telUrl}
                  className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-[10px] font-bold inline-flex items-center gap-1 hover:bg-stone-200 transition-colors"
                  title="Call Phone"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              )}
              {contact.fbUrl && (
                <a
                  href={contact.fbUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-bold inline-flex items-center justify-center hover:bg-blue-100 transition-colors"
                  title="Facebook"
                >
                  f
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right / Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0 w-full sm:w-auto justify-end">
          {/* Unfollow / Following button */}
          <button
            onClick={() => onToggleFollow(shop.id)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 inline-flex items-center gap-1.5 shadow-2xs group/btn"
            title="Click to unfollow this shop"
          >
            <Heart className="w-3.5 h-3.5 fill-current text-rose-500 group-hover/btn:scale-110 transition-transform" />
            <span>Following</span>
          </button>

          {/* Visit Storefront button */}
          <button
            onClick={() => onSelectShop(shop.id)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-amber-600 text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-amber-500 dark:hover:text-white transition-all inline-flex items-center gap-1.5 shadow-xs"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Storefront</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Bottom Section: Active Dishes from this Followed Kitchen */}
      {shopDishes.length > 0 && (
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <Utensils className="w-3 h-3 text-amber-600" />
              <span>Active Kitchen Dishes ({shop.itemCount || shopDishes.length})</span>
            </span>
            <button
              onClick={() => onSelectShop(shop.id)}
              className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5"
            >
              <span>View All Menu</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {shopDishes.map((dish) => (
              <div
                key={dish.id}
                onClick={() => onSelectDish ? onSelectDish(dish) : onSelectShop(shop.id)}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/60 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer transition-all group/dish"
              >
                <img
                  src={dish.image}
                  alt={dish.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover shrink-0 bg-stone-200 dark:bg-stone-700"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate group-hover/dish:text-amber-600 transition-colors">
                    {dish.title}
                  </h4>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                      {formatPrice(dish.price, dish.shopCountry || shop.country)}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-stone-200/60 dark:bg-stone-750 text-stone-600 dark:text-stone-300">
                      {dish.menuType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
