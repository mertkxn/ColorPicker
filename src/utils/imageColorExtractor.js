import { Platform } from 'react-native';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import { rgbToHex } from './colorUtils';

let cachedDecodedImage = null;
let cachedImageUri = null;
let webCanvas = null;
let webCtx = null;
let webImg = null;

// Fotoğrafın Base64 içeriğini güvenli okuma
async function readImageBase64(uri) {
  try {
    // 1. expo-file-system/legacy yöntemi (Expo SDK 54, 55, 57 ile tam uyumlu)
    if (FileSystemLegacy && FileSystemLegacy.readAsStringAsync) {
      return await FileSystemLegacy.readAsStringAsync(uri, {
        encoding: FileSystemLegacy.EncodingType.Base64,
      });
    }
  } catch (err) {
    console.log('Legacy read denendi, alternatif deneniyor...');
  }

  // 2. Yeni Expo File API yöntemi
  try {
    const ExpoFileSystem = require('expo-file-system');
    if (ExpoFileSystem.File) {
      const file = new ExpoFileSystem.File(uri);
      return await file.base64();
    }
  } catch (err) {
    console.log('New File API denendi...');
  }

  return null;
}

// Görseli decode edip hafızada tutar
export async function decodeImageIfNeeded(uri) {
  if (cachedImageUri === uri && (cachedDecodedImage || webImg)) {
    return cachedDecodedImage || webImg;
  }

  cachedImageUri = uri;

  // Web Platformu
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(null);
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        webImg = img;
        const canvas = window.document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        webCanvas = canvas;
        webCtx = ctx;
        resolve(img);
      };
      img.onerror = () => {
        console.warn('Web görsel yükleme hatası');
        resolve(null);
      };
      img.src = uri;
    });
  }

  // Mobil Platform (Android & iOS)
  try {
    const base64Data = await readImageBase64(uri);
    if (!base64Data) {
      console.warn('Görsel base64 olarak okunamadı.');
      return null;
    }
    const jpegData = Buffer.from(base64Data, 'base64');
    const decoded = jpeg.decode(jpegData, { useTArray: true, formatAsRGBA: true });
    cachedDecodedImage = decoded;
    return decoded;
  } catch (error) {
    console.warn('Görsel decode edilirken hata:', error);
    return null;
  }
}

// Görselden baskın renk paleti çıkarır
export async function extractDominantColors(uri, colorCount = 6) {
  try {
    await decodeImageIfNeeded(uri);

    // Web Platformu
    if (Platform.OS === 'web' && webCtx && webCanvas) {
      const { width, height } = webCanvas;
      const imgData = webCtx.getImageData(0, 0, width, height).data;
      return analyzePixelData(imgData, width, height, colorCount);
    }

    // Mobil Platform
    if (cachedDecodedImage && cachedDecodedImage.data) {
      const { width, height, data } = cachedDecodedImage;
      return analyzePixelData(data, width, height, colorCount);
    }

    return ['#2A9D8F', '#E76F51', '#F4A261', '#E9C46A', '#264653', '#1D3557'];
  } catch (error) {
    console.warn('Palet çıkarma hatası:', error);
    return ['#3A86FF', '#8338EC', '#FF006E', '#FB5607', '#FFBE0B', '#38B000'];
  }
}

function analyzePixelData(data, width, height, colorCount) {
  const pixelCount = width * height;
  const step = Math.max(1, Math.floor(pixelCount / 4000));
  const colorBuckets = {};

  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 128) continue;

    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;
    const key = `${qr},${qg},${qb}`;

    if (!colorBuckets[key]) {
      colorBuckets[key] = { r: 0, g: 0, b: 0, count: 0 };
    }
    colorBuckets[key].r += r;
    colorBuckets[key].g += g;
    colorBuckets[key].b += b;
    colorBuckets[key].count += 1;
  }

  const sorted = Object.values(colorBuckets).sort((a, b) => b.count - a.count);
  const dominantColors = [];

  for (const item of sorted) {
    if (dominantColors.length >= colorCount) break;
    const r = Math.round(item.r / item.count);
    const g = Math.round(item.g / item.count);
    const b = Math.round(item.b / item.count);
    const hex = rgbToHex(r, g, b);

    const isTooSimilar = dominantColors.some((c) => {
      const diff = Math.abs(parseInt(c.slice(1, 3), 16) - r) +
                   Math.abs(parseInt(c.slice(3, 5), 16) - g) +
                   Math.abs(parseInt(c.slice(5, 7), 16) - b);
      return diff < 60;
    });

    if (!isTooSimilar) {
      dominantColors.push(hex);
    }
  }

  return dominantColors.length > 0
    ? dominantColors
    : ['#2A9D8F', '#E76F51', '#F4A261', '#E9C46A', '#264653', '#1D3557'];
}

// Belirtilen (x, y) piksel rengini okur
export function getPixelColorAt(relativeX, relativeY) {
  if (Platform.OS === 'web' && webCtx && webCanvas) {
    const px = Math.min(webCanvas.width - 1, Math.max(0, Math.floor(relativeX * webCanvas.width)));
    const py = Math.min(webCanvas.height - 1, Math.max(0, Math.floor(relativeY * webCanvas.height)));
    const pixel = webCtx.getImageData(px, py, 1, 1).data;
    return {
      r: pixel[0],
      g: pixel[1],
      b: pixel[2],
      hex: rgbToHex(pixel[0], pixel[1], pixel[2]),
    };
  }

  if (!cachedDecodedImage || !cachedDecodedImage.data) {
    return null;
  }
  const { width, height, data } = cachedDecodedImage;
  const px = Math.min(width - 1, Math.max(0, Math.floor(relativeX * width)));
  const py = Math.min(height - 1, Math.max(0, Math.floor(relativeY * height)));
  const index = (py * width + px) * 4;

  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  return {
    r,
    g,
    b,
    hex: rgbToHex(r, g, b),
  };
}
