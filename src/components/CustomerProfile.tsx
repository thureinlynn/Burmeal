import React from 'react';
import { User, Shop } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, ShieldCheck, Heart, LogOut, ArrowRight, Store } from 'lucide-react';

interface CustomerProfileProps {
  user: User | null;
  followedShops: Shop[];
  onSelectShop: (shopId: string) => void;
  onOpenAuth: () => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  user,
  followedShops,
  onSelectShop,
  onOpenAuth,
}) => {
  const { t } = useLanguage();
  const { logout } = useAuth();

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center max-w-md mx-auto my-8 space-y-3">
        <UserIcon className="w-12 h-12 text-stone-300 mx-auto" />
        <h2 className="text-lg font-bold font-display text-stone-900">{t.signIn}</h2>
        <p className="text-xs text-stone-500">
          Sign in or create a customer account to save your favorite dishes and follow food kitchens.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-amber-700 transition-colors"
        >
          {t.signIn} / {t.signUp}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Account Info Box */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex items-center gap-4">
        <img
          src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
          alt={user.name}
          className="w-16 h-16 rounded-2xl border-2 border-stone-200 object-cover bg-stone-50"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold font-display text-stone-900 truncate">{user.name}</h1>
            <span className="text-[10px] bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5 text-stone-400" />
            <span className="truncate">{user.email}</span>
          </p>
        </div>
        <button
          onClick={() => logout()}
          className="p-2.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-stone-200 shrink-0"
          title={t.signOut}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Followed Shops Section */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-stone-50/70 border-b border-stone-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Followed Shops ({followedShops.length})</span>
          </h2>
        </div>

        {followedShops.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-400">
            {t.noFollowedShops}
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {followedShops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => onSelectShop(shop.id)}
                className="p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={shop.avatarImage}
                    alt={shop.name}
                    className="w-10 h-10 rounded-xl object-cover border border-stone-200 bg-stone-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-stone-900">{shop.name}</h3>
                    <p className="text-[11px] text-stone-500">{shop.locationArea}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold">
                  <span>{t.viewShopProfile}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
