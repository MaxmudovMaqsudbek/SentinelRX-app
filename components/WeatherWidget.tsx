import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { getWeather, WeatherData, getWeatherIcon } from "@/utils/weatherService";

export function WeatherWidget() {
  const { theme, isDark } = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (!weather) return null; // Hide if no permission/data

  // Gradient colors based on day/night
  const gradientColors = isDark 
    ? ["#1e3c72", "#2a5298"] // Night Blue
    : weather.isDay 
      ? ["#4facfe", "#00f2fe"] // Day Blue/Cyan
      : ["#373B44", "#4286f4"]; // Evening

  return (
    <LinearGradient
      colors={gradientColors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.leftCol}>
          <View style={styles.row}>
            <Feather name={getWeatherIcon(weather.weatherCode, weather.isDay) as any} size={24} color="#FFF" />
            <ThemedText type="h2" style={styles.tempText}>
              {Math.round(weather.temperature)}°
            </ThemedText>
          </View>
          <ThemedText type="small" style={styles.locText}>
            {weather.locationName}
          </ThemedText>
        </View>

        <View style={styles.rightCol}>
           <View style={styles.statBadge}>
             <Feather name="droplet" size={12} color="#FFF" />
             <ThemedText type="caption" style={styles.statText}>{weather.humidity}%</ThemedText>
           </View>
           <ThemedText type="caption" style={styles.conditionText}>
             {weather.isDay ? "Day" : "Night"}
           </ThemedText>
        </View>
      </View>
    </LinearGradient>
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
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  tempText: {
    color: "#FFFFFF",
    fontSize: 32,
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
  conditionText: {
    color: "rgba(255,255,255,0.8)",
  }
});
