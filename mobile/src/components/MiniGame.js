import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SKIER_SIZE = 36;
const GATE_GAP = 120;
const GATE_HEIGHT = 24;
const GATE_SPEED = 4;
const SPAWN_INTERVAL = 80;
const HITBOX_PADDING = 6;

// Snowflake configs (generated once at module scope)
const NUM_SNOWFLAKES = 15;
const SNOWFLAKE_CONFIGS = Array.from({ length: NUM_SNOWFLAKES }, () => ({
  x: Math.random() * SCREEN_W,
  size: 4 + Math.random() * 8,
  opacity: 0.3 + Math.random() * 0.5,
  duration: 4000 + Math.random() * 6000,
  delay: Math.random() * 3000,
}));

const TRACK_POSITIONS = [0.2, 0.4, 0.6, 0.8];

const MiniGame = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [scorePops, setScorePops] = useState([]);
  const [countUpScore, setCountUpScore] = useState(0);
  const skierX = useRef(new Animated.Value(SCREEN_W / 2 - SKIER_SIZE / 2)).current;
  const skierPos = useRef(SCREEN_W / 2 - SKIER_SIZE / 2);
  const skierLiveX = useRef(SCREEN_W / 2 - SKIER_SIZE / 2);
  const gates = useRef([]);
  const frameId = useRef(null);
  const tickCount = useRef(0);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const [, forceUpdate] = useState(0);

  // Animation refs
  const snowflakeYs = useRef(SNOWFLAKE_CONFIGS.map(() => new Animated.Value(SCREEN_H + 20))).current;
  const scoreScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sprayOpacity = useRef(new Animated.Value(0.4)).current;
  const gameOverScale = useRef(new Animated.Value(0.5)).current;
  const gameOverOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        if (gameOverRef.current) return;
        if (!started) setStarted(true);
        const newX = Math.max(0, Math.min(SCREEN_W - SKIER_SIZE, skierPos.current + gs.dx));
        skierX.setValue(newX);
        skierLiveX.current = newX;
      },
      onPanResponderRelease: (_, gs) => {
        const finalX = Math.max(0, Math.min(SCREEN_W - SKIER_SIZE, skierPos.current + gs.dx));
        skierPos.current = finalX;
        skierLiveX.current = finalX;
      },
    })
  ).current;

  const reset = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setStarted(false);
    setScorePops([]);
    setCountUpScore(0);
    scoreRef.current = 0;
    gameOverRef.current = false;
    gates.current = [];
    tickCount.current = 0;
    skierPos.current = SCREEN_W / 2 - SKIER_SIZE / 2;
    skierLiveX.current = SCREEN_W / 2 - SKIER_SIZE / 2;
    skierX.setValue(SCREEN_W / 2 - SKIER_SIZE / 2);
    scoreScale.setValue(1);
    gameOverScale.setValue(0.5);
    gameOverOpacity.setValue(0);
  }, [skierX, scoreScale, gameOverScale, gameOverOpacity]);

  useEffect(() => {
    if (!visible) return;
    reset();
  }, [visible, reset]);

  // Snowflake animations
  useEffect(() => {
    if (!visible) return;
    const animations = SNOWFLAKE_CONFIGS.map((config, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(config.delay),
          Animated.timing(snowflakeYs[i], {
            toValue: -20,
            duration: config.duration,
            useNativeDriver: true,
          }),
          Animated.timing(snowflakeYs[i], {
            toValue: SCREEN_H + 20,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [visible, snowflakeYs]);

  // Start screen pulse
  useEffect(() => {
    if (visible && !started && !gameOver) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
  }, [visible, started, gameOver, pulseAnim]);

  // Snow spray animation
  useEffect(() => {
    if (!started || gameOver) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(sprayOpacity, { toValue: 0.8, duration: 200, useNativeDriver: true }),
        Animated.timing(sprayOpacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [started, gameOver, sprayOpacity]);

  // Score pulse + floating "+1"
  useEffect(() => {
    if (score > 0) {
      scoreScale.setValue(1.4);
      Animated.spring(scoreScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }).start();

      const popId = Date.now();
      const popOpacity = new Animated.Value(1);
      const popY = new Animated.Value(0);
      setScorePops((prev) => [...prev, { id: popId, opacity: popOpacity, y: popY }]);
      Animated.parallel([
        Animated.timing(popOpacity, { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.timing(popY, { toValue: -40, duration: 700, useNativeDriver: true }),
      ]).start(() => {
        setScorePops((prev) => prev.filter((p) => p.id !== popId));
      });
    }
  }, [score, scoreScale]);

  // Game over entrance animation + score count-up
  useEffect(() => {
    if (gameOver) {
      gameOverScale.setValue(0.5);
      gameOverOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(gameOverScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(gameOverOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const finalScore = scoreRef.current;
      let frame = 0;
      const totalFrames = Math.max(Math.min(finalScore * 2, 60), 1);
      const countUp = () => {
        frame++;
        const progress = Math.min(frame / totalFrames, 1);
        setCountUpScore(Math.round(progress * finalScore));
        if (progress < 1) requestAnimationFrame(countUp);
      };
      requestAnimationFrame(countUp);
    }
  }, [gameOver, gameOverScale, gameOverOpacity]);

  // Game loop
  useEffect(() => {
    if (!visible || !started || gameOver) return;

    const tick = () => {
      if (gameOverRef.current) return;
      tickCount.current++;

      if (tickCount.current % SPAWN_INTERVAL === 0) {
        const gapStart = Math.random() * (SCREEN_W - GATE_GAP - 40) + 20;
        gates.current.push({ y: SCREEN_H, gapStart, passed: false });
      }

      const currentSkierX = skierLiveX.current;
      const skierTop = 120;
      const skierBottom = skierTop + SKIER_SIZE;
      const skierLeft = currentSkierX + HITBOX_PADDING;
      const skierRight = currentSkierX + SKIER_SIZE - HITBOX_PADDING;

      gates.current = gates.current.filter((gate) => {
        gate.y -= GATE_SPEED;

        const gateBottom = gate.y + GATE_HEIGHT;
        if (gateBottom > skierTop && gate.y < skierBottom) {
          const inLeftPole = skierRight > 0 && skierLeft < gate.gapStart;
          const inRightPole = skierLeft < SCREEN_W && skierRight > gate.gapStart + GATE_GAP;
          if (inLeftPole || inRightPole) {
            gameOverRef.current = true;
            setGameOver(true);
            return true;
          }
        }

        if (!gate.passed && gate.y + GATE_HEIGHT < skierTop) {
          gate.passed = true;
          scoreRef.current++;
          setScore(scoreRef.current);
        }

        return gate.y + GATE_HEIGHT > 0;
      });

      forceUpdate((n) => n + 1);
      frameId.current = requestAnimationFrame(tick);
    };

    frameId.current = requestAnimationFrame(tick);
    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, [visible, started, gameOver]);

  if (!visible) return null;

  const bgColor = score > 10 ? '#dceef5' : score > 5 ? '#e2f0f6' : '#e8f4f8';

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* Slope background */}
        <View style={[styles.slope, { backgroundColor: bgColor }]} />

        {/* Ski track lines */}
        {TRACK_POSITIONS.map((pct, i) => (
          <View
            key={`track-${i}`}
            pointerEvents="none"
            style={[
              styles.trackLine,
              {
                left: SCREEN_W * pct,
                transform: [{ rotate: `${(i % 2 === 0 ? 1 : -1) * 1.5}deg` }],
              },
            ]}
          />
        ))}

        {/* Snowflakes */}
        {SNOWFLAKE_CONFIGS.map((config, i) => (
          <Animated.View
            key={`snow-${i}`}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: config.x,
              width: config.size,
              height: config.size,
              borderRadius: config.size / 2,
              backgroundColor: theme.colors.brandWhite,
              opacity: config.opacity,
              transform: [{ translateY: snowflakeYs[i] }],
            }}
          />
        ))}

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Animated.View style={{ transform: [{ scale: scoreScale }] }}>
            <Text style={styles.scoreText}>{score}</Text>
          </Animated.View>
        </View>

        {/* Floating +1 pops */}
        {scorePops.map((pop) => (
          <Animated.Text
            key={pop.id}
            style={[
              styles.scorePop,
              { opacity: pop.opacity, transform: [{ translateY: pop.y }] },
            ]}
          >
            +1
          </Animated.Text>
        ))}

        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.brandWhite} />
        </TouchableOpacity>

        {/* Gates */}
        {gates.current.map((gate, i) => (
          <React.Fragment key={i}>
            {/* Safe corridor highlight */}
            <View style={{
              position: 'absolute',
              top: gate.y - 8,
              left: gate.gapStart,
              width: GATE_GAP,
              height: GATE_HEIGHT + 6,
              backgroundColor: 'rgba(91, 164, 212, 0.12)',
              borderBottomWidth: 1.5,
              borderBottomColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: 4,
              zIndex: 4,
            }} />

            {/* Left pole + flag */}
            <View style={[styles.gatePole, { top: gate.y - 8, left: gate.gapStart - 2 }]}>
              <View style={styles.gatePoleStick} />
              <View style={styles.gateFlagLeft} />
            </View>

            {/* Right pole + flag */}
            <View style={[styles.gatePole, { top: gate.y - 8, left: gate.gapStart + GATE_GAP - 2 }]}>
              <View style={styles.gatePoleStick} />
              <View style={styles.gateFlagRight} />
            </View>
          </React.Fragment>
        ))}

        {/* Skier */}
        <Animated.View
          style={[
            styles.skier,
            {
              left: skierX,
              top: 120,
              transform: [
                {
                  rotate: skierX.interpolate({
                    inputRange: [0, SCREEN_W / 2, SCREEN_W - SKIER_SIZE],
                    outputRange: ['-12deg', '0deg', '12deg'],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <View style={{ transform: [{ rotate: '45deg' }] }}>
            <FontAwesome5 name="skiing" size={30} color={theme.colors.brandNavy} solid />
          </View>
          {started && !gameOver && (
            <>
              <Animated.View
                style={[
                  styles.sprayDot,
                  { top: -6, left: 2, width: 6, height: 6, borderRadius: 3, opacity: sprayOpacity },
                ]}
              />
              <Animated.View
                style={[
                  styles.sprayDot,
                  { top: -8, right: 2, width: 4, height: 4, borderRadius: 2, opacity: sprayOpacity },
                ]}
              />
            </>
          )}
        </Animated.View>

        {/* Start prompt */}
        {!started && !gameOver && (
          <View style={styles.overlay}>
            <Ionicons
              name="snow"
              size={48}
              color={theme.colors.brandSkyBlueLight}
              style={{ marginBottom: 16, opacity: 0.7 }}
            />
            <Animated.Text style={[styles.startText, { transform: [{ scale: pulseAnim }] }]}>
              {t('miniGame.dragToSteer')}
            </Animated.Text>
            <Text style={styles.startSubtext}>{t('miniGame.steerThroughGates')}</Text>
          </View>
        )}

        {/* Game over */}
        {gameOver && (
          <View style={styles.overlay}>
            <Animated.View
              style={{
                alignItems: 'center',
                transform: [{ scale: gameOverScale }],
                opacity: gameOverOpacity,
              }}
            >
              <Text style={styles.gameOverText}>{t('miniGame.gameOver')}</Text>
              <Text style={styles.finalScore}>{t('miniGame.score')}: {countUpScore}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={reset}>
                <Text style={styles.retryText}>{t('miniGame.playAgain')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4f8',
  },
  slope: {
    ...StyleSheet.absoluteFillObject,
  },
  trackLine: {
    position: 'absolute',
    top: 0,
    width: 1.5,
    height: SCREEN_H,
    backgroundColor: theme.colors.brandNavy + '08',
  },
  scoreContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: theme.colors.brandNavy + 'CC',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  scoreText: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: theme.colors.brandWhite,
  },
  scorePop: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: theme.colors.brandYellow,
    zIndex: 11,
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.brandNavy + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },

  // Gate styles
  gatePole: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  gateFlagLeft: {
    width: 0,
    height: 0,
    borderBottomWidth: 10,
    borderBottomColor: theme.colors.brandOrange,
    borderRightWidth: 10,
    borderRightColor: 'transparent',
  },
  gateFlagRight: {
    width: 0,
    height: 0,
    borderBottomWidth: 10,
    borderBottomColor: theme.colors.brandSkyBlue,
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
  },
  gatePoleStick: {
    width: 2,
    height: GATE_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 1,
  },

  // Skier styles
  skier: {
    position: 'absolute',
    width: SKIER_SIZE,
    height: SKIER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sprayDot: {
    position: 'absolute',
    backgroundColor: theme.colors.brandWhite,
  },

  // Overlays
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.brandNavy + 'CC',
    zIndex: 30,
  },
  startText: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: theme.colors.brandWhite,
    marginBottom: 8,
  },
  startSubtext: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.brandSkyBlueLight,
  },
  gameOverText: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: theme.colors.brandWhite,
    marginBottom: 12,
  },
  finalScore: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.brandSkyBlueLight,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: theme.colors.brandOrange,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.cardElevated,
  },
  retryText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.brandWhite,
  },
});

export default MiniGame;
