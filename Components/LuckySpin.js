import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, ImageBackground, Pressable, Animated, Easing, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* палитра в стиле OJO */
const OJO = {
  navy2:  'rgba(14,20,92,0.85)',
  outline:'#2432A8',
  white:  '#FFFFFF',
  shadow: '#000000',
};

const TITAN = Platform.select({ ios: 'TitanOne', android: 'TitanOne-Regular' });

/* storage keys */
const STARS_KEY = 'bsp:stars';
const LAST_SPIN_KEY = 'bsp:luckySpin:last';

/* assets */
const BG        = require('../assets/bg1.webp');
const ICON_BACK = require('../assets/icon_back.webp');
const STAR_IMG  = require('../assets/star.webp');
const BTN_IMG   = require('../assets/btn_big.webp');

const SIZE = 260;                 // диаметр колеса (можно менять)
const REWARDS = [1,2,3,3,5,5,8,2];// значения по секторам
const SECTOR_ANGLE = 360 / REWARDS.length;

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export default function LuckySpin({ navigation }) {
  const [canSpin, setCanSpin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const last = await AsyncStorage.getItem(LAST_SPIN_KEY);
      setCanSpin(last !== todayKey());
    })();
  }, []);

  const doSpin = useCallback(async () => {
    if (!canSpin || loading) return;
    setLoading(true);

    const idx = Math.floor(Math.random() * REWARDS.length);
    const amount = REWARDS[idx];

    // 3–4 оборота + центр выбранного сектора
    const target =
      360 * (3 + Math.floor(Math.random() * 2)) + (idx * SECTOR_ANGLE) + (SECTOR_ANGLE / 2);

    rotation.setValue(0);
    Animated.timing(rotation, {
      toValue: target,
      duration: 2200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      try {
        const curRaw = await AsyncStorage.getItem(STARS_KEY);
        const cur = curRaw ? parseInt(curRaw, 10) || 0 : 0;
        const next = cur + amount;
        await AsyncStorage.multiSet([
          [STARS_KEY, String(next)],
          [LAST_SPIN_KEY, todayKey()],
        ]);
      } catch {}
      setResult(amount);
      setCanSpin(false);
      setLoading(false);
    });
  }, [canSpin, loading, rotation]);

  const rot = rotation.interpolate({ inputRange:[0,360], outputRange:['0deg','360deg'] });

  return (
    <ImageBackground source={BG} style={s.bg} resizeMode="cover">
      {/* header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.back}>
          <Image source={ICON_BACK} style={{ width: 48, height: 48 }} />
        </Pressable>
        <Text style={s.title}>Lucky Spin</Text>
        <View style={s.back} />
      </View>

      {/* content */}
      <View style={[s.card, s.shadowSoft]}>
        <Text style={s.desc}>
          {canSpin ? 'Spin once a day and win extra stars!' : 'Come back tomorrow for a new spin.'}
        </Text>

        <View style={s.wheelBox}>
          <Animated.View style={[s.wheel, { transform: [{ rotate: rot }] }]}>
            {REWARDS.map((val, i) => {
              const angle = i * SECTOR_ANGLE;
              return (
                <View key={i} style={[s.sector, { transform: [{ rotate: `${angle}deg` }] }]}>
                  <Image source={STAR_IMG} style={s.star} />
                  <Text style={s.reward}>{val}</Text>
                </View>
              );
            })}
          </Animated.View>
          {/* указатель */}
          <View style={s.pin} />
        </View>

        {/* большая кнопка (мин. высота 120) */}
        <Pressable
          onPress={doSpin}
          style={({ pressed }) => [{ opacity: (!canSpin || loading) ? 0.45 : 1, transform: [{ scale: pressed && canSpin && !loading ? 0.985 : 1 }] }]}
          disabled={!canSpin || loading}
        >
          <ImageBackground
            source={require('../assets/btn_big.webp')}
            resizeMode="stretch"
            capInsets={{ top: 22, left: 22, bottom: 22, right: 22 }}
            style={btn.bg}
            imageStyle={btn.image}
          >
            <Text style={btn.label}>{canSpin ? (loading ? 'SPINNING…' : 'SPIN') : 'TOMORROW'}</Text>
          </ImageBackground>
        </Pressable>

        {!!result && <Text style={s.result}>Congrats! +{result} ★</Text>}
      </View>
    </ImageBackground>
  );
}

/* styles */
const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },

  header: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 10,
  },
  back: { width: 48, height: 48 },
  title: { color: OJO.white, fontSize: 34, fontFamily: TITAN },

  card: {
    backgroundColor: OJO.navy2,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: OJO.outline,
    padding: 16,
  },
  desc: { color: OJO.white, opacity: 0.9, marginBottom: 12, textAlign:'center' },

  wheelBox: { alignItems:'center', justifyContent:'center', marginBottom: 12, marginTop: 6 },
  wheel: {
    width: SIZE, height: SIZE, borderRadius: SIZE/2,
    borderWidth: 2, borderColor: OJO.outline,
    alignItems:'center', justifyContent:'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sector: { position:'absolute', width: SIZE, height: SIZE, alignItems:'center', justifyContent:'flex-start' },
  star: { width: 30, height: 30, marginTop: 12 },
  reward: { color: OJO.white, fontFamily: TITAN, marginTop: 4 },

  pin: {
    position:'absolute', top: (SIZE/2) - 8,
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 18,
    borderLeftColor:'transparent', borderRightColor:'transparent', borderBottomColor:'#FFD54A',
  },

  result: { color: OJO.white, fontSize: 18, textAlign:'center', marginTop: 6, fontFamily: TITAN },

  shadowSoft: {
    shadowColor: OJO.shadow, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width:0, height:4 }, elevation: 6,
  },
});

const btn = StyleSheet.create({
  bg: {
    height: 160,               // ≥120 как просили
    borderRadius: 24,
    alignItems:'center',
    justifyContent:'center',
    paddingHorizontal: 32,
    overflow:'hidden',
  },
  image: { borderRadius: 24 },
  label: { color: '#000', fontSize: 28, fontFamily: TITAN },
});
