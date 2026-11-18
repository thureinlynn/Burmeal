export interface LightboxImageData {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  badge?: string;
}

const UNSAFE_SCHEME_PATTERN = /^(javascript|vbscript|file|data:text\/html)/i;

/**
 * Validates and normalizes an image payload before opening the Facebook-style whole-image viewer.
 * Returns null if the source URL is empty or uses a dangerous scheme.
 */
export function normalizeLightboxImage(
  input: Partial<LightboxImageData> | null | undefined
): LightboxImageData | null {
  if (!input) return null;
  const rawSrc = typeof input.src === 'string' ? input.src.trim() : '';
  if (!rawSrc || UNSAFE_SCHEME_PATTERN.test(rawSrc)) {
    return null;
  }

  const cleanAlt =
    (typeof input.alt === 'string' ? input.alt.trim() : '') ||
    (typeof input.title === 'string' ? input.title.trim() : '') ||
    'Food item image';

  return {
    src: rawSrc,
    alt: cleanAlt,
    title: typeof input.title === 'string' && input.title.trim() ? input.title.trim() : undefined,
    subtitle:
      typeof input.subtitle === 'string' && input.subtitle.trim() ? input.subtitle.trim() : undefined,
    badge: typeof input.badge === 'string' && input.badge.trim() ? input.badge.trim() : undefined,
  };
}

export function getLightboxScaleClass(isZoomed: boolean): string {
  return isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in';
}
