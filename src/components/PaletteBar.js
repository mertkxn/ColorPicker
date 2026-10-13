import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { generateHarmonies } from '../utils/colorUtils';

export default function PaletteBar({ dominantColors, activeColor, onSelectColor }) {
  const harmonies = generateHarmonies(activeColor || '#2A9D8F');

  const harmonyList = [
    { label: 'Seçili', color: activeColor },
    { label: 'Zıt (Uyumlu)', color: harmonies.complementary },
    { label: 'Benzer 1', color: harmonies.analogous1 },
    { label: 'Benzer 2', color: harmonies.analogous2 },
    { label: 'Üçlü 1', color: harmonies.triadic1 },
    { label: 'Üçlü 2', color: harmonies.triadic2 },
    { label: 'Açık Ton', color: harmonies.lighter },
    { label: 'Koyu Ton', color: harmonies.darker },
  ];

  return (
    <View style={styles.container}>
      {/* Görselden Çıkarılan Baskın Palet */}
      <Text style={styles.sectionTitle}>Fotoğrafın Renk Paleti</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paletteScroll}>
        {dominantColors.map((color, index) => {
          const isSelected = activeColor?.toUpperCase() === color.toUpperCase();
          return (
            <TouchableOpacity
              key={`dom-${index}`}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                isSelected && styles.selectedCircle,
              ]}
              onPress={() => onSelectColor(color)}
              activeOpacity={0.8}
            >
              {isSelected && <View style={styles.innerDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Renk Teorisi & Harmoni Önerileri */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Renk Teorisi & Harmoni (Öneriler)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paletteScroll}>
        {harmonyList.map((item, index) => {
          const isSelected = activeColor?.toUpperCase() === item.color?.toUpperCase();
          return (
            <TouchableOpacity
              key={`harm-${index}`}
              style={styles.harmonyItem}
              onPress={() => onSelectColor(item.color)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.harmonyCircle,
                  { backgroundColor: item.color },
                  isSelected && styles.selectedCircle,
                ]}
              />
              <Text style={styles.harmonyLabel}>{item.label}</Text>
              <Text style={styles.harmonyHex}>{item.color}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  paletteScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    borderColor: '#0F172A',
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  harmonyItem: {
    alignItems: 'center',
    width: 72,
  },
  harmonyCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  harmonyLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  harmonyHex: {
    fontSize: 10,
    color: '#0F172A',
    fontWeight: '700',
  },
});
