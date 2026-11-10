import React from 'react';

interface CreativeCountryFlagBackgroundProps {
  country?: string;
  className?: string;
  intensity?: 'subtle' | 'vibrant';
}

/**
 * Creative artistic flag background generator with high-visibility blurry mesh gradients
 * and clear, luminous national flag emblems for each supported country.
 */
export const CreativeCountryFlagBackground: React.FC<CreativeCountryFlagBackgroundProps> = ({
  country = 'Myanmar',
  className = '',
  intensity = 'vibrant',
}) => {
  const normCountry = (country || 'Myanmar').toLowerCase().trim();

  // Determine country category
  let flagType:
    | 'myanmar'
    | 'thailand'
    | 'singapore'
    | 'malaysia'
    | 'japan'
    | 'usa'
    | 'eu'
    | 'uk'
    | 'korea'
    | 'australia' = 'myanmar';

  if (normCountry.includes('thailand') || normCountry === 'th') {
    flagType = 'thailand';
  } else if (normCountry.includes('singapore') || normCountry === 'sg') {
    flagType = 'singapore';
  } else if (normCountry.includes('malaysia') || normCountry === 'my') {
    flagType = 'malaysia';
  } else if (normCountry.includes('japan') || normCountry === 'jp') {
    flagType = 'japan';
  } else if (normCountry.includes('united states') || normCountry.includes('usa') || normCountry === 'us') {
    flagType = 'usa';
  } else if (normCountry.includes('european') || normCountry.includes('eu') || normCountry === 'europe') {
    flagType = 'eu';
  } else if (normCountry.includes('kingdom') || normCountry.includes('uk') || normCountry === 'gb' || normCountry.includes('britain')) {
    flagType = 'uk';
  } else if (normCountry.includes('korea') || normCountry === 'kr') {
    flagType = 'korea';
  } else if (normCountry.includes('australia') || normCountry === 'au') {
    flagType = 'australia';
  } else {
    flagType = 'myanmar';
  }

  const opacityClass = intensity === 'vibrant' ? 'opacity-100' : 'opacity-80';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-2xl select-none transition-all duration-700 ${opacityClass} ${className}`}
    >
      {/* 🇲🇲 MYANMAR: Yellow, Green, Red horizontal tricolor with central glowing White Star */}
      {flagType === 'myanmar' && (
        <div className="relative w-full h-full">
          {/* Top Yellow Band */}
          <div className="absolute top-0 inset-x-0 h-[36%] bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 blur-lg opacity-90" />
          {/* Middle Green Band */}
          <div className="absolute top-[32%] inset-x-0 h-[36%] bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 blur-lg opacity-90" />
          {/* Bottom Red Band */}
          <div className="absolute bottom-0 inset-x-0 h-[36%] bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 blur-lg opacity-90" />

          {/* Bold Luminous Central Five-Pointed Star Emblem */}
          <div className="absolute right-8 sm:right-20 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <svg
              className="w-36 h-36 sm:w-48 sm:h-48 text-white drop-shadow-[0_0_35px_rgba(255,255,255,1)] animate-pulse"
              style={{ animationDuration: '4s' }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </div>
        </div>
      )}

      {/* 🇹🇭 THAILAND: Red, White, Royal Blue, White, Red (Trairanga) stripes */}
      {flagType === 'thailand' && (
        <div className="relative w-full h-full">
          {/* Top Red Band */}
          <div className="absolute top-0 inset-x-0 h-[20%] bg-gradient-to-r from-red-600 via-rose-600 to-red-700 blur-md opacity-95" />
          {/* Top White Stripe */}
          <div className="absolute top-[18%] inset-x-0 h-[14%] bg-white blur-xs opacity-95" />
          {/* Royal Blue Center Deep Band */}
          <div className="absolute top-[30%] inset-x-0 h-[40%] bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 blur-md opacity-95 shadow-[0_0_30px_rgba(30,58,138,0.8)]" />
          {/* Bottom White Stripe */}
          <div className="absolute bottom-[18%] inset-x-0 h-[14%] bg-white blur-xs opacity-95" />
          {/* Bottom Red Band */}
          <div className="absolute bottom-0 inset-x-0 h-[20%] bg-gradient-to-r from-red-600 via-rose-600 to-red-700 blur-md opacity-95" />

          {/* Thai Royal Crest & Elephant Silhouette Watermark */}
          <div className="absolute right-8 sm:right-20 top-1/2 -translate-y-1/2 text-white/80 drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
            <svg className="w-28 h-28 sm:w-36 sm:h-36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L15 8L22 9L17 14L18 21L12 17.5L6 21L7 14L2 9L9 8L12 2Z" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </div>
      )}

      {/* 🇸🇬 SINGAPORE: Red upper half with Crescent & 5 Stars, White lower half */}
      {flagType === 'singapore' && (
        <div className="relative w-full h-full">
          {/* Crimson Red Upper Half */}
          <div className="absolute top-0 inset-x-0 h-[52%] bg-gradient-to-r from-red-600 via-rose-600 to-red-600 blur-lg opacity-95" />
          {/* Crisp Pure White Lower Half */}
          <div className="absolute bottom-0 inset-x-0 h-[50%] bg-white blur-md opacity-95" />

          {/* Radiant White Crescent Moon & 5 Stars Emblem */}
          <div className="absolute right-8 sm:right-20 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <svg className="w-28 h-28 sm:w-36 sm:h-36 text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
            </svg>
            <div className="grid grid-cols-2 gap-2 text-white drop-shadow-[0_0_20px_rgba(255,255,255,1)] font-bold">
              <span className="text-base sm:text-lg">★</span>
              <span className="text-base sm:text-lg">★</span>
              <span className="text-base sm:text-lg col-span-2 text-center">★</span>
              <span className="text-base sm:text-lg">★</span>
              <span className="text-base sm:text-lg">★</span>
            </div>
          </div>
        </div>
      )}

      {/* 🇲🇾 MALAYSIA: 14 Red/White stripes with Dark Blue canton, Yellow Crescent & 14-point Star */}
      {flagType === 'malaysia' && (
        <div className="relative w-full h-full">
          {/* Alternating Red and White Stripes */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-600 via-white via-red-600 via-white to-red-600 blur-md opacity-85" />
          {/* Deep Navy Blue Canton on Left */}
          <div className="absolute -top-6 -left-6 w-[52%] h-[115%] bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 blur-lg opacity-95 shadow-lg" />

          {/* Radiant Golden Yellow Crescent & 14-Point Star */}
          <div className="absolute left-6 sm:left-14 top-1/2 -translate-y-1/2 flex items-center gap-3 text-yellow-300 drop-shadow-[0_0_30px_rgba(253,224,71,1)]">
            <svg className="w-24 h-24 sm:w-32 sm:h-32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
            </svg>
            <span className="text-4xl sm:text-5xl font-black animate-pulse">✸</span>
          </div>
        </div>
      )}

      {/* 🇯🇵 JAPAN: Crisp White Canvas with Radiant Crimson Hinomaru Sun */}
      {flagType === 'japan' && (
        <div className="relative w-full h-full">
          {/* Pure white background with subtle pearl warmth */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-50 via-white to-rose-50/40 blur-xs opacity-95" />

          {/* Radiant Hinomaru Crimson Sun Disc with concentric glowing auras */}
          <div className="absolute right-10 sm:right-28 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {/* Outer soft aura */}
            <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-red-500/35 blur-2xl animate-pulse" />
            {/* Mid aura */}
            <div className="absolute w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 blur-lg opacity-90" />
            {/* Core Sun disc */}
            <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-red-600 shadow-[0_0_50px_rgba(220,38,38,1)] opacity-100" />
          </div>
        </div>
      )}

      {/* 🇺🇸 UNITED STATES: Navy Star-Spangled canton glow & Red/White waving stripes */}
      {flagType === 'usa' && (
        <div className="relative w-full h-full">
          {/* Alternating Crimson & White Horizontal stripes */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-600 via-white via-red-600 via-white to-red-600 blur-md opacity-85" />
          {/* Deep Navy Blue Star Canton on Left */}
          <div className="absolute -top-6 -left-6 w-[52%] h-[115%] bg-gradient-to-br from-blue-950 via-navy-900 to-blue-900 blur-lg opacity-95 shadow-lg" />

          {/* Radiant White Stars Constellation */}
          <div className="absolute left-6 sm:left-14 top-1/2 -translate-y-1/2 grid grid-cols-4 gap-3 text-white drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="text-sm sm:text-base font-extrabold">★</span>
            ))}
          </div>
        </div>
      )}

      {/* 🇪🇺 EUROPEAN UNION: Royal Cobalt Blue with Circle of 12 Golden Stars */}
      {flagType === 'eu' && (
        <div className="relative w-full h-full">
          {/* Deep Sapphire Cobalt Blue backdrop */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 blur-lg opacity-95" />
          <div className="absolute top-1/2 right-24 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/40 blur-2xl" />

          {/* Ring of 12 Brilliant Golden Stars */}
          <div className="absolute right-10 sm:right-28 top-1/2 -translate-y-1/2 w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const radius = 54; // px
              const x = Math.round(radius * Math.cos(angle));
              const y = Math.round(radius * Math.sin(angle));
              return (
                <div
                  key={i}
                  className="absolute text-yellow-300 font-black text-base sm:text-lg drop-shadow-[0_0_20px_rgba(253,224,71,1)]"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  ★
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🇬🇧 UNITED KINGDOM: Deep Navy with Union Jack artistic red & white cross diagonals */}
      {flagType === 'uk' && (
        <div className="relative w-full h-full">
          {/* Deep Navy Blue base */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 blur-lg opacity-95" />
          {/* Diagonals (St. Andrew & St. Patrick) */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_44%,rgba(255,255,255,0.9)_47%,rgba(220,38,38,0.95)_50%,rgba(255,255,255,0.9)_53%,transparent_56%)] blur-xs opacity-90" />
          <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_44%,rgba(255,255,255,0.9)_47%,rgba(220,38,38,0.95)_50%,rgba(255,255,255,0.9)_53%,transparent_56%)] blur-xs opacity-90" />
          {/* Central St. George Red & White Cross with glow */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-20 bg-white blur-sm opacity-90" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 bg-red-600 blur-xs opacity-95 shadow-[0_0_35px_rgba(220,38,38,1)]" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 bg-white blur-sm opacity-90" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-red-600 blur-xs opacity-95 shadow-[0_0_35px_rgba(220,38,38,1)]" />
        </div>
      )}

      {/* 🇰🇷 SOUTH KOREA: White Canvas with Glowing Red/Blue Taegeuk Swirl & Trigrams */}
      {flagType === 'korea' && (
        <div className="relative w-full h-full">
          {/* Pure Frosted Pearl White Base */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-50 via-white to-stone-50 blur-xs opacity-95" />

          {/* Central Glowing Taegeuk Yin-Yang Swirl */}
          <div className="absolute right-10 sm:right-28 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {/* Taegeuk sphere */}
            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden relative shadow-[0_0_45px_rgba(205,46,58,0.85)] flex flex-col border border-white/60">
              <div className="w-full h-1/2 bg-gradient-to-r from-red-600 via-rose-600 to-red-600" />
              <div className="w-full h-1/2 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-700" />
              {/* S-curve Taegeuk division */}
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-red-600 shadow-md" />
              <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 rounded-full bg-blue-700 shadow-md" />
            </div>

            {/* Trigrams Floating Watermark */}
            <div className="absolute -left-14 -top-8 text-stone-900 dark:text-stone-100 font-extrabold text-sm sm:text-base tracking-widest opacity-70">
              ☰
            </div>
            <div className="absolute -right-14 -bottom-8 text-stone-900 dark:text-stone-100 font-extrabold text-sm sm:text-base tracking-widest opacity-70">
              ☷
            </div>
          </div>
        </div>
      )}

      {/* 🇦🇺 AUSTRALIA: Oceanic Navy with Southern Cross Constellation & Commonwealth Star */}
      {flagType === 'australia' && (
        <div className="relative w-full h-full">
          {/* Deep Navy Ocean base */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 blur-lg opacity-95" />
          {/* Large 7-pointed Commonwealth Star glow on left */}
          <div className="absolute left-8 sm:left-18 top-1/2 -translate-y-1/2 text-white drop-shadow-[0_0_35px_rgba(255,255,255,1)]">
            <span className="text-5xl sm:text-6xl font-black animate-pulse">✸</span>
          </div>

          {/* Southern Cross 5-star Constellation on right */}
          <div className="absolute right-10 sm:right-28 top-1/2 -translate-y-1/2 w-32 h-32 sm:w-44 sm:h-44 text-white drop-shadow-[0_0_25px_rgba(255,255,255,1)] font-bold">
            {/* Crucis stars */}
            <span className="absolute top-0 left-1/2 -translate-x-1/2 text-base sm:text-lg">★</span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-base sm:text-lg">★</span>
            <span className="absolute top-1/2 left-0 -translate-y-1/2 text-sm sm:text-base">★</span>
            <span className="absolute top-1/2 right-2 -translate-y-1/2 text-base sm:text-lg">★</span>
            <span className="absolute top-[60%] right-[30%] text-xs">★</span>
          </div>
        </div>
      )}

      {/* Lighter Frosted Glass Overlay: Lets rich flag colors shine through while keeping controls legible */}
      <div className="absolute inset-0 bg-white/20 dark:bg-stone-950/25 backdrop-blur-[4px]" />
    </div>
  );
};
