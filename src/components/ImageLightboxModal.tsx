import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { LightboxImageData, getLightboxScaleClass } from '../utils/imageLightboxHelpers';

interface ImageLightboxModalProps {
  image: LightboxImageData | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({ image, onClose }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setIsZoomed(false);
  }, [image?.src]);

  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.title || image.alt || 'Full image viewer'}
      data-testid="image-lightbox-modal"
      onClick={onClose}
      className="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-sm select-none"
    >
      {/* Top Toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 bg-gradient-to-b from-black/85 to-transparent shrink-0"
      >
        <div className="min-w-0 flex items-center gap-2.5">
          {image.badge && (
            <span className="px-2 py-0.5 rounded bg-amber-600/90 text-stone-100 text-[10px] font-bold uppercase tracking-wider shrink-0">
              {image.badge}
            </span>
          )}
          <div className="min-w-0">
            {image.title && (
              <p className="text-sm font-bold text-stone-100 truncate">
                {image.title}
              </p>
            )}
            {image.subtitle && (
              <p className="text-xs text-stone-400 truncate">
                {image.subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsZoomed((prev) => !prev)}
            data-testid="image-lightbox-zoom-toggle"
            aria-label={isZoomed ? 'Fit image to screen' : 'Zoom in image'}
            title={isZoomed ? 'Fit to screen' : 'Zoom in'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-100 border border-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            <span className="hidden sm:inline">{isZoomed ? 'Fit' : 'Zoom'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            data-testid="image-lightbox-close"
            aria-label="Close full image view"
            title="Close (Esc)"
            className="w-10 h-10 rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-100 border border-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Centered Whole-Image Canvas */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-auto min-h-0">
        <img
          src={image.src}
          alt={image.alt}
          referrerPolicy="no-referrer"
          data-testid="image-lightbox-img"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed((prev) => !prev);
          }}
          className={`max-w-full max-h-[82vh] w-auto h-auto object-contain rounded-lg shadow-2xl transition-transform duration-200 ${getLightboxScaleClass(
            isZoomed
          )}`}
        />
      </div>

      {/* Bottom Subtle Caption / Hint */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="px-4 py-2.5 text-center text-[11px] text-stone-400 bg-gradient-to-t from-black/80 to-transparent shrink-0"
      >
        Tap image to {isZoomed ? 'fit screen' : 'zoom'} · Tap outside or press Esc to close
      </div>
    </div>
  );
};
