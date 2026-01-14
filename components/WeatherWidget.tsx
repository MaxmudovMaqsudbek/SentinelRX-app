import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { WeatherMascot } from "@/components/WeatherMascot";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { getWeather, WeatherData, getWeatherIcon } from "@/utils/weatherService";

// Simulated air quality data (in production, fetch from API)
const getSimulatedAirQuality = (humidity: number): number => {
  // Higher humidity often correlates with worse air quality in polluted areas
  if (humidity > 80) return 3; // Moderate
  if (humidity > 90) return 4; // Poor
  return 1; // Good
};

export function WeatherWidget() {
  const { theme, isDark } = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const data = await getWeather(loc.coords.latitude, loc.coords.longitude);
      setWeather(data);
    } catch (e) {
      console.log("Weather widget error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={[styles.container, styles.loading, { backgroundColor: theme.cardBackground }]}>
      <ActivityIndicator size="small" color={theme.primary} />
    </View>
  );

  if (!weather) return null;

  const airQualityIndex = getSimulatedAirQuality(weather.humidity);

  // Gradient colors based on conditions
  const getGradientColors = (): string[] => {
    if (airQualityIndex >= 4) return ['#7C3AED', '#DB2777']; // Purple/Pink for bad air
    if (isDark) return ["#1e3c72", "#2a5298"]; // Night Blue
    if (weather.isDay) {
      if (weather.weatherCode >= 61) return ['#374151', '#1F2937']; // Rainy gray
      if (weather.weatherCode >= 95) return ['#4B0082', '#2C1654']; // Storm purple
      return ["#4facfe", "#00f2fe"]; // Day Blue/Cyan
    }
    return ["#373B44", "#4286f4"]; // Evening
  };

  const getAirQualityLabel = () => {
    const labels = ['Good 😊', 'Fair 🙂', 'Moderate 😐', 'Poor 😷', 'Hazardous ⚠️'];
    return labels[airQualityIndex - 1] || 'Unknown';
  };

  const getAirQualityColor = () => {
    const colors = ['#10B981', '#84CC16', '#F59E0B', '#EF4444', '#7C3AED'];
    return colors[airQualityIndex - 1] || '#6B7280';
  };

  return (
    <Pressable onPress={() => setShowDetails(!showDetails)}>
      <LinearGradient
        colors={getGradientColors() as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Animated.View entering={FadeIn} style={styles.content}>
          {/* Left: Mascot + Temperature */}
          <View style={styles.leftCol}>
            <View style={styles.row}>
              <WeatherMascot
                weatherCode={weather.weatherCode}
                isDay={weather.isDay}
                temperature={weather.temperature}
                humidity={weather.humidity}
                airQualityIndex={airQualityIndex}
                size="medium"
              />
              <View style={styles.tempCol}>
                <ThemedText type="h2" style={styles.tempText}>
                  {Math.round(weather.temperature)}°
                </ThemedText>
                <ThemedText type="small" style={styles.locText}>
                  {weather.locationName}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Right: Stats */}
          <View style={styles.rightCol}>
            {/* Air Quality Badge */}
            <View style={[styles.aqiBadge, { backgroundColor: getAirQualityColor() + '30', borderColor: getAirQualityColor() }]}>
              <ThemedText type="small" style={[styles.aqiText, { color: getAirQualityColor() }]}>
                AQI: {getAirQualityLabel()}
              </ThemedText>
            </View>
            
            {/* Humidity */}
            <View style={styles.statBadge}>
              <Feather name="droplet" size={12} color="#FFF" />
              <ThemedText type="caption" style={styles.statText}>{weather.humidity}%</ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Expanded Details */}
        {showDetails && (
          <Animated.View entering={FadeInDown} style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <ThemedText type="caption" style={styles.detailLabel}>Condition</ThemedText>
              <ThemedText type="small" style={styles.detailValue}>
                {weather.isDay ? '☀️ Day' : '🌙 Night'}
              </ThemedText>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <ThemedText type="caption" style={styles.detailLabel}>Air Quality</ThemedText>
              <ThemedText type="small" style={styles.detailValue}>
                {getAirQualityLabel()}
              </ThemedText>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <ThemedText type="caption" style={styles.detailLabel}>Advice</ThemedText>
              <ThemedText type="small" style={styles.detailValue}>
                {airQualityIndex >= 3 ? '😷 Mask' : '👍 Safe'}
              </ThemedText>
            </View>
          </Animated.View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginVertical: Spacing.sm,
    ...Shadows.small,
  },
  loading: {
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    alignItems: "flex-end",
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  tempCol: {
    marginLeft: Spacing.xs,
  },
  tempText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "300",
  },
  locText: {
    color: "rgba(255,255,255,0.9)",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  aqiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  aqiText: {
    fontWeight: "600",
    fontSize: 11,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    paddingTop: Spacing.sm,
  },
  detailItem: {
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
  },
  detailValue: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginTop: 2,
  },
  detailDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  conditionText: {
    color: "rgba(255,255,255,0.8)",
  }
});

