import { useEffect } from 'react';
import { Platform } from 'react-native';

const FONT_STYLESHEET_ID = 'ody-google-fonts';
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';

/**
 * Expo web with `output: "single"` serves a default HTML shell and does not apply
 * `+html.tsx` in dev — so Google Fonts <link> tags there never reach the document.
 * Inject the stylesheet from the React tree instead (web only).
 */
export function WebFonts() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const existing = document.getElementById(FONT_STYLESHEET_ID) as HTMLLinkElement | null;
    if (existing) {
      existing.href = FONT_HREF;
      return;
    }

    const preconnectGoogle = document.createElement('link');
    preconnectGoogle.rel = 'preconnect';
    preconnectGoogle.href = 'https://fonts.googleapis.com';

    const preconnectGstatic = document.createElement('link');
    preconnectGstatic.rel = 'preconnect';
    preconnectGstatic.href = 'https://fonts.gstatic.com';
    preconnectGstatic.crossOrigin = 'anonymous';

    const stylesheet = document.createElement('link');
    stylesheet.id = FONT_STYLESHEET_ID;
    stylesheet.rel = 'stylesheet';
    stylesheet.href = FONT_HREF;

    document.head.append(preconnectGoogle, preconnectGstatic, stylesheet);
  }, []);

  return null;
}
