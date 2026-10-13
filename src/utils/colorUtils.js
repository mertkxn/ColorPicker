// Renk teorisi ve kod dönüştürme yardımcı fonksiyonları

export function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToRgb(hex) {
  let c = (hex || '#000000').replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h, s, l) {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

// Renk Harmonileri Üretici
export function generateHarmonies(hexColor) {
  try {
    const { r, g, b } = hexToRgb(hexColor);
    const { h, s, l } = rgbToHsl(r, g, b);

    return {
      base: hexColor,
      complementary: hslToHex(h + 180, s, l),
      analogous1: hslToHex(h - 30, s, l),
      analogous2: hslToHex(h + 30, s, l),
      triadic1: hslToHex(h + 120, s, l),
      triadic2: hslToHex(h + 240, s, l),
      lighter: hslToHex(h, s, Math.min(92, l + 25)),
      darker: hslToHex(h, s, Math.max(12, l - 25)),
    };
  } catch {
    return {
      base: hexColor,
      complementary: '#FFFFFF',
      analogous1: '#CCCCCC',
      analogous2: '#888888',
      triadic1: '#555555',
      triadic2: '#222222',
      lighter: '#EEEEEE',
      darker: '#111111',
    };
  }
}

// Renk üzerine yazılacak metin rengi (kontrast)
export function getContrastTextColor(hexColor) {
  try {
    const { r, g, b } = hexToRgb(hexColor);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#1A1A1A' : '#FFFFFF';
  } catch {
    return '#FFFFFF';
  }
}
