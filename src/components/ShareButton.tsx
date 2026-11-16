import React, { useEffect, useRef, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { executeShare, SharePayload } from '../utils/shareHelpers';

interface ShareButtonProps {
  getPayload: () => SharePayload;
  ariaLabel: string;
  variant?: 'icon-overlay' | 'icon-box' | 'button' | 'banner-button';
  label?: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  getPayload,
  ariaLabel,
  variant = 'icon-overlay',
  label = 'Share',
  className = '',
}) => {
  const [status, setStatus] = useState<'idle' | 'done'>('idle');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const payload = getPayload();
    const outcome = await executeShare(payload);
    if (outcome === 'shared' || outcome === 'copied') {
      setStatus('done');
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setStatus('idle');
        timerRef.current = null;
      }, 2000);
    }
  };

  const isDone = status === 'done';

  if (variant === 'icon-overlay') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        title={isDone ? 'Link copied!' : ariaLabel}
        className={`p-1.5 sm:p-2 rounded-full backdrop-blur transition-all cursor-pointer ${
          isDone
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-black/35 text-white hover:bg-black/60'
        } ${className}`}
      >
        {isDone ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
      </button>
    );
  }

  if (variant === 'icon-box') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        title={isDone ? 'Link copied!' : ariaLabel}
        className={`p-2 rounded-xl border transition-colors shrink-0 cursor-pointer ${
          isDone
            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
            : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
        } ${className}`}
      >
        {isDone ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      </button>
    );
  }

  if (variant === 'banner-button') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md backdrop-blur cursor-pointer ${
          isDone
            ? 'bg-emerald-600 text-white'
            : 'bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 hover:bg-white dark:hover:bg-stone-800 dark:border dark:border-stone-700'
        } ${className}`}
      >
        {isDone ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
        <span>{isDone ? 'Copied!' : label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
        isDone
          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700'
      } ${className}`}
    >
      {isDone ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-4 h-4" />}
      <span>{isDone ? 'Copied!' : label}</span>
    </button>
  );
};
