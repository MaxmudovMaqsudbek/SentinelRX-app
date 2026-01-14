/**
 * WeatherMascot - Fun, Dynamic Weather Icon with Health Indicators
 * 
 * A playful weather character that shows:
 * - Weather conditions (sunny, cloudy, rainy, etc.)
 * - Air quality/pollution warnings
 * - Health advice (mask recommendations)
 * 
 * @component
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Text } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface WeatherMascotProps {
  weatherCode: number;
  isDay: boolean;
  temperature?: number;
  humidity?: number;
  airQualityIndex?: number; // 1-5 scale (1=Good, 5=Hazardous)
  pollenLevel?: 'low' | 'medium' | 'high';
  fluSeasonActive?: boolean;
  size?: 'small' | 'medium' | 'large';
}

interface MascotConfig {
  face: string;
  accessory: string;
  mask: boolean;
  maskColor: string;
  bgEmoji?: string;
  animation: 'bounce' | 'wiggle' | 'pulse' | 'shake';
  tooltip: string;
}

// ============================================================================
// MASCOT CONFIGURATIONS
// ============================================================================

const getMascotConfig = (
  weatherCode: number,
  isDay: boolean,
  airQualityIndex: number = 1,
  pollenLevel: string = 'low',
  fluSeasonActive: boolean = false,
  temperature: number = 20
): MascotConfig => {
  // Determine if mask is needed
  const needsMask = airQualityIndex >= 3 || pollenLevel === 'high' || fluSeasonActive;
  const maskColor = airQualityIndex >= 4 ? '#EF4444' : airQualityIndex >= 3 ? '#F59E0B' : '#10B981';

  // Weather-based face selection
  let face = '😊';
  let accessory = '';
  let bgEmoji = '';
  let animation: MascotConfig['animation'] = 'bounce';
  let tooltip = 'Great weather!';

  // Clear sky
  if (weatherCode === 0) {
    if (isDay) {
      face = needsMask ? '😷' : '😎';
      accessory = '☀️';
      bgEmoji = '✨';
      tooltip = needsMask ? 'Sunny but wear a mask!' : 'Perfect sunny day!';
      animation = 'bounce';
    } else {
      face = needsMask ? '😷' : '🌙';
      accessory = '⭐';
      tooltip = needsMask ? 'Clear night, mask up!' : 'Beautiful starry night!';
      animation = 'pulse';
    }
  }
  // Partly cloudy
  else if (weatherCode >= 1 && weatherCode <= 3) {
    face = needsMask ? '😷' : '🙂';
    accessory = weatherCode === 1 ? '🌤️' : weatherCode === 2 ? '⛅' : '☁️';
    tooltip = needsMask ? 'Cloudy day, mask recommended' : 'Nice cloudy day!';
    animation = 'wiggle';
  }
  // Fog
  else if (weatherCode >= 45 && weatherCode <= 48) {
    face = '😶‍🌫️';
    accessory = '🌫️';
    tooltip = 'Foggy! Drive carefully';
    animation = 'pulse';
  }
  // Drizzle
  else if (weatherCode >= 51 && weatherCode <= 55) {
    face = needsMask ? '😷' : '🌧️';
    accessory = '🌂';
    tooltip = 'Light drizzle - grab an umbrella!';
    animation = 'wiggle';
  }
  // Rain
  else if (weatherCode >= 61 && weatherCode <= 67) {
    face = '🌧️';
    accessory = '☔';
    bgEmoji = '💧';
    tooltip = 'Rainy day! Stay dry';
    animation = 'shake';
  }
  // Rain showers
  else if (weatherCode >= 80 && weatherCode <= 82) {
    face = '😰';
    accessory = '🌧️';
    bgEmoji = '💦';
    tooltip = 'Heavy showers! Be careful';
    animation = 'shake';
  }
  // Snow
  else if (weatherCode >= 71 && weatherCode <= 77) {
    face = '🥶';
    accessory = '❄️';
    bgEmoji = '☃️';
    tooltip = 'Snowy! Bundle up warm';
    animation = 'wiggle';
  }
  // Thunderstorm
  else if (weatherCode >= 95) {
    face = '😨';
    accessory = '⛈️';
    bgEmoji = '⚡';
    tooltip = 'Storm warning! Stay indoors';
    animation = 'shake';
  }

  // Override for extreme temperatures
  if (temperature > 35) {
    face = needsMask ? '🥵' : '🥵';
    accessory = '🔥';
    tooltip = 'Very hot! Stay hydrated';
  } else if (temperature < 0) {
    face = '🥶';
    accessory = '🧊';
    tooltip = 'Freezing! Dress warmly';
  }

  // Override face with mask emoji if needed
  if (needsMask && !['😶‍🌫️', '🌧️', '😨', '😰', '🥶', '🥵'].includes(face)) {
    face = '😷';
  }

  return {
    face,
    accessory,
    mask: needsMask,
    maskColor,
    bgEmoji,
    animation,
    tooltip,
  };
};

// ============================================================================
// COMPONENT
// ============================================================================

export function WeatherMascot({
  weatherCode,
  isDay,
  temperature = 20,
  humidity = 50,
  airQualityIndex = 1,
  pollenLevel = 'low',
  fluSeasonActive = false,
  size = 'medium',
}: WeatherMascotProps) {
  // Animation values
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const config = getMascotConfig(
    weatherCode,
    isDay,
    airQualityIndex,
    pollenLevel,
    fluSeasonActive,
    temperature
  );

  // Size configurations
  const sizeConfig = {
    small: { emoji: 24, accessory: 14, container: 40 },
    medium: { emoji: 32, accessory: 18, container: 56 },
    large: { emoji: 48, accessory: 24, container: 72 },
  };
  const sizes = sizeConfig[size];

  // Setup animations based on config
  useEffect(() => {
    switch (config.animation) {
      case 'bounce':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
      case 'wiggle':
        rotation.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 300 }),
            withTiming(5, { duration: 300 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          true
        );
        break;
      case 'pulse':
        scale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
      case 'shake':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-2, { duration: 100 }),
            withTiming(2, { duration: 100 }),
            withTiming(-2, { duration: 100 }),
            withTiming(0, { duration: 200 })
          ),
          -1,
          true
        );
        break;
    }
  }, [config.animation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={[styles.wrapper, { width: sizes.container, height: sizes.container }]}>
      <Animated.View 
        style={[
          styles.container, 
          { 
            width: sizes.container, 
            height: sizes.container,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: sizes.container / 2,
          }, 
          animatedStyle
        ]}
      >
        {/* Main face emoji */}
        <Text style={[styles.face, { fontSize: sizes.emoji }]}>
          {config.face}
        </Text>
        
        {/* Accessory (weather indicator) - positioned at top right */}
        {config.accessory && (
          <View style={[styles.accessoryContainer, { top: -6, right: -6 }]}>
            <View style={styles.accessoryBubble}>
              <Text style={{ fontSize: sizes.accessory }}>
                {config.accessory}
              </Text>
            </View>
          </View>
        )}

        {/* Mask indicator badge - shown when air quality is poor */}
        {config.mask && (
          <View style={[styles.maskBadge, { backgroundColor: config.maskColor }]}>
            <Text style={styles.maskIcon}>😷</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  face: {
    textAlign: 'center',
  },
  accessoryContainer: {
    position: 'absolute',
  },
  accessoryBubble: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 2,
    minWidth: 24,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgEmoji: {
    position: 'absolute',
    opacity: 0.6,
  },
  maskBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  maskIcon: {
    fontSize: 10,
  },
});

export default WeatherMascot;

