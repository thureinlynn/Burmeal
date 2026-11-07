# Functional Shop Owner Dashboard & Regional Lock

Revamp the Shop Owner Overview dashboard to match the exact visual architecture shown in the reference screenshots, and hide the top region selector when logged in as a Shop Owner since shops are permanently bound to their registered location.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your screenshots and confirmed interview responses:
> - **Top Region Switcher**: Completely hidden for logged-in Shop Owners (`user?.role === 'SHOP_OWNER'`). Regular customers continue to select and change regions.
> - **Weekly Rotating Schedule Matrix**: Day cards (`Mon`–`Sun`) will interactively filter and highlight designated dishes for the selected day.
> - **Welcome Banner Actions**: `+ Add Weekly Dish` will directly open the dish creation modal with the `WEEKLY` menu classification pre-selected.

- **Confirmed Decision 1**: Implement the vibrant warm amber-orange welcome banner with verified badge, quick action buttons, and watermark store illustration.
- **Confirmed Decision 2**: Implement the exact 4-card metric row (`ACTIVE DISHES` with breakdown, `SHOP FOLLOWERS`, `ORDERING CHANNELS` with brand pills, and `STORE HEALTH` with 100% progress bar).
- **Confirmed Decision 3**: Implement the middle grid pairing `Today's Active Daily Special` spotlight with the interactive 7-day `Weekly Rotating Schedule Matrix`.
- **Confirmed Decision 4**: Implement the bottom 3-column operational cards (`Store Location`, `Ordering Channels`, and `Regular Master Dishes`).

---

## 1. Overview & Core Concept

- **What It Does**: Provides shop owners with a command-center overview of their kitchen operations, live daily specials, weekly rotating availability, ordering channel status, and quick shortcuts into menu creation and profile settings.
- **Target Audience**: Kitchen managers, artisanal food producers, and home cooks running shops on BurMeal.
- **Key Value**: Delivers complete visual clarity over multi-tier menus (Daily, Weekly, Master) without navigational ambiguity, while locking shop region scoping to their authentic registered location.

---

## 2. User Experience & Visual Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Shop Avatar]  Mandalay Morning Teahouse [APPROVED]    [4-Tab Navigation]   │
│                Burmese Breakfast & Classics · Downtown                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 🛡️ Verified Storefront                                                  │ │
│ │ Welcome to Mandalay Morning Teahouse                          [Shop]    │ │
│ │ Manage your multi-tier culinary offerings and connect with diners.      │ │
│ │ [+ Add Today's Special]   [+ Add Weekly Dish]   [👁️ View Storefront]    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ ACTIVE DISHES│ │SHOP FOLLOWERS│ │ORDERING CHANNELS │ │ STORE HEALTH     │ │
│ │ 4            │ │ 1            │ │ 5 / 5 Active     │ │ 100% Excellent   │ │
│ │ 1d · 1w · 2r │ │ Engaged fans │ │ [WA][Vib][Line]..│ │ [========100%==] │ │
│ └──────────────┘ └──────────────┘ └──────────────────┘ └──────────────────┘ │
│                                                                             │
│ ┌───────────────────────────────────────┐ ┌───────────────────────────────┐ │
│ │ 🔴 Today's Active Daily Special       │ │ 📅 Weekly Schedule Matrix     │ │
│ │ [Image] Royal Fish Mohinga   [$5.50]  │ │ [Mon][Tue][Wed][Thu][Fri][Sat]│ │
│ │         Edit Special                  │ │ [Sun - TODAY Highlighted]     │ │
│ └───────────────────────────────────────┘ └───────────────────────────────┘ │
│                                                                             │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌───────────────────────┐ │
│ │ 📍 Store Location    │ │  Ordering Channels   │ │ 🍴 Master Dishes      │ │
│ │ 78th Street          │ │ Direct Contact       │ │ 2 dishes              │ │
│ │ Edit Address →       │ │ Update Numbers →     │ │ + Add Regular Dish →  │ │
│ └──────────────────────┘ └──────────────────────┘ └───────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Scoping Region Selector by Role**
  - *Chosen Approach*: In `Navbar.tsx`, wrap the region selector button in `{user?.role !== 'SHOP_OWNER' && (...)}`.
  - *Why*: As requested, shop owners are registered to a specific location and cannot change regions for their shop. Customers select their region when browsing.
  - *Alternatives Considered*: Disabling the button with a tooltip, but removing it completely is cleaner and avoids accidental clicks.

- **Decision 2: Direct Action Handlers**
  - *Chosen Approach*: The welcome banner buttons and card footers wire directly into the respective modals (`openCreateModal('SPECIAL')`, `openCreateModal('WEEKLY')`, `openCreateModal('PERMANENT')`) or tab switches (`setTab('shop_menus')`, `setTab('shop_profile')`).
  - *Why*: Provides immediate, functional ergonomics without requiring the user to navigate through multiple menus.

---

## 4. Technical Architecture & Implementation Steps

### 1. `src/components/Navbar.tsx`
- Conditionally hide the Region & Location Selector button if `user?.role === 'SHOP_OWNER'`.

### 2. `src/components/ShopDashboard.tsx` (Tab 1: `shop_overview`)
- **Header**: Refine top status bar to match screenshot (avatar, shop name, `APPROVED`/`PENDING` badge, cuisine & location subtitle, and right-aligned 4-tab pill selector).
- **Orange Hero Banner**: Build `<div className="bg-[#EA580C] text-white rounded-3xl p-6 sm:p-8 relative ...">` with verified storefront badge, heading, subtitle, 3 action buttons, and watermark shop icon.
- **4 Metric Cards**:
  - `ACTIVE DISHES`: Total count with color-coded breakdown (`{specialCount} daily · {weeklyCount} weekly · {regularCount} reg`).
  - `SHOP FOLLOWERS`: Live follower count with engaged fans caption.
  - `ORDERING CHANNELS`: Active channels ratio (`{activeCount} / 5 Active`) with branded badges (WhatsApp, Viber, LINE, FB).
  - `STORE HEALTH`: `100% Excellent` with green progress bar.
- **Middle Spotlight & Schedule Matrix**:
  - `Today's Active Daily Special`: Live dish card with date pill, photo, title, price, description, and `Edit Special` link.
  - `Weekly Rotating Schedule Matrix`: 7-day card matrix (`Mon` through `Sun`), highlighting the current day with amber border and `TODAY` label, showing active dish counts for each day and filtering on click.
- **Bottom 3 Operational Cards**:
  - `Store Location`: Street address, city, state/region, country flag, and `Edit Address Details →` link.
  - `Ordering Channels`: Direct contact channels summary and `Update Contact Numbers →` link.
  - `Regular Master Dishes`: Everyday core dishes count and `+ Add Regular Dish →` link.
