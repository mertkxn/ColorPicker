import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

import {
  extractDominantColors,
  getPixelColorAt,
  decodeImageIfNeeded,
} from './src/utils/imageColorExtractor';
import ColorInspector from './src/components/ColorInspector';
import PaletteBar from './src/components/PaletteBar';
import SimpleLogoTemplates from './src/components/SimpleLogoTemplates';
import AdvancedCanvas from './src/components/AdvancedCanvas';

// ViewShot'ı web ortamında güvenli yükle
let ViewShot = View;
if (Platform.OS !== 'web') {
  try {
    ViewShot = require('react-native-view-shot').default || require('react-native-view-shot');
  } catch (e) {
    ViewShot = View;
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Örnek başlangıç renkleri
const DEFAULT_PALETTE = ['#2A9D8F', '#E76F51', '#F4A261', '#E9C46A', '#264653', '#1D3557'];

// Basit mod için seçilebilir ikonlar
const AVAILABLE_ICONS = [
  'sparkles', 'flame', 'cube', 'diamond', 'leaf', 'planet', 'rocket', 'cafe',
  'camera', 'code-slash', 'color-palette', 'bulb', 'infinite', 'shield-checkmark',
];

export default function App() {
  const [activeTab, setActiveTab] = useState('picker'); // 'picker' | 'studio' | 'export'

  // Renk & Görsel Durumları
  const [imageUri, setImageUri] = useState(null);
  const [dominantColors, setDominantColors] = useState(DEFAULT_PALETTE);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_PALETTE[0]);
  const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });
  const [isLoupeActive, setIsLoupeActive] = useState(false);

  // Logo & Stüdyo Durumları
  const [studioMode, setStudioMode] = useState('simple'); // 'simple' | 'advanced'
  const [simpleTemplate, setSimpleTemplate] = useState('minimal'); // 'minimal' | 'monogram' | 'badge' | 'card'
  const [brandName, setBrandName] = useState('STUDIO');
  const [tagline, setTagline] = useState('CREATIVE DESIGN');
  const [selectedIcon, setSelectedIcon] = useState('sparkles');
  const [simpleBgColor, setSimpleBgColor] = useState('#FFFFFF');
  const [simplePrimaryColor, setSimplePrimaryColor] = useState(DEFAULT_PALETTE[0]);

  // Gelişmiş Tuval Durumları
  const [advancedBg, setAdvancedBg] = useState('#FFFFFF');
  const [advancedElements, setAdvancedElements] = useState([
    { id: '1', type: 'circle', x: 120, y: 70, size: 80, color: DEFAULT_PALETTE[0] },
    { id: '2', type: 'icon', name: 'sparkles', x: 140, y: 90, size: 40, color: '#FFFFFF' },
    { id: '3', type: 'text', content: 'STUDIO', x: 100, y: 180, size: 28, bold: true, color: '#0F172A' },
  ]);
  const [selectedElementId, setSelectedElementId] = useState('1');

  const viewShotRef = useRef();

  // Fotoğrafı analiz için optimize edilmiş JPEG formatına çevirir
  const optimizeImage = async (rawUri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        rawUri,
        [{ resize: { width: 600 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch {
      return rawUri;
    }
  };

  // Kamera ile çekme
  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      pickImage();
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamera izni vermeniz gerekir.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      const optimizedUri = await optimizeImage(result.assets[0].uri);
      handleImageLoaded(optimizedUri);
    }
  };

  // Galeriden seçme
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      const optimizedUri = await optimizeImage(result.assets[0].uri);
      handleImageLoaded(optimizedUri);
    }
  };

  // Yeni görsel yüklendiğinde analiz et
  const handleImageLoaded = async (uri) => {
    setImageUri(uri);
    await decodeImageIfNeeded(uri);
    const colors = await extractDominantColors(uri, 6);
    setDominantColors(colors);
    setSelectedColor(colors[0]);
    setSimplePrimaryColor(colors[0]);
  };

  // Fotoğrafa dokunulduğunda piksel rengini alma
  const handleImageTouch = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const imgWidth = Math.min(SCREEN_WIDTH - 32, 500);
    const imgHeight = 260;

    const relX = Math.max(0, Math.min(1, locationX / imgWidth));
    const relY = Math.max(0, Math.min(1, locationY / imgHeight));

    setTouchPos({ x: locationX, y: locationY });
    setIsLoupeActive(true);

    const pixel = getPixelColorAt(relX, relY);
    if (pixel?.hex) {
      setSelectedColor(pixel.hex);
    }
  };

  // Bu rengi tasarıma aktar
  const handleUseInDesign = (color) => {
    setSimplePrimaryColor(color);
    if (selectedElementId) {
      updateSelectedElementColor(color);
    }
    setActiveTab('studio');
  };

  // Gelişmiş Tuval Yardımcıları
  const addElement = (type) => {
    const newId = Date.now().toString();
    let newEl;
    if (type === 'text') {
      newEl = { id: newId, type: 'text', content: 'YENİ METİN', x: 80, y: 140, size: 22, bold: true, color: selectedColor };
    } else if (type === 'icon') {
      newEl = { id: newId, type: 'icon', name: 'cube', x: 135, y: 120, size: 50, color: selectedColor };
    } else if (type === 'circle') {
      newEl = { id: newId, type: 'circle', x: 125, y: 120, size: 70, color: selectedColor };
    } else if (type === 'square') {
      newEl = { id: newId, type: 'square', x: 125, y: 120, size: 70, rounded: true, color: selectedColor };
    }
    setAdvancedElements([...advancedElements, newEl]);
    setSelectedElementId(newId);
  };

  const moveSelectedElement = (dx, dy) => {
    setAdvancedElements(advancedElements.map(el => {
      if (el.id === selectedElementId) {
        return { ...el, x: Math.max(0, Math.min(260, el.x + dx)), y: Math.max(0, Math.min(260, el.y + dy)) };
      }
      return el;
    }));
  };

  const resizeSelectedElement = (delta) => {
    setAdvancedElements(advancedElements.map(el => {
      if (el.id === selectedElementId) {
        return { ...el, size: Math.max(12, Math.min(160, el.size + delta)) };
      }
      return el;
    }));
  };

  const updateSelectedElementColor = (color) => {
    setAdvancedElements(advancedElements.map(el => {
      if (el.id === selectedElementId) {
        return { ...el, color };
      }
      return el;
    }));
  };

  const deleteSelectedElement = () => {
    setAdvancedElements(advancedElements.filter(el => el.id !== selectedElementId));
    setSelectedElementId(null);
  };

  // Tasarımı PNG olarak dışa aktar ve kaydet
  const saveDesignToGallery = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Web Önizleme', 'Web ortamında tasarımı önizleyebilirsiniz. Mobilde doğrudan telefon galerisine kaydedilir.');
      return;
    }
    try {
      const MediaLibrary = require('expo-media-library');
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Tasarımı kaydedebilmek için galeri izni gereklidir.');
        return;
      }
      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Başarılı! 🎉', 'Tasarımınız fotoğraf galerisine kaydedildi.');
    } catch (error) {
      Alert.alert('Hata', 'Kaydedilirken hata oluştu: ' + error.message);
    }
  };

  // Tasarımı Paylaş
  const shareDesign = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Web Önizleme', 'Paylaşım özelliği mobil cihazlarda doğrudan açılır.');
      return;
    }
    try {
      const Sharing = require('expo-sharing');
      const uri = await viewShotRef.current.capture();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım hatası: ' + error.message);
    }
  };

  // Palet Kodlarını Kopyala
  const copyPaletteCode = async (format) => {
    let output = '';
    if (format === 'css') {
      output = dominantColors.map((c, i) => `--color-${i + 1}: ${c};`).join('\n');
    } else if (format === 'json') {
      output = JSON.stringify({ palette: dominantColors }, null, 2);
    } else {
      output = dominantColors.join(', ');
    }
    await Clipboard.setStringAsync(output);
    Alert.alert('Kopyalandı! 📋', `${format.toUpperCase()} palet kodları panoya kopyalandı.`);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        {/* Üst Logo & Başlık Çubuğu */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIconBox, { backgroundColor: selectedColor }]}>
              <Ionicons name="color-filter" size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>ColorCraft</Text>
              <Text style={styles.headerSubtitle}>Renk Seçici & Tasarım Stüdyosu</Text>
            </View>
          </View>
        </View>

        {/* Navigasyon Sekmeleri */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'picker' && styles.tabItemActive]}
            onPress={() => setActiveTab('picker')}
          >
            <Ionicons
              name="color-palette-outline"
              size={18}
              color={activeTab === 'picker' ? '#3B82F6' : '#64748B'}
            />
            <Text style={[styles.tabLabel, activeTab === 'picker' && styles.tabLabelActive]}>
              Renk Seçici
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'studio' && styles.tabItemActive]}
            onPress={() => setActiveTab('studio')}
          >
            <Ionicons
              name="shapes"
              size={18}
              color={activeTab === 'studio' ? '#3B82F6' : '#64748B'}
            />
            <Text style={[styles.tabLabel, activeTab === 'studio' && styles.tabLabelActive]}>
              Logo Stüdyosu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'export' && styles.tabItemActive]}
            onPress={() => setActiveTab('export')}
          >
            <Ionicons
              name="code-working"
              size={18}
              color={activeTab === 'export' ? '#3B82F6' : '#64748B'}
            />
            <Text style={[styles.tabLabel, activeTab === 'export' && styles.tabLabelActive]}>
              Palet Kodları
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ana İçerik */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

          {/* 1. SEKME: RENK SEÇİCİ */}
          {activeTab === 'picker' && (
            <View style={styles.tabContentInner}>
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                  <Ionicons name="images" size={20} color="#0F172A" />
                  <Text style={styles.photoBtnText}>Galeriden Seç</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.photoBtn, styles.photoBtnPrimary]} onPress={takePhoto}>
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                  <Text style={[styles.photoBtnText, { color: '#FFFFFF' }]}>Fotoğraf Çek</Text>
                </TouchableOpacity>
              </View>

              {/* Fotoğraf Alanı & Büyüteç */}
              <View
                style={styles.imageCard}
                onStartShouldSetResponder={() => true}
                onResponderMove={handleImageTouch}
                onResponderGrant={handleImageTouch}
                onResponderRelease={() => setIsLoupeActive(false)}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholderBox}>
                    <Ionicons name="image-outline" size={54} color="#94A3B8" />
                    <Text style={styles.placeholderText}>
                      Renk seçmek için yukarıdaki butonlarla bir fotoğraf çekin veya seçin.
                    </Text>
                  </View>
                )}

                {/* Büyüteç Göstergesi */}
                {isLoupeActive && (
                  <View
                    style={[
                      styles.loupeIndicator,
                      {
                        left: touchPos.x - 30,
                        top: touchPos.y - 70,
                        borderColor: selectedColor,
                      },
                    ]}
                  >
                    <View style={[styles.loupeColor, { backgroundColor: selectedColor }]} />
                  </View>
                )}
              </View>

              {/* Seçilen Rengin Detayları */}
              <ColorInspector color={selectedColor} onUseInDesign={handleUseInDesign} />

              {/* Baskın Renkler ve Renk Teorisi Harmonileri */}
              <PaletteBar
                dominantColors={dominantColors}
                activeColor={selectedColor}
                onSelectColor={(c) => setSelectedColor(c)}
              />
            </View>
          )}

          {/* 2. SEKME: LOGO & TASARIM STÜDYOSU */}
          {activeTab === 'studio' && (
            <View style={styles.tabContentInner}>
              {/* Mod Seçici (Basit vs Gelişmiş) */}
              <View style={styles.modeToggleContainer}>
                <TouchableOpacity
                  style={[styles.modeToggleBtn, studioMode === 'simple' && styles.modeToggleActive]}
                  onPress={() => setStudioMode('simple')}
                >
                  <Ionicons name="color-wand-outline" size={16} color={studioMode === 'simple' ? '#3B82F6' : '#64748B'} />
                  <Text style={[styles.modeToggleText, studioMode === 'simple' && styles.modeToggleTextActive]}>
                    Basit Mod (Şablonlar)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeToggleBtn, studioMode === 'advanced' && styles.modeToggleActive]}
                  onPress={() => setStudioMode('advanced')}
                >
                  <Ionicons name="layers-outline" size={16} color={studioMode === 'advanced' ? '#3B82F6' : '#64748B'} />
                  <Text style={[styles.modeToggleText, studioMode === 'advanced' && styles.modeToggleTextActive]}>
                    Gelişmiş Mod (Tuval)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tasarım Önizleme Alanı */}
              <View style={styles.canvasContainer}>
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
                  {studioMode === 'simple' ? (
                    <SimpleLogoTemplates
                      templateType={simpleTemplate}
                      brandName={brandName}
                      tagline={tagline}
                      iconName={selectedIcon}
                      primaryColor={simplePrimaryColor}
                      backgroundColor={simpleBgColor}
                    />
                  ) : (
                    <AdvancedCanvas
                      canvasBg={advancedBg}
                      elements={advancedElements}
                      selectedId={selectedElementId}
                      onSelectElement={(id) => setSelectedElementId(id)}
                    />
                  )}
                </ViewShot>
              </View>

              {/* Kaydetme & Paylaşma Butonları */}
              <View style={styles.exportBar}>
                <TouchableOpacity style={styles.exportBtn} onPress={saveDesignToGallery}>
                  <Ionicons name="download" size={18} color="#FFFFFF" />
                  <Text style={styles.exportBtnText}>Galeriye Kaydet</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.exportBtn, styles.shareBtn]} onPress={shareDesign}>
                  <Ionicons name="share-social" size={18} color="#0F172A" />
                  <Text style={[styles.exportBtnText, { color: '#0F172A' }]}>Paylaş</Text>
                </TouchableOpacity>
              </View>

              {/* BASİT MOD KONTROLLERİ */}
              {studioMode === 'simple' && (
                <View style={styles.controlSection}>
                  <Text style={styles.controlHeader}>Şablon Tipi</Text>
                  <View style={styles.templateChips}>
                    {[
                      { id: 'minimal', label: 'Minimal İkon' },
                      { id: 'monogram', label: 'Monogram' },
                      { id: 'badge', label: 'Rozet' },
                      { id: 'card', label: 'Kartvizit' },
                    ].map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={[styles.chip, simpleTemplate === t.id && styles.chipActive]}
                        onPress={() => setSimpleTemplate(t.id)}
                      >
                        <Text style={[styles.chipText, simpleTemplate === t.id && styles.chipTextActive]}>
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Marka Adı ve Slogan Girişi */}
                  <Text style={styles.controlHeader}>Metinler</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Marka Adı"
                    value={brandName}
                    onChangeText={setBrandName}
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Slogan / Açıklama"
                    value={tagline}
                    onChangeText={setTagline}
                    placeholderTextColor="#94A3B8"
                  />

                  {/* İkon Seçimi */}
                  <Text style={styles.controlHeader}>İkon Seç</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconScroll}>
                    {AVAILABLE_ICONS.map((ic) => (
                      <TouchableOpacity
                        key={ic}
                        style={[styles.iconChip, selectedIcon === ic && styles.iconChipActive]}
                        onPress={() => setSelectedIcon(ic)}
                      >
                        <Ionicons name={ic} size={22} color={selectedIcon === ic ? '#3B82F6' : '#64748B'} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Paletten Renk Giydir */}
                  <Text style={styles.controlHeader}>Paletten Ana Rengi Seç</Text>
                  <View style={styles.paletteInline}>
                    {dominantColors.map((c, i) => (
                      <TouchableOpacity
                        key={`pal-apply-${i}`}
                        style={[
                          styles.paletteCircleApply,
                          { backgroundColor: c },
                          simplePrimaryColor === c && styles.paletteCircleActive,
                        ]}
                        onPress={() => setSimplePrimaryColor(c)}
                      />
                    ))}
                  </View>

                  {/* Arka Plan Tonu */}
                  <Text style={styles.controlHeader}>Arka Plan</Text>
                  <View style={styles.templateChips}>
                    {[
                      { label: 'Beyaz', color: '#FFFFFF' },
                      { label: 'Koyu', color: '#0F172A' },
                      { label: 'Açık Gri', color: '#F1F5F9' },
                      { label: 'Ana Renk', color: simplePrimaryColor },
                    ].map((bg, idx) => (
                      <TouchableOpacity
                        key={`bg-${idx}`}
                        style={[styles.chip, simpleBgColor === bg.color && styles.chipActive]}
                        onPress={() => setSimpleBgColor(bg.color)}
                      >
                        <Text style={[styles.chipText, simpleBgColor === bg.color && styles.chipTextActive]}>
                          {bg.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* GELİŞMİŞ MOD KONTROLLERİ */}
              {studioMode === 'advanced' && (
                <View style={styles.controlSection}>
                  <Text style={styles.controlHeader}>Tuvale Katman Ekle</Text>
                  <View style={styles.layerAddBar}>
                    <TouchableOpacity style={styles.layerAddBtn} onPress={() => addElement('text')}>
                      <Ionicons name="text" size={18} color="#0F172A" />
                      <Text style={styles.layerAddText}>Metin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.layerAddBtn} onPress={() => addElement('icon')}>
                      <Ionicons name="star" size={18} color="#0F172A" />
                      <Text style={styles.layerAddText}>İkon</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.layerAddBtn} onPress={() => addElement('circle')}>
                      <Ionicons name="ellipse" size={18} color="#0F172A" />
                      <Text style={styles.layerAddText}>Daire</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.layerAddBtn} onPress={() => addElement('square')}>
                      <Ionicons name="square" size={18} color="#0F172A" />
                      <Text style={styles.layerAddText}>Kare</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Seçili Katman Düzenleyici */}
                  {selectedElementId ? (
                    <View style={styles.elementEditorCard}>
                      <View style={styles.elementEditorHeader}>
                        <Text style={styles.elementEditorTitle}>Seçili Katmanı Düzenle</Text>
                        <TouchableOpacity onPress={deleteSelectedElement}>
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.subLabel}>Konumlandır</Text>
                      <View style={styles.dpad}>
                        <TouchableOpacity style={styles.dpadBtn} onPress={() => moveSelectedElement(0, -10)}>
                          <Ionicons name="arrow-up" size={18} color="#0F172A" />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', gap: 14 }}>
                          <TouchableOpacity style={styles.dpadBtn} onPress={() => moveSelectedElement(-10, 0)}>
                            <Ionicons name="arrow-back" size={18} color="#0F172A" />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.dpadBtn} onPress={() => moveSelectedElement(10, 0)}>
                            <Ionicons name="arrow-forward" size={18} color="#0F172A" />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.dpadBtn} onPress={() => moveSelectedElement(0, 10)}>
                          <Ionicons name="arrow-down" size={18} color="#0F172A" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.subLabel}>Boyut</Text>
                      <View style={styles.resizeRow}>
                        <TouchableOpacity style={styles.resizeBtn} onPress={() => resizeSelectedElement(-5)}>
                          <Ionicons name="remove" size={18} color="#0F172A" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.resizeBtn} onPress={() => resizeSelectedElement(5)}>
                          <Ionicons name="add" size={18} color="#0F172A" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.subLabel}>Paletten Katman Rengini Değiştir</Text>
                      <View style={styles.paletteInline}>
                        {dominantColors.map((c, i) => (
                          <TouchableOpacity
                            key={`adv-c-${i}`}
                            style={[styles.paletteCircleApply, { backgroundColor: c }]}
                            onPress={() => updateSelectedElementColor(c)}
                          />
                        ))}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.noSelectionText}>
                      Düzenlemek istediğiniz ögeye tuval üzerinde dokunun.
                    </Text>
                  )}

                  <Text style={styles.controlHeader}>Tuval Arka Planı</Text>
                  <View style={styles.paletteInline}>
                    {['#FFFFFF', '#0F172A', '#F1F5F9', ...dominantColors].map((c, i) => (
                      <TouchableOpacity
                        key={`adv-bg-${i}`}
                        style={[
                          styles.paletteCircleApply,
                          { backgroundColor: c },
                          advancedBg === c && styles.paletteCircleActive,
                        ]}
                        onPress={() => setAdvancedBg(c)}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* 3. SEKME: PALET KODLARI VE DIŞA AKTARMA */}
          {activeTab === 'export' && (
            <View style={[styles.exportSection, styles.tabContentInner]}>
              <Text style={styles.exportTitle}>Renk Paleti Kodları</Text>
              <Text style={styles.exportSubtitle}>
                Web ve mobil projelerinizde doğrudan kullanabileceğiniz renk kodları.
              </Text>

              <View style={styles.palettePreviewStrip}>
                {dominantColors.map((c, i) => (
                  <View key={`strip-${i}`} style={[styles.paletteStripItem, { backgroundColor: c }]}>
                    <Text style={styles.paletteStripHex}>{c}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.codeExportCard} onPress={() => copyPaletteCode('css')}>
                <View style={styles.codeExportHeader}>
                  <Ionicons name="logo-css3" size={24} color="#3B82F6" />
                  <Text style={styles.codeExportTitle}>CSS Variables Olarak Kopyala</Text>
                </View>
                <Text style={styles.codeSnippet}>
                  {dominantColors.map((c, i) => `--color-${i + 1}: ${c};`).join('\n')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.codeExportCard} onPress={() => copyPaletteCode('json')}>
                <View style={styles.codeExportHeader}>
                  <Ionicons name="logo-javascript" size={24} color="#F59E0B" />
                  <Text style={styles.codeExportTitle}>JSON Formatında Kopyala</Text>
                </View>
                <Text style={styles.codeSnippet}>
                  {JSON.stringify({ palette: dominantColors }, null, 2)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.codeExportCard} onPress={() => copyPaletteCode('hex')}>
                <View style={styles.codeExportHeader}>
                  <Ionicons name="copy-outline" size={24} color="#10B981" />
                  <Text style={styles.codeExportTitle}>HEX Kodları Listesi Olarak Kopyala</Text>
                </View>
                <Text style={styles.codeSnippet}>{dominantColors.join(', ')}</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    ...(Platform.OS === 'web' ? { minHeight: '100vh', height: '100%' } : {}),
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#3B82F6',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
    alignItems: 'center',
  },
  tabContentInner: {
    width: '100%',
    maxWidth: 520,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  photoBtnPrimary: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  photoBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  imageCard: {
    width: '100%',
    height: 260,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    padding: 24,
    alignItems: 'center',
  },
  placeholderText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
  },
  loupeIndicator: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loupeColor: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  modeToggleActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  modeToggleTextActive: {
    color: '#0F172A',
  },
  canvasContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  exportBar: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
  },
  shareBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  controlSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  controlHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 14,
  },
  templateChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: '#0F172A',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 8,
    fontWeight: '600',
  },
  iconScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconChipActive: {
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  paletteInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  paletteCircleApply: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 2,
  },
  paletteCircleActive: {
    borderColor: '#0F172A',
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  layerAddBar: {
    flexDirection: 'row',
    gap: 8,
  },
  layerAddBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  layerAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  elementEditorCard: {
    marginTop: 14,
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  elementEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  elementEditorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    marginTop: 8,
  },
  dpad: {
    alignItems: 'center',
    gap: 6,
  },
  dpadBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resizeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resizeBtn: {
    width: 44,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSelectionText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 14,
    fontStyle: 'italic',
  },
  exportSection: {
    paddingVertical: 8,
  },
  exportTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  exportSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 18,
  },
  palettePreviewStrip: {
    flexDirection: 'row',
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
  },
  paletteStripItem: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  paletteStripHex: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  codeExportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  codeExportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  codeExportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  codeSnippet: {
    backgroundColor: '#0F172A',
    color: '#38BDF8',
    padding: 12,
    borderRadius: 10,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
});
