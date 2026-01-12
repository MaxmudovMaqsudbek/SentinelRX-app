import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  RefreshControl,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";

import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { MedCard } from "@/components/MedCard";
import { ReminderCard } from "@/components/ReminderCard";
import { ProgressBar } from "@/components/ProgressBar";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations, useApp } from "@/contexts/AppContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import {
  getUserProfile,
  getReminders,
  getScanHistory,
  getGamificationData,
  markReminderTaken,
  UserProfile,
  Reminder,
  ScanHistoryItem,
  GamificationData,
} from "@/utils/storage";
import { getGreeting, generateDailyInsight } from "@/utils/aiServices";
import { WeatherWidget } from "@/components/WeatherWidget";
import { SentinelInsightCard } from "@/components/SentinelInsightCard";
import { getWeather, WeatherData } from "@/utils/weatherService";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "Home">;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { theme } = useTheme();
  const { t } = useTranslations();
  const { user, isAuthenticated } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [insight, setInsight] = useState<string | null>("Stay healthy today! Remember to take your medications on time and stay hydrated. 💊");
  const [insightLoading, setInsightLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileData, remindersData, historyData, gamificationData] =
        await Promise.all([
          getUserProfile(),
          getReminders(),
          getScanHistory(),
          getGamificationData(),
        ]);
      setProfile(profileData);
      setReminders(remindersData);
      setScanHistory(historyData);
      setGamification(gamificationData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // Load insight immediately on mount
  useEffect(() => {
    fetchWeatherAndInsight();
  }, []);

  // Refresh insight when profile changes
  useEffect(() => {
    if (profile) {
      fetchWeatherAndInsight();
    }
  }, [profile?.name]);

  const fetchWeatherAndInsight = async () => {
     try {
       const { status } = await Location.getForegroundPermissionsAsync();
       if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
          const w = await getWeather(loc.coords.latitude, loc.coords.longitude);
          setWeather(w);
          
          if (w) {
             setInsightLoading(true);
             const medNames = reminders.filter(r => r.isEnabled).map(r => r.medicationName);
             const userName = profile?.name || "User";
             const aiMsg = await generateDailyInsight(w, medNames, userName);
             if (aiMsg) setInsight(aiMsg);
             setInsightLoading(false);
          }
       } else {
         // Even without location, show a generic insight
         setInsight("Good morning! Stay consistent with your medication schedule for better health outcomes. 💪");
       }
     } catch (e) { 
       console.log("Insight error", e);
       setInsightLoading(false);
     }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    await fetchWeatherAndInsight();
    setRefreshing(false);
  }, [loadData]);

  const handleReminderToggle = async (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await markReminderTaken(id);
    await loadData();
  };

  const today = new Date().toISOString().split("T")[0];
  const todayReminders = reminders.filter((r) => r.isEnabled);
  const takenToday = todayReminders.filter((r) => r.takenDates.includes(today));
  const adherencePercent =
    todayReminders.length > 0 ? takenToday.length / todayReminders.length : 0;

  // 🔥 Use authenticated user's name if logged in, otherwise fallback to local profile
  const displayName = isAuthenticated && user?.full_name 
    ? user.full_name 
    : profile?.name || "User";
  
  const greeting = getGreeting(displayName, profile?.language || "en");

  const levelProgress = gamification ? (gamification.points % 100) / 100 : 0;
  const pointsToNext = gamification ? 100 - (gamification.points % 100) : 100;

  return (
    <ScreenScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
    >
      <ThemedText type="h2" style={styles.greeting}>
        {greeting}
      </ThemedText>

      <WeatherWidget />

      <SentinelInsightCard 
        insight={insight} 
        loading={insightLoading} 
        onRefresh={fetchWeatherAndInsight}
      />

      <Spacer height={Spacing.xl} />

      <MedCard
        title={t.home.gamification}
        leftIcon="award"
        onPress={() =>
          navigation.getParent()?.navigate("ProfileTab", { screen: "Rewards" })
        }
      >
        <View style={styles.gamificationContent}>
          <View style={styles.levelRow}>
            <ThemedText type="label">
              {t.home.level} {gamification?.level || 1}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {gamification?.points || 0} {t.home.points.toLowerCase()}
            </ThemedText>
          </View>
          <Spacer height={Spacing.sm} />
          <ProgressBar progress={levelProgress} color={theme.primary} />
          <Spacer height={Spacing.xs} />
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {pointsToNext} {t.home.points.toLowerCase()} to next level
          </ThemedText>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Feather name="zap" size={16} color={theme.accent} />
              </View>
              <ThemedText type="h4">{gamification?.streak || 0}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {t.home.streak}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Feather name="camera" size={16} color={theme.secondary} />
              </View>
              <ThemedText type="h4">
                {gamification?.scansThisWeek || 0}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {t.scanner.title.split(" ")[0]}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Feather name="check-circle" size={16} color={theme.success} />
              </View>
              <ThemedText type="h4">
                {Math.round(adherencePercent * 100)}%
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {t.reminders.adherence}
              </ThemedText>
            </View>
          </View>
        </View>
      </MedCard>

      <Spacer height={Spacing.xl} />

      <View style={styles.sectionHeader}>
        <ThemedText type="h3">{t.home.todayReminders}</ThemedText>
        <Pressable
          onPress={() => navigation.navigate("Reminders")}
          style={({ pressed }) => [
            styles.seeAllButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <ThemedText type="link">{t.home.viewAll}</ThemedText>
        </Pressable>
      </View>
      <Spacer height={Spacing.md} />

      {todayReminders.length === 0 ? (
        <View
          style={[styles.emptyCard, { backgroundColor: theme.cardBackground }]}
        >
          <Feather name="calendar" size={24} color={theme.textSecondary} />
          <ThemedText
            type="body"
            style={[styles.emptyText, { color: theme.textSecondary }]}
          >
            {t.home.noReminders}
          </ThemedText>
          <Pressable
            onPress={() => navigation.navigate("Reminders")}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="plus" size={16} color="#FFFFFF" />
            <ThemedText type="label" style={styles.addButtonText}>
              {t.reminders.addReminder}
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.remindersList}>
          {todayReminders.slice(0, 3).map((reminder) => (
            <View key={reminder.id} style={styles.reminderItem}>
              <ReminderCard
                reminder={reminder}
                onToggle={handleReminderToggle}
                onPress={() => navigation.navigate("Reminders")}
                isTaken={reminder.takenDates.includes(today)}
              />
            </View>
          ))}
        </View>
      )}

      <Spacer height={Spacing.xl} />

      <View style={styles.sectionHeader}>
        <ThemedText type="h3">{t.home.recentScans}</ThemedText>
      </View>
      <Spacer height={Spacing.md} />

      {scanHistory.length === 0 ? (
        <View
          style={[styles.emptyCard, { backgroundColor: theme.cardBackground }]}
        >
          <Feather name="camera" size={24} color={theme.textSecondary} />
          <ThemedText
            type="body"
            style={[styles.emptyText, { color: theme.textSecondary }]}
          >
            {t.home.noScans}
          </ThemedText>
          <Pressable
            onPress={() => navigation.getParent()?.navigate("ScannerTab")}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="camera" size={16} color="#FFFFFF" />
            <ThemedText type="label" style={styles.addButtonText}>
              {t.home.scanPill}
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.scansList}>
          {scanHistory.slice(0, 5).map((scan) => (
            <MedCard
              key={scan.id}
              title={scan.medicationName}
              subtitle={`Scanned ${new Date(scan.scannedAt).toLocaleDateString()}`}
              leftIcon="disc"
              badge={`${Math.round(scan.confidence * 100)}%`}
              badgeColor={theme.success}
              onPress={() =>
                navigation.navigate("MedicationDetail", {
                  medicationId: scan.medicationId,
                })
              }
              style={styles.scanCard}
            />
          ))}
        </View>
      )}

      <Spacer height={Spacing["3xl"]} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  greeting: {
    marginTop: Spacing.sm,
  },
  gamificationContent: {
    marginTop: Spacing.sm,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.xl,
  },
  statItem: {
    alignItems: "center",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAllButton: {
    padding: Spacing.xs,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  emptyText: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  addButtonText: {
    color: "#FFFFFF",
  },
  remindersList: {
    gap: Spacing.md,
  },
  reminderItem: {},
  scansList: {
    gap: Spacing.md,
  },
  scanCard: {},
});
