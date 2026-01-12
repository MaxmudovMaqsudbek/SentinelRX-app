import React, { useState, useCallback } from "react";
import { View, StyleSheet, TextInput, Pressable, Switch } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useApp, useTranslations } from "@/contexts/AppContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import {
  getUserProfile,
  saveUserProfile,
  getSettings,
  saveSettings,
  UserProfile,
  Settings,
} from "@/utils/storage";

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Settings">;
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "uz", label: "O'zbek" },
  { code: "ru", label: "Русский" },
];

const CURRENCIES = ["USD", "UZS", "EUR", "RUB"];

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { theme } = useTheme();
  const { setLanguage, setThemeMode, themeSetting } = useApp();
  const { t } = useTranslations();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const [profileData, settingsData] = await Promise.all([
          getUserProfile(),
          getSettings(),
        ]);
        setProfile(profileData);
        setSettings(settingsData);
      };
      loadData();
    }, []),
  );

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
      setHasChanges(true);
    }
  };

  const updateSettings = (updates: Partial<Settings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates });
      setHasChanges(true);
    }
  };

  const handleLanguageChange = async (lang: "en" | "uz" | "ru") => {
    updateProfile({ language: lang });
    setLanguage(lang);
    // Persist language change immediately for better UX
    if (profile) {
      await saveUserProfile({ ...profile, language: lang });
    }
  };

  const handleThemeChange = async (mode: "light" | "dark" | "system") => {
    updateSettings({ theme: mode });
    setThemeMode(mode);
  };

  const handleSave = async () => {
    if (profile && settings) {
      await saveUserProfile(profile);
      await saveSettings(settings);
      setHasChanges(false);
      navigation.goBack();
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundSecondary, color: theme.text },
  ];

  if (!profile || !settings) {
    return null;
  }

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h3">{t.profile.title}</ThemedText>
      <Spacer height={Spacing.lg} />

      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
      >
        <View style={styles.field}>
          <ThemedText type="label">{t.profile.displayName}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={profile.name}
            onChangeText={(text) => updateProfile({ name: text })}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="label">{t.profile.age}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={profile.age?.toString() || ""}
            onChangeText={(text) =>
              updateProfile({ age: text ? parseInt(text, 10) : undefined })
            }
            placeholder="Enter your age"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <View style={styles.switchRow}>
            <ThemedText type="label">{t.profile.pregnancyStatus}</ThemedText>
            <Switch
              value={profile.isPregnant || false}
              onValueChange={(value) => updateProfile({ isPregnant: value })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {t.profile.pregnancyHint}
          </ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText type="label">{t.profile.allergies}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={profile.allergies.join(", ")}
            onChangeText={(text) =>
              updateProfile({
                allergies: text
                  .split(",")
                  .map((a) => a.trim())
                  .filter((a) => a),
              })
            }
            placeholder={t.profile.allergiesPlaceholder}
            placeholderTextColor={theme.textSecondary}
          />
          <ThemedText
            type="caption"
            style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
          >
            {t.profile.allergiesHint}
          </ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText type="label">{t.profile.chronicConditions}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={profile.chronicConditions.join(", ")}
            onChangeText={(text) =>
              updateProfile({
                chronicConditions: text
                  .split(",")
                  .map((c) => c.trim())
                  .filter((c) => c),
              })
            }
            placeholder={t.profile.conditionsPlaceholder}
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      </View>

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h3">{t.profile.theme}</ThemedText>
      <Spacer height={Spacing.lg} />

      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
      >
        <View style={styles.optionsRow}>
          {(["light", "dark", "system"] as const).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => handleThemeChange(mode)}
              style={[
                styles.themeChip,
                {
                  backgroundColor:
                    themeSetting === mode
                      ? theme.primary
                      : theme.backgroundSecondary,
                },
              ]}
            >
              <Feather
                name={
                  mode === "light"
                    ? "sun"
                    : mode === "dark"
                      ? "moon"
                      : "smartphone"
                }
                size={18}
                color={themeSetting === mode ? "#FFFFFF" : theme.text}
              />
              <ThemedText
                type="label"
                style={{
                  color: themeSetting === mode ? "#FFFFFF" : theme.text,
                  marginLeft: Spacing.sm,
                }}
              >
                {mode === "light"
                  ? t.profile.light
                  : mode === "dark"
                    ? t.profile.dark
                    : t.profile.system}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h3">
        {t.profile.language} & {t.profile.currency}
      </ThemedText>
      <Spacer height={Spacing.lg} />

      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
      >
        <ThemedText type="label">{t.profile.language}</ThemedText>
        <Spacer height={Spacing.md} />
        <View style={styles.optionsRow}>
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang.code}
              onPress={() =>
                handleLanguageChange(lang.code as "en" | "uz" | "ru")
              }
              style={[
                styles.optionChip,
                {
                  backgroundColor:
                    profile.language === lang.code
                      ? theme.primary
                      : theme.backgroundSecondary,
                },
              ]}
            >
              <ThemedText
                type="label"
                style={{
                  color:
                    profile.language === lang.code ? "#FFFFFF" : theme.text,
                }}
              >
                {lang.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Spacer height={Spacing.xl} />

        <ThemedText type="label">{t.profile.currency}</ThemedText>
        <Spacer height={Spacing.md} />
        <View style={styles.optionsRow}>
          {CURRENCIES.map((curr) => (
            <Pressable
              key={curr}
              onPress={() => updateProfile({ currency: curr })}
              style={[
                styles.optionChip,
                {
                  backgroundColor:
                    profile.currency === curr
                      ? theme.primary
                      : theme.backgroundSecondary,
                },
              ]}
            >
              <ThemedText
                type="label"
                style={{
                  color: profile.currency === curr ? "#FFFFFF" : theme.text,
                }}
              >
                {curr}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h3">{t.profile.notifications}</ThemedText>
      <Spacer height={Spacing.lg} />

      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
      >
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Feather name="bell" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.switchText}>
              {t.profile.allNotifications}
            </ThemedText>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) =>
              updateSettings({ notificationsEnabled: value })
            }
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Feather name="clock" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.switchText}>
              {t.profile.medicationReminders}
            </ThemedText>
          </View>
          <Switch
            value={settings.reminderNotifications}
            onValueChange={(value) =>
              updateSettings({ reminderNotifications: value })
            }
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
            disabled={!settings.notificationsEnabled}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Feather
              name="alert-triangle"
              size={20}
              color={theme.textSecondary}
            />
            <ThemedText type="body" style={styles.switchText}>
              {t.profile.recallAlerts}
            </ThemedText>
          </View>
          <Switch
            value={settings.recallAlerts}
            onValueChange={(value) => updateSettings({ recallAlerts: value })}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
            disabled={!settings.notificationsEnabled}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Feather name="users" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.switchText}>
              {t.profile.familyUpdates}
            </ThemedText>
          </View>
          <Switch
            value={settings.familyUpdates}
            onValueChange={(value) => updateSettings({ familyUpdates: value })}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
            disabled={!settings.notificationsEnabled}
          />
        </View>
      </View>

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h3">{t.profile.medicalTourismMode}</ThemedText>
      <Spacer height={Spacing.lg} />

      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
      >
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Feather name="map-pin" size={20} color={theme.textSecondary} />
            <View style={styles.switchTextContainer}>
              <ThemedText type="body" style={styles.switchText}>
                {t.profile.travelMode}
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary, marginLeft: Spacing.md }}
              >
                {t.profile.travelModeHint}
              </ThemedText>
            </View>
          </View>
          <Switch
            value={settings.medicalTourismMode}
            onValueChange={(value) =>
              updateSettings({ medicalTourismMode: value })
            }
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Feather name="globe" size={20} color={theme.textSecondary} />
            <View style={styles.switchTextContainer}>
              <ThemedText type="body" style={styles.switchText}>
                {t.profile.autoTranslate}
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary, marginLeft: Spacing.md }}
              >
                {t.profile.autoTranslateHint}
              </ThemedText>
            </View>
          </View>
          <Switch
            value={settings.autoTranslateMeds}
            onValueChange={(value) =>
              updateSettings({ autoTranslateMeds: value })
            }
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
            disabled={!settings.medicalTourismMode}
          />
        </View>

        {settings.medicalTourismMode && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.tourismInfo}>
              <Feather name="info" size={16} color={theme.primary} />
              <ThemedText
                type="caption"
                style={{
                  color: theme.textSecondary,
                  marginLeft: Spacing.sm,
                  flex: 1,
                }}
              >
                When enabled, the app will detect your location and provide
                medication translations, local currency prices, and pharmacy
                phrases in the local language.
              </ThemedText>
            </View>
          </>
        )}
      </View>

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h3">{t.profile.accessibility}</ThemedText>
      <Spacer height={Spacing.lg} />

      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
      >
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Feather name="eye" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.switchText}>
              {t.profile.highContrastMode}
            </ThemedText>
          </View>
          <Switch
            value={settings.highContrastMode}
            onValueChange={(value) =>
              updateSettings({ highContrastMode: value })
            }
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <Spacer height={Spacing["2xl"]} />

      <Button onPress={handleSave} disabled={!hasChanges}>
        {t.profile.saveChanges}
      </Button>

      <Spacer height={Spacing["3xl"]} />
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  optionChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  themeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  switchLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  switchText: {
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  switchTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  tourismInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: Spacing.md,
  },
});
