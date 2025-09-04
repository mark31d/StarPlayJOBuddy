// Components/AboutScreen.js
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Share,
  Platform,
  Pressable,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* палитра под PlayOJO — БЕЗ градиентов для контейнеров */
const OJO = {
  panel:   '#0F0B2E',                 // фон карточек
  panelAlt:'#14123A',
  outline: '#4856FF',                 // обводка карточек
  text:    '#EAF0FF',                 // основной текст
  subtext: 'rgba(234,240,255,0.86)',  // вторичный текст
  title:   '#F5F1FF',                 // заголовки
  gold:    '#F6CC51',
  magenta: '#B50052',
  // для кнопок (градиент оставляем на них)
  pink:    '#FF62D7',
  purple:  '#7B3FF2',
  blue:    '#2E4BFF',
};

/* assets (webp) */
const BG        = require('../assets/bg1.webp');    // ФОН НЕ ПЕРЕКРЫВАЕМ
const ICON_BACK = require('../assets/icon_back.webp');
const LOGO      = require('../assets/Logo.webp');

/* шрифты */
const TITAN = Platform.select({ ios: 'TitanOne', android: 'TitanOne-Regular' });
const BODY  = Platform.select({ ios: undefined, android: 'sans-serif' });

/* ключи хранилища */
const STARS_KEY   = 'bsp:stars';
const QUESTS_KEY  = 'bsp:quests';
const PROFILE_KEY = '@bsp_profile';
const PET_LEVEL   = '@pet:level';

export default function AboutScreen({ navigation }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [appInfo, setAppInfo]   = useState(null);

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message: 'Star PlayJO Buddy — turn tiny steps into stellar achievements! ⭐️',
        title: 'Star PlayJO Buddy',
      });
    } catch {}
  }, []);

  // сводка из AsyncStorage
  const openInfo = useCallback(async () => {
    try {
      const [s, q, prof, lvl] = await Promise.all([
        AsyncStorage.getItem(STARS_KEY),
        AsyncStorage.getItem(QUESTS_KEY),
        AsyncStorage.getItem(PROFILE_KEY),
        AsyncStorage.getItem(PET_LEVEL),
      ]);

      let pet = '—';
      try {
        const p = prof ? JSON.parse(prof) : null;
        pet = p?.pet ? String(p.pet).charAt(0).toUpperCase() + String(p.pet).slice(1) : '—';
      } catch {}

      const quests = q ? JSON.parse(q) : [];
      setAppInfo({
        stars: Number(s || 0),
        questsCount: Array.isArray(quests) ? quests.length : 0,
        pet,
        level: Number(lvl || 1),
      });
    } catch {
      setAppInfo({ stars: 0, questsCount: 0, pet: '—', level: 1 });
    }
    setInfoOpen(true);
  }, []);

  const gradMain = useMemo(() => [OJO.pink, OJO.blue], []);
  const gradAlt  = useMemo(() => [OJO.blue, OJO.purple], []);

  return (
    <View style={s.root}>
      <ImageBackground source={BG} style={s.bg} resizeMode="cover">
        {/* полупрозрачная вуаль — меняем задний фон без замены картинки */}
        <View style={s.tint} />

        {/* Header */}
        <View style={s.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={s.back}>
            <Image source={ICON_BACK} style={{ width: 48, height: 48 }} />
          </Pressable>
          <Text style={[s.headerTitle, s.titleGlow]}>About</Text>
          <View style={s.back} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Лого — однотонный контейнер */}
          <View style={[s.card, s.neon]}>
            <Image source={LOGO} style={s.logo} resizeMode="contain" />
            <Text style={s.brandTitle}>STAR PLAYJO BUDDY</Text>
          </View>

          {/* Текст — однотонный контейнер */}
          <View style={[s.card, s.neonSoft]}>
            <Text style={s.paragraph}>
              <Text style={s.b}>Star PlayJO Buddy</Text> is your playful way to turn tiny steps into real habits.
              Complete mini-quests, collect stars and keep your Buddy happy and evolving!
            </Text>

            <Text style={s.subhead}>What it does</Text>
            <Text style={s.paragraph}>
              • Daily quests — add your own and get 3★ for each completion.{'\n'}
              • Buddy growth — level up your star pet as you progress.{'\n'}
              • Gentle reminders — keep the streak fun, not stressful.
            </Text>

            <Text style={s.subhead}>Why it works</Text>
            <Text style={s.paragraph}>
              Tiny steps → visible progress → real habit.{'\n'}
              <Text style={s.b}>Star PlayJO Buddy</Text> keeps it fun.
            </Text>

            <GlowButton label="Share with friends" onPress={onShare} colors={gradMain} />
            <View style={{ height: 14 }} />
            <GlowButton label="App info" onPress={openInfo} colors={gradAlt} />
          </View>
        </ScrollView>

        {/* Info Modal */}
        <Modal visible={infoOpen} transparent animationType="fade" onRequestClose={() => setInfoOpen(false)}>
          <View style={s.modalOverlay}>
            <View style={[s.modalCard, s.neonSoft]}>
              <Text style={s.modalTitle}>App info</Text>

              <InfoRow k="Stars" v={appInfo?.stars ?? '—'} />
              <InfoRow k="Quests saved" v={appInfo?.questsCount ?? '—'} />
              <InfoRow k="Pet" v={appInfo?.pet ?? '—'} />
              <InfoRow k="Level" v={appInfo?.level ?? '—'} />

              <Pressable onPress={() => setInfoOpen(false)} style={{ marginTop: 14 }}>
                <Text style={s.exitText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}

/* компактная строка инфо */
function InfoRow({ k, v }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoKey}>{k}</Text>
      <Text style={s.infoVal}>{String(v)}</Text>
    </View>
  );
}

/* Кнопка с градиентом (оставляем как была) */
function GlowButton({ label, onPress, colors }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ transform: [{ translateY: pressed ? 1 : 0 }] }]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={btn.bg}>
        <Text style={btn.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} allowFontScaling>
          {label}
        </Text>
      </LinearGradient>
      <View style={btn.shadow} />
    </Pressable>
  );
}

/* styles */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 28, 0.55)', // задний фон (поверх картинки)
  },

  /* header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  back: { width: 48, height: 48 },
  headerTitle: { fontSize: 34, color: OJO.title, fontFamily: TITAN },
  titleGlow: {
    textShadowColor: OJO.magenta,
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
  },

  /* однотонная карточка */
  card: {
    backgroundColor: OJO.panel,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: OJO.outline,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  logo: { width: 240, height: 240, marginBottom: 6, borderRadius: 18, alignSelf: 'center' },
  brandTitle: {
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 32,
    color: OJO.title,
    fontFamily: TITAN,
  },

  /* текст */
  paragraph: {
    color: OJO.subtext,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: BODY,
  },
  b: { fontFamily: TITAN, color: OJO.title },
  subhead: {
    color: OJO.title,
    fontSize: 18,
    marginTop: 2,
    marginBottom: 6,
    fontFamily: TITAN,
  },

  /* info modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8,8,12,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: OJO.panelAlt,
    borderRadius: 22,
    padding: 18,
    borderWidth: 2,
    borderColor: OJO.outline,
  },
  modalTitle: { fontSize: 22, color: OJO.title, fontFamily: TITAN, marginBottom: 10, textAlign: 'center' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(234,240,255,0.12)',
  },
  infoKey: { color: OJO.subtext, fontSize: 15 },
  infoVal: { color: OJO.title, fontSize: 18, fontFamily: TITAN },
  exitText: { fontSize: 18, color: OJO.text, fontFamily: TITAN, textAlign: 'center' },

  /* неоновая тень (без градиента) */
  neon: {
    shadowColor: '#2E1EFF',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  neonSoft: {
    shadowColor: '#2E1EFF',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
});

const btn = StyleSheet.create({
  bg: {
    alignSelf: 'stretch',
    minHeight: 62,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    overflow: 'hidden',
  },
  label: {
    fontSize: 19,
    color: '#FFFFFF',
    fontFamily: TITAN,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
    left:-20,
  },
  shadow: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: -5,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
});
