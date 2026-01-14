import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, Pressable, Switch, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { MedCard } from "@/components/MedCard";
import { ProgressBar } from "@/components/ProgressBar";
import {
  SentinelScoreGauge,
  MedicalIDCard,
  CareCircleWidget,
} from "@/components/ProfileFeatures";
import Spacer from "@/components/Spacer";
import { useApp, useTranslations } from "@/contexts/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import {
  getUserProfile,
  getGamificationData,
  getSettings,
  getFamilyMembers,
  getReminders,
  UserProfile,
  GamificationData,
  Settings,
  FamilyMember,
} from "@/utils/storage";
import { calculateAdherenceStats, AdherenceStats } from "@/utils/notifications";

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Profile">;
};

const AVATAR_ICONS: (keyof typeof Feather.glyphMap)[] = [
  "disc",
  "activity",
  "plus-circle",
];

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { theme } = useTheme();
  const { t } = useTranslations();
  const { setThemeMode, themeSetting, user, isAuthenticated, logout } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gamification, setGamification] = useState<GamificationData | null>(
    null,
  );
  const [settings, setSettings] = useState<Settings | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [adherenceStats, setAdherenceStats] = useState<AdherenceStats | null>(null);

  // 🔥 ADVANCED: Merge authenticated user data with local profile
  const displayProfile = useMemo((): UserProfile => {
    const baseProfile = profile || {
      id: "user_1",
      name: "User",
      allergies: [],
      chronicConditions: [],
      language: "en" as const,
      currency: "USD",
      avatarIndex: 0,
    };
    
    // If authenticated, override with Supabase user data
    if (isAuthenticated && user) {
      return {
        ...baseProfile,
        id: user.id,
        name: user.full_name || baseProfile.name,
        language: (user.language as "en" | "uz" | "ru") || baseProfile.language,
      };
    }
    
    return baseProfile;
  }, [profile, user, isAuthenticated]);

  const loadData = useCallback(async () => {
    const [profileData, gamificationData, settingsData, members, reminders] =
      await Promise.all([
        getUserProfile(),
        getGamificationData(),
        getSettings(),
        getFamilyMembers(),
        getReminders(),
      ]);
    setProfile(profileData);
    setGamification(gamificationData);
    setSettings(settingsData);
    setFamilyMembers(members);
    setAdherenceStats(calculateAdherenceStats(reminders));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const levelProgress = gamification ? (gamification.points % 100) / 100 : 0;
  const avatarIcon = displayProfile ? AVATAR_ICONS[displayProfile.avatarIndex % 3] : "user";

  return (
    <ScreenScrollView>
      {/* INVESTOR FEATURE: Sentinel Health Score */}
      <Spacer height={Spacing.md} />
      <SentinelScoreGauge 
          score={
              (adherenceStats?.weeklyAdherence || 0) * 4 + 
              (gamification?.streak || 0) * 20 + 
              (displayProfile?.name !== "User" ? 200 : 0)
          } 
      />

      <Spacer height={Spacing.xl} />

      {/* INVESTOR FEATURE: Medical ID Card */}
      <MedicalIDCard 
          profile={displayProfile} 
          onExport={() => alert("Simulating PDF Export generated sent-to-doctor.pdf")}
      />

      <Spacer height={Spacing.xl} />

      {/* INVESTOR FEATURE: Care Circle Widget */}
      <CareCircleWidget 
          members={familyMembers}
          onAddMember={() => navigation.navigate("FamilyPanel")}
      />
      
      <Spacer height={Spacing.xl} />

      {/* NEW FEATURE: Medical Vault */}
      <Pressable onPress={() => navigation.navigate("MedicalVault")}>
        <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.profileCard, Shadows.medium, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }]}
        >
             <Feather name="shield" size={120} color="rgba(255,255,255,0.05)" style={{position: 'absolute', right: -20, bottom: -20}} />
             
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <View style={{width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'}}>
                     <Feather name="folder" size={24} color="#FFF" />
                 </View>
                 <View>
                     <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <ThemedText type="h4" style={{color: '#FFF'}}>Medical Vault</ThemedText>
                        <View style={{backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4}}>
                            <ThemedText type="small" style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>NEW</ThemedText>
                        </View>
                     </View>
                     <ThemedText type="caption" style={{color: 'rgba(255,255,255,0.8)'}}>086-Forma, Documents & AI Summary</ThemedText>
                 </View>
             </View>
             <Feather name="chevron-right" size={24} color="#FFF" />
        </LinearGradient>
      </Pressable>
      
      <Spacer height={Spacing.md} />

      {/* NEW FEATURE: Doctor Connect */}
      <Pressable onPress={() => navigation.navigate("DoctorConnect")}>
        <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.profileCard, Shadows.medium, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }]}
        >
             <Feather name="users" size={120} color="rgba(255,255,255,0.05)" style={{position: 'absolute', right: -20, bottom: -20}} />
             
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <View style={{width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'}}>
                     <Feather name="user-plus" size={24} color="#FFF" />
                 </View>
                 <View>
                     <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <ThemedText type="h4" style={{color: '#FFF'}}>Doctor Connect</ThemedText>
                        <View style={{backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4}}>
                            <ThemedText type="small" style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>💊</ThemedText>
                        </View>
                     </View>
                     <ThemedText type="caption" style={{color: 'rgba(255,255,255,0.8)'}}>Find Specialists & Pill Analysis</ThemedText>
                 </View>
             </View>
             <Feather name="chevron-right" size={24} color="#FFF" />
        </LinearGradient>
      </Pressable>
      
      <Spacer height={Spacing.xl} />
      
      {/* INVESTOR FEATURE: Travel Mode Trigger */}
      <Pressable onPress={() => navigation.navigate("Travel")}>
        <LinearGradient
            colors={['#0F766E', '#115E59']} // Teal-700 to Teal-800
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }} // Horizontal gradient
            style={[styles.profileCard, Shadows.medium, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }]}
        >
             {/* Background Decoration */}
             <Feather name="map" size={120} color="rgba(255,255,255,0.05)" style={{position: 'absolute', right: -20, bottom: -20}} />
             
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <View style={{width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'}}>
                     <Feather name="globe" size={24} color="#FFF" />
                 </View>
                 <View>
                     <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <ThemedText type="h4" style={{color: '#FFF'}}>{t.profile.travelMode}</ThemedText>
                        <View style={{backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4}}>
                            <ThemedText type="small" style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>ACTIVE</ThemedText>
                        </View>
                     </View>
                     <ThemedText type="caption" style={{color: 'rgba(255,255,255,0.8)'}}>{t.travel.title}</ThemedText>
                 </View>
             </View>
             <Feather name="chevron-right" size={24} color="#FFF" />
        </LinearGradient>
      </Pressable>
      
      <Spacer height={Spacing.xl} />

      {/* Legacy Stats Row - Kept as secondary info */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
          { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
        ]}
      >
        <View style={{ width: "45%" }}>
          <ThemedText type="label" style={{ color: theme.textSecondary }}>
            {t.profile.profileComplete}
          </ThemedText>
          <ThemedText type="h3">
            {displayProfile?.name !== "User" ? "100%" : "30%"}
          </ThemedText>
        </View>
        <View style={{ width: "45%" }}>
          <ThemedText type="label" style={{ color: theme.textSecondary }}>
            {t.profile.currentStreak}
          </ThemedText>
          <ThemedText type="h3">{gamification?.streak || 0} {t.home.days}</ThemedText>
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <MedCard
        title={t.profile.rewardsAchievements}
        subtitle={t.home.points}
        leftIcon="award"
        onPress={() => navigation.navigate("Rewards")}
      >
        <ProgressBar progress={levelProgress} />
        <Spacer height={Spacing.xs} />
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {100 - ((gamification?.points || 0) % 100)} points to next level
        </ThemedText>
      </MedCard>

      <Spacer height={Spacing.lg} />

      <MedCard
        title="Family Panel"
        subtitle="Monitor and manage family medication adherence"
        leftIcon="users"
        onPress={() => navigation.navigate("FamilyPanel")}
      />

      <Spacer height={Spacing.lg} />

      <MedCard
        title="Travel Mode"
        subtitle="Medical tourism assistance and translations"
        leftIcon="map-pin"
        onPress={() => navigation.navigate("Travel")}
      />

      <Spacer height={Spacing.xl} />

      <ThemedText type="h3">Settings</ThemedText>
      <Spacer height={Spacing.md} />

      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
      >
        <Pressable
          style={styles.settingsItem}
          onPress={() => navigation.navigate("Settings")}
        >
          <Feather name="user" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={styles.settingsLabel}>
            Personal Information
          </ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <View
          style={[styles.settingsDivider, { backgroundColor: theme.border }]}
        />

        <Pressable
          onPress={() => navigation.navigate("Settings")}
          style={({ pressed }) => [
            styles.settingsItem,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="globe" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={styles.settingsLabel}>
            Language & Currency
          </ThemedText>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginRight: Spacing.sm }}
          >
            {displayProfile?.language?.toUpperCase() || "EN"}
          </ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <View
          style={[styles.settingsDivider, { backgroundColor: theme.border }]}
        />

        <Pressable
          onPress={() => navigation.navigate("Settings")}
          style={({ pressed }) => [
            styles.settingsItem,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="bell" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={styles.settingsLabel}>
            Notifications
          </ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <View
          style={[styles.settingsDivider, { backgroundColor: theme.border }]}
        />

        <View style={styles.settingsItem}>
          <Feather name="moon" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={styles.settingsLabel}>
            Dark Mode
          </ThemedText>
          <Switch
            value={settings?.theme === "dark"}
            onValueChange={async (value) => {
                if (settings) {
                    const newTheme: "light" | "dark" | "system" = value ? "dark" : "light";
                    const newSettings: Settings = { ...settings, theme: newTheme };
                    setSettings(newSettings);
                    setThemeMode(newTheme);
                    await import("@/utils/storage").then(m => m.saveSettings(newSettings));
                }
            }}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <ThemedText type="h3">Health Information</ThemedText>
      <Spacer height={Spacing.md} />

      <View
        style={[
          styles.healthCard,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
      >
        <View style={styles.healthItem}>
          <ThemedText type="label">Age</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {profile?.age ? `${profile.age} years` : "Not set"}
          </ThemedText>
        </View>

        <View
          style={[styles.settingsDivider, { backgroundColor: theme.border }]}
        />

        <View style={styles.healthItem}>
          <ThemedText type="label">Allergies</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {profile?.allergies?.length
              ? profile.allergies.join(", ")
              : "None specified"}
          </ThemedText>
        </View>

        <View
          style={[styles.settingsDivider, { backgroundColor: theme.border }]}
        />

        <View style={styles.healthItem}>
          <ThemedText type="label">Chronic Conditions</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {profile?.chronicConditions?.length
              ? profile.chronicConditions.join(", ")
              : "None specified"}
          </ThemedText>
        </View>

        <View
          style={[styles.settingsDivider, { backgroundColor: theme.border }]}
        />

        <View style={styles.healthItem}>
          <ThemedText type="label">Pregnancy Status</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {profile?.isPregnant ? "Yes" : "No"}
          </ThemedText>
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <View
        style={[
          styles.aboutCard,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <ThemedText type="label">SentinelRX</ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          Version 1.0.0
        </ThemedText>
        <Spacer height={Spacing.md} />
        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          <ThemedText type="link">Privacy Policy</ThemedText>
        </Pressable>
        <Spacer height={Spacing.sm} />
        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          <ThemedText type="link">Terms of Service</ThemedText>
        </Pressable>
      </View>

      {/* Logout Button - Only show if authenticated */}
      {isAuthenticated && (
        <>
          <Spacer height={Spacing.xl} />
          <Pressable
            style={[
              styles.logoutButton,
              { backgroundColor: theme.error + '15', borderColor: theme.error },
            ]}
            onPress={() => {
              Alert.alert(
                "Logout",
                "Are you sure you want to logout?",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Logout", 
                    style: "destructive",
                    onPress: async () => {
                      await logout();
                    }
                  }
                ]
              );
            }}
          >
            <Feather name="log-out" size={20} color={theme.error} />
            <ThemedText type="body" style={{ color: theme.error, marginLeft: Spacing.sm, fontWeight: '600' }}>
              Logout
            </ThemedText>
          </Pressable>
        </>
      )}

      <Spacer height={Spacing["3xl"]} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  profileCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  settingsCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  settingsLabel: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  settingsDivider: {
    height: 1,
    marginLeft: Spacing.lg + 20 + Spacing.md,
  },
  healthCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  healthItem: {
    paddingVertical: Spacing.sm,
  },
  aboutCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
});
