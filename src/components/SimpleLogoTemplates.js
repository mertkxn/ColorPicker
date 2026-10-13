import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getContrastTextColor } from '../utils/colorUtils';

export default function SimpleLogoTemplates({
  templateType,
  brandName,
  tagline,
  iconName,
  primaryColor,
  backgroundColor,
  textColor,
}) {
  const contrastBg = getContrastTextColor(backgroundColor);
  const actualTextColor = textColor || contrastBg;
  const initials = (brandName || 'CP').slice(0, 2).toUpperCase();

  switch (templateType) {
    case 'monogram':
      return (
        <View style={[styles.canvas, { backgroundColor }]}>
          <View style={[styles.monogramBorder, { borderColor: primaryColor }]}>
            <View style={[styles.monogramInner, { backgroundColor: primaryColor }]}>
              <Text style={[styles.monogramLetter, { color: getContrastTextColor(primaryColor) }]}>
                {initials}
              </Text>
            </View>
          </View>
          <Text style={[styles.brandText, { color: actualTextColor, marginTop: 16 }]}>
            {brandName || 'MARKA ADI'}
          </Text>
          {tagline ? (
            <Text style={[styles.taglineText, { color: actualTextColor, opacity: 0.7 }]}>
              {tagline}
            </Text>
          ) : null}
        </View>
      );

    case 'badge':
      return (
        <View style={[styles.canvas, { backgroundColor }]}>
          <View style={[styles.badgeOuter, { borderColor: primaryColor }]}>
            <View style={[styles.badgeDotted, { borderColor: primaryColor }]}>
              <Ionicons name={iconName || 'sparkles'} size={40} color={primaryColor} />
              <Text style={[styles.badgeBrand, { color: primaryColor }]}>
                {brandName || 'ORIJINAL'}
              </Text>
              <View style={[styles.badgeDivider, { backgroundColor: primaryColor }]} />
              <Text style={[styles.badgeTagline, { color: primaryColor }]}>
                {tagline || 'EST. 2026'}
              </Text>
            </View>
          </View>
        </View>
      );

    case 'card':
      return (
        <View style={[styles.canvas, styles.cardCanvas, { backgroundColor }]}>
          <View style={[styles.cardAccentBar, { backgroundColor: primaryColor }]} />
          <View style={styles.cardContent}>
            <View style={[styles.cardIconBox, { backgroundColor: primaryColor }]}>
              <Ionicons name={iconName || 'cube'} size={28} color={getContrastTextColor(primaryColor)} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[styles.cardBrand, { color: actualTextColor }]}>
                {brandName || 'ŞİRKET ADI'}
              </Text>
              <Text style={[styles.cardTag, { color: actualTextColor, opacity: 0.7 }]}>
                {tagline || 'Yaratıcı Tasarım & Stüdyo'}
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={[styles.cardHexInfo, { color: actualTextColor, opacity: 0.5 }]}>
              PALET: {primaryColor}
            </Text>
          </View>
        </View>
      );

    case 'minimal':
    default:
      return (
        <View style={[styles.canvas, { backgroundColor }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}20` }]}>
            <Ionicons name={iconName || 'flame'} size={54} color={primaryColor} />
          </View>
          <Text style={[styles.brandText, { color: actualTextColor }]}>
            {brandName || 'MARKA ADI'}
          </Text>
          {tagline ? (
            <Text style={[styles.taglineText, { color: actualTextColor, opacity: 0.7 }]}>
              {tagline}
            </Text>
          ) : null}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  canvas: {
    width: 320,
    height: 320,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    alignSelf: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  taglineText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: 6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  monogramBorder: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 3,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monogramInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monogramLetter: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 1,
  },
  badgeOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDotted: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  badgeBrand: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 6,
    textAlign: 'center',
  },
  badgeDivider: {
    width: 50,
    height: 2,
    marginVertical: 6,
    borderRadius: 1,
  },
  badgeTagline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  cardCanvas: {
    width: 320,
    height: 200,
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardAccentBar: {
    width: '100%',
    height: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
  },
  cardIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardTag: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  cardFooter: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    width: '100%',
    alignItems: 'flex-end',
  },
  cardHexInfo: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
