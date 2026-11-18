import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLightboxScaleClass, normalizeLightboxImage } from './imageLightboxHelpers';

describe('imageLightboxHelpers', () => {
  it('normalizes valid HTTP, relative asset, and data image URLs cleanly', () => {
    const res1 = normalizeLightboxImage({
      src: '  https://example.com/mohinga.jpg  ',
      alt: '',
      title: 'Royal Mohinga',
      subtitle: 'Shwe Taung Kitchen · 3,500 Ks',
      badge: 'Weekly Special',
    });
    assert.deepEqual(res1, {
      src: 'https://example.com/mohinga.jpg',
      alt: 'Royal Mohinga',
      title: 'Royal Mohinga',
      subtitle: 'Shwe Taung Kitchen · 3,500 Ks',
      badge: 'Weekly Special',
    });

    const res2 = normalizeLightboxImage({
      src: '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg',
      alt: 'Mohinga',
    });
    assert.equal(res2?.src, '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg');
    assert.equal(res2?.alt, 'Mohinga');
  });

  it('rejects empty inputs and unsafe URI schemes', () => {
    assert.equal(normalizeLightboxImage(null), null);
    assert.equal(normalizeLightboxImage(undefined), null);
    assert.equal(normalizeLightboxImage({ src: '   ', alt: 'Blank' }), null);
    assert.equal(normalizeLightboxImage({ src: 'javascript:alert(1)', alt: 'XSS' }), null);
    assert.equal(normalizeLightboxImage({ src: 'vbscript:msgbox(1)', alt: 'Bad' }), null);
    assert.equal(normalizeLightboxImage({ src: 'data:text/html,<script>', alt: 'Bad' }), null);
    assert.equal(normalizeLightboxImage({ src: 'file:///etc/passwd', alt: 'Bad' }), null);
  });

  it('returns proper zoom toggle scale classes', () => {
    assert.equal(getLightboxScaleClass(false), 'scale-100 cursor-zoom-in');
    assert.equal(getLightboxScaleClass(true), 'scale-150 cursor-zoom-out');
  });
});
