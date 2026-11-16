import React from 'react';
import { Shop } from '../types';
import { ShieldCheck, Check, X, Clock, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
  shops: Shop[];
  onUpdateStatus: (shopId: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
  onRefresh: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ shops, onUpdateStatus, onRefresh }) => {
  const pendingShops = shops.filter((s) => s.status === 'PENDING');
  const approvedShops = shops.filter((s) => s.status === 'APPROVED');
  const rejectedShops = shops.filter((s) => s.status === 'REJECTED');

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h1 className="text-2xl font-bold font-display text-stone-900 dark:text-stone-100">
              Admin Platform Approvals
            </h1>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Review and approve registered food shops before they appear on the public feed and search results.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg text-center">
            <span className="text-lg font-bold text-amber-900 dark:text-amber-200 block tabular-nums">{pendingShops.length}</span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider font-semibold">Pending</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg text-center">
            <span className="text-lg font-bold text-emerald-900 dark:text-emerald-200 block tabular-nums">{approvedShops.length}</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-semibold">Approved</span>
          </div>
          <div className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-lg text-center">
            <span className="text-lg font-bold text-stone-900 dark:text-stone-100 block tabular-nums">{shops.length}</span>
            <span className="text-[10px] text-stone-600 dark:text-stone-400 uppercase tracking-wider font-semibold">Total</span>
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="p-4 bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Pending Registration Queue ({pendingShops.length})</span>
          </h2>
          <button
            onClick={onRefresh}
            className="text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline"
          >
            Refresh List
          </button>
        </div>

        {pendingShops.length === 0 ? (
          <div className="p-8 text-center text-stone-400 dark:text-stone-500 text-xs">
            No shops currently awaiting approval. All registrations are up to date!
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {pendingShops.map((shop) => (
              <div key={shop.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <img
                    src={shop.coverImage}
                    alt={shop.name}
                    className="w-16 h-16 rounded-lg object-cover bg-stone-100 dark:bg-stone-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">{shop.name}</h3>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded">
                        PENDING
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                      {shop.cuisineType} · {shop.locationArea}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-1 max-w-xl mt-1">
                      {shop.bio}
                    </p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                      Owner: {shop.ownerEmail || 'Registered Owner'} · Contact: {shop.phoneNumber || shop.whatsappPhone || 'None'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => onUpdateStatus(shop.id, 'APPROVED')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Shop</span>
                  </button>
                  <button
                    onClick={() => onUpdateStatus(shop.id, 'REJECTED')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Shops Table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="p-4 bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-sm font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider">
            All Approved & Platform Active Shops ({approvedShops.length})
          </h2>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50/50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-100 dark:border-stone-800">
            <tr>
              <th className="py-2.5 px-4">Shop</th>
              <th className="py-2.5 px-4">Location</th>
              <th className="py-2.5 px-4">Followers</th>
              <th className="py-2.5 px-4">Dishes</th>
              <th className="py-2.5 px-4">Channels</th>
              <th className="py-2.5 px-4 text-right">Status Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {approvedShops.map((shop) => (
              <tr key={shop.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                <td className="py-3 px-4 font-semibold text-stone-900 dark:text-stone-100">{shop.name}</td>
                <td className="py-3 px-4 text-stone-600 dark:text-stone-300">{shop.locationArea}</td>
                <td className="py-3 px-4 text-stone-600 dark:text-stone-300 tabular-nums">{shop.followerCount || 0}</td>
                <td className="py-3 px-4 text-stone-600 dark:text-stone-300 tabular-nums">{shop.itemCount || 0}</td>
                <td className="py-3 px-4 text-stone-500 dark:text-stone-400 text-[11px]">
                  {[
                    shop.whatsappPhone ? 'WA' : null,
                    shop.viberPhone ? 'Viber' : null,
                    shop.lineId ? 'LINE' : null,
                    shop.facebookUrl ? 'FB' : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onUpdateStatus(shop.id, 'REJECTED')}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-medium text-xs"
                  >
                    Revoke Approval
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
