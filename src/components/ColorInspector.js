import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { hexToRgb, rgbToHsl, getContrastTextColor } from '../utils/colorUtils';

export default function ColorInspector({ color, onUseInDesign }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const contrastText = getContrastTextColor(color);

  const copyToClipboard = async (text, key) => {
    await Clipboard.setStringAsync(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <View style={styles.container}>
      {/* Büyük Renk Kartı */}
      <View style={[styles.colorPreview, { backgroundColor: color }]}>
        <View style={styles.colorHeader}>
          <Text style={[styles.colorHexLarge, { color: contrastText }]}>{color}</Text>
          <TouchableOpacity
            style={[styles.copyIconBtn, { backgroundColor: contrastText === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}
            onPress={() => copyToClipboard(color, 'hex')}
          >
            <Ionicons
              name={copiedKey === 'hex' ? 'checkmark' : 'copy-outline'}
              size={18}
              color={contrastText}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.colorSubCodes}>
          <TouchableOpacity onPress={() => copyToClipboard(rgbString, 'rgb')}>
            <Text style={[styles.codeText, { color: contrastText }]}>
              {copiedKey === 'rgb' ? 'Kopyalandı!' : rgbString}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => copyToClipboard(hslString, 'hsl')}>
            <Text style={[styles.codeText, { color: contrastText }]}>
              {copiedKey === 'hsl' ? 'Kopyalandı!' : hslString}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tasarımda Kullan Eylemi */}
      {onUseInDesign && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => onUseInDesign(color)}>
          <Ionicons name="color-wand" size={18} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Bu Rengi Tasarımda Kullan</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  colorPreview: {
    borderRadius: 18,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  colorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorHexLarge: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  copyIconBtn: {
    padding: 8,
    borderRadius: 20,
  },
  colorSubCodes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
  },
  codeText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
