import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AuthGuard } from "@/components/AuthGuard";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Spacing } from "@/constants/theme";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import { getGamificationData, GamificationData } from "@/utils/storage";
import {
  getLatestActivity,
  getUserStats,
  ACHIEVEMENTS,
  ActivityItem,
  UserStats,
} from "@/utils/gamification";
import { GamificationHeroCard, DailyQuestsWidget, RewardsMarketplace } from "@/components/GamificationFeatures";

type RewardsScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Rewards">;
};

export default function RewardsScreen({ navigation }: RewardsScreenProps) {
  const { theme } = useTheme();
  const { paddingTop, paddingBottom } = useScreenInsets();
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const [data, activityList, userStats] = await Promise.all([
          getGamificationData(),
          getLatestActivity(5),
          getUserStats(),
        ]);
        setGamification(data);
        setActivities(activityList);
        setStats(userStats);
      };
      loadData();
    }, []),
  );

  return (
    <AuthGuard featureName="Rewards & Achievements">
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: paddingTop + Spacing.lg, paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero Card: The "Wow" Visuals */}
        <GamificationHeroCard data={gamification} />
        
        <Spacer height={Spacing.xl} />

        {/* 2. Engagement: Daily Quests */}
        <DailyQuestsWidget />

        <Spacer height={Spacing.xl} />

        {/* 3. Monetization: Rewards Marketplace + Insurance Teaser */}
        <RewardsMarketplace userPoints={gamification?.points || 0} />

        <Spacer height={Spacing.xl} />

        {/* 4. Proof of Work: Recent Activity */}
        <ThemedText type="h3">Recent Activity</ThemedText>
        <Spacer height={Spacing.md} />

        <View style={[styles.activityCard, { backgroundColor: theme.cardBackground }]}>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <View key={activity.id || index} style={styles.activityItem}>
                <View style={[styles.activityDot, { backgroundColor: theme.primary }]} />
                <ThemedText type="body" style={styles.activityText} numberOfLines={1}>
                  {activity.action}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.success }}>
                  +{activity.points} pts
                </ThemedText>
              </View>
            ))
          ) : (
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: theme.textSecondary }]} />
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                No recent activity. Scan a pill to get started!
              </ThemedText>
            </View>
          )}
        </View>

        <Spacer height={Spacing.lg} />

        {/* Bottom Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <ThemedText type="h3">{stats?.totalScans || 0}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Total Scans
            </ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText type="h3">
              {stats?.totalInteractionsChecked || 0}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Interactions Checked
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  activityCard: {
    borderRadius: 16,
    padding: Spacing.lg,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  activityText: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
});
