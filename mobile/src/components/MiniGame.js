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
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SKIER_SIZE = 36;
const GATE_GAP = 120;
const GATE_HEIGHT = 24;
const GATE_SPEED = 4;
const SPAWN_INTERVAL = 80;

const MiniGame = ({ visible, onClose }) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const skierX = useRef(new Animated.Value(SCREEN_W / 2 - SKIER_SIZE / 2)).current;
  const skierPos = useRef(SCREEN_W / 2 - SKIER_SIZE / 2);
  const gates = useRef([]);
  const frameId = useRef(null);
  const tickCount = useRef(0);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const [, forceUpdate] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        if (gameOverRef.current) return;
        if (!started) setStarted(true);
        const newX = Math.max(0, Math.min(SCREEN_W - SKIER_SIZE, skierPos.current + gs.dx));
        skierX.setValue(newX);
      },
      onPanResponderRelease: (_, gs) => {
        skierPos.current = Math.max(0, Math.min(SCREEN_W - SKIER_SIZE, skierPos.current + gs.dx));
      },
    })
  ).current;

  const reset = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setStarted(false);
    scoreRef.current = 0;
    gameOverRef.current = false;
    gates.current = [];
    tickCount.current = 0;
    skierPos.current = SCREEN_W / 2 - SKIER_SIZE / 2;
    skierX.setValue(SCREEN_W / 2 - SKIER_SIZE / 2);
  }, [skierX]);

  useEffect(() => {
    if (!visible) return;
    reset();
  }, [visible, reset]);

  useEffect(() => {
    if (!visible || !started || gameOver) return;

    const tick = () => {
      if (gameOverRef.current) return;
      tickCount.current++;

      // Spawn gate
      if (tickCount.current % SPAWN_INTERVAL === 0) {
        const gapStart = Math.random() * (SCREEN_W - GATE_GAP - 40) + 20;
        gates.current.push({ y: -GATE_HEIGHT, gapStart, passed: false });
      }

      // Move gates
      const currentSkierX = skierPos.current;
      const skierTop = SCREEN_H - 140;
      const skierBottom = skierTop + SKIER_SIZE;
      const skierLeft = currentSkierX;
      const skierRight = currentSkierX + SKIER_SIZE;

      gates.current = gates.current.filter((gate) => {
        gate.y += GATE_SPEED;

        // Check collision
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

        // Score
        if (!gate.passed && gate.y > skierBottom) {
          gate.passed = true;
          scoreRef.current++;
          setScore(scoreRef.current);
        }

        return gate.y < SCREEN_H;
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

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* Snow tracks background */}
        <View style={styles.slope} />

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>

        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.brandWhite} />
        </TouchableOpacity>

        {/* Gates */}
        {gates.current.map((gate, i) => (
          <React.Fragment key={i}>
            <View
              style={[
                styles.pole,
                { top: gate.y, left: 0, width: gate.gapStart },
              ]}
            />
            <View style={[styles.flag, { top: gate.y - 6, left: gate.gapStart - 6 }]}>
              <Text style={styles.flagEmoji}>🔴</Text>
            </View>
            <View
              style={[
                styles.pole,
                { top: gate.y, left: gate.gapStart + GATE_GAP, width: SCREEN_W - gate.gapStart - GATE_GAP },
              ]}
            />
            <View style={[styles.flag, { top: gate.y - 6, left: gate.gapStart + GATE_GAP - 2 }]}>
              <Text style={styles.flagEmoji}>🔵</Text>
            </View>
          </React.Fragment>
        ))}

        {/* Skier */}
        <Animated.View style={[styles.skier, { left: skierX, top: SCREEN_H - 140 }]}>
          <Text style={styles.skierEmoji}>⛷️</Text>
        </Animated.View>

        {/* Start prompt */}
        {!started && !gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.startText}>Drag to steer</Text>
            <Text style={styles.startSubtext}>Dodge the gates!</Text>
          </View>
        )}

        {/* Game over */}
        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverText}>Game Over</Text>
            <Text style={styles.finalScore}>Score: {score}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={reset}>
              <Text style={styles.retryText}>Play Again</Text>
            </TouchableOpacity>
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
    backgroundColor: '#e8f4f8',
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
  pole: {
    position: 'absolute',
    height: GATE_HEIGHT,
    backgroundColor: theme.colors.brandNavy + '30',
    borderRadius: 4,
  },
  flag: {
    position: 'absolute',
    zIndex: 5,
  },
  flagEmoji: {
    fontSize: 14,
  },
  skier: {
    position: 'absolute',
    width: SKIER_SIZE,
    height: SKIER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  skierEmoji: {
    fontSize: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.lg,
  },
  retryText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.brandWhite,
  },
});

export default MiniGame;
