import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence 
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface SentinelInsightCardProps {
  insight: string | null;
  loading: boolean;
  onRefresh?: () => void;
}

export function SentinelInsightCard({ insight, loading, onRefresh }: SentinelInsightCardProps) {
  const { theme, isDark } = useTheme();
  
  // Animation for the "AI Shield"
  const pulse = useSharedValue(1);
  
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.8,
  }));

  if (!insight && !loading) return null;

  return (
    <LinearGradient
      colors={isDark ? ["#2A1B3D", "#44318D"] : ["#F3E8FF", "#E9D5FF"]} // Deep Purple/Mystic theme for AI
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container, 
        { borderColor: theme.border }
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Animated.View style={[styles.iconWrapper, animatedStyle]}>
            <MaterialCommunityIcons name="shield-star" size={20} color={theme.primary} />
          </Animated.View>
          <ThemedText type="label" style={{ color: theme.primary, fontWeight: "700" }}>
            SENTINEL INSIGHT
          </ThemedText>
        </View>
        {onRefresh && !loading && (
            <Feather name="refresh-ccw" size={14} color={theme.textSecondary} onPress={onRefresh} />
        )}
      </View>

      <View style={styles.content}>
        {loading ? (
             <View style={styles.loadingRow}>
               <ActivityIndicator size="small" color={theme.primary} />
               <ThemedText type="caption" style={{marginLeft: 8, color: theme.textSecondary}}>
                 Analyzing daily risks...
               </ThemedText>
             </View>
        ) : (
             <ThemedText type="body" style={[styles.insightText, { color: theme.text }]}>
               {insight}
             </ThemedText>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm, // Close to weather
    marginBottom: Spacing.md,
    borderWidth: 1,
    ...Shadows.small,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconWrapper: {
    backgroundColor: "rgba(124, 58, 237, 0.15)", // Purple tint
    borderRadius: 8,
    padding: 4,
  },
  content: {
    minHeight: 40,
    justifyContent: "center",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  insightText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  }
});
