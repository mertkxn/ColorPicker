import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdvancedCanvas({
  canvasBg,
  elements,
  selectedId,
  onSelectElement,
}) {
  return (
    <View style={[styles.canvas, { backgroundColor: canvasBg }]}>
      {elements.length === 0 && (
        <View style={styles.emptyNotice}>
          <Ionicons name="add-circle-outline" size={36} color="#94A3B8" />
          <Text style={styles.emptyNoticeText}>
            Aşağıdaki butonları kullanarak tuvale metin, ikon veya şekil ekleyin.
          </Text>
        </View>
      )}

      {elements.map((el) => {
        const isSelected = el.id === selectedId;

        return (
          <TouchableOpacity
            key={el.id}
            activeOpacity={0.9}
            onPress={() => onSelectElement(el.id)}
            style={[
              styles.elementWrapper,
              {
                left: el.x,
                top: el.y,
              },
              isSelected && styles.selectedBorder,
            ]}
          >
            {el.type === 'text' && (
              <Text
                style={{
                  color: el.color,
                  fontSize: el.size,
                  fontWeight: el.bold ? '800' : '500',
                  letterSpacing: 1,
                }}
              >
                {el.content}
              </Text>
            )}

            {el.type === 'icon' && (
              <Ionicons name={el.name} size={el.size} color={el.color} />
            )}

            {el.type === 'circle' && (
              <View
                style={{
                  width: el.size,
                  height: el.size,
                  borderRadius: el.size / 2,
                  backgroundColor: el.color,
                }}
              />
            )}

            {el.type === 'square' && (
              <View
                style={{
                  width: el.size,
                  height: el.size,
                  borderRadius: el.rounded ? 16 : 0,
                  backgroundColor: el.color,
                }}
              />
            )}

            {el.type === 'line' && (
              <View
                style={{
                  width: el.size * 2,
                  height: 4,
                  backgroundColor: el.color,
                  borderRadius: 2,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: 320,
    height: 320,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  elementWrapper: {
    position: 'absolute',
    padding: 6,
    borderRadius: 6,
  },
  selectedBorder: {
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  emptyNotice: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyNoticeText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});
