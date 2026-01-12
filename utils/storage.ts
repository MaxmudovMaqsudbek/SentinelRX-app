import AsyncStorage from "@react-native-async-storage/async-storage";

// =============================================================================
// USER-SCOPED STORAGE: All data is isolated per user account
// =============================================================================

// Base storage key prefixes (will be combined with user ID)
const STORAGE_KEY_BASES = {
  USER_PROFILE: "user_profile",
  MEDICATIONS: "medications",
  REMINDERS: "reminders",
  SCAN_HISTORY: "scan_history",
  GAMIFICATION: "gamification",
  SETTINGS: "settings",
  FAMILY_MEMBERS: "family_members",
};

// Current user ID (set when user logs in)
let currentUserId: string | null = null;

// Set the current user ID (call this when user logs in)
export function setCurrentUserId(userId: string | null): void {
  currentUserId = userId;
  console.log(`[Storage] User context set: ${userId ? userId.substring(0, 8) + '...' : 'guest'}`);
}

// Get the current user ID
export function getCurrentUserId(): string | null {
  return currentUserId;
}

// Generate user-scoped storage key
function getUserStorageKey(baseKey: string): string {
  const userId = currentUserId || "guest";
  return `@sentinelrx_${userId}_${baseKey}`;
}

// Legacy keys for migration (without user prefix)
const LEGACY_STORAGE_KEYS = {
  USER_PROFILE: "@sentinelrx_user_profile",
  MEDICATIONS: "@sentinelrx_medications",
  REMINDERS: "@sentinelrx_reminders",
  SCAN_HISTORY: "@sentinelrx_scan_history",
  GAMIFICATION: "@sentinelrx_gamification",
  SETTINGS: "@sentinelrx_settings",
  FAMILY_MEMBERS: "@sentinelrx_family_members",
};

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  isPregnant?: boolean;
  allergies: string[];
  chronicConditions: string[];
  language: "en" | "uz" | "ru";
  currency: string;
  avatarIndex: number;
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  manufacturer: string;
  shape: string;
  color: string;
  imprint?: string;
  scannedAt: string;
  imageUri?: string;
  warnings: string[];
  sideEffects: string[];
  interactions?: string[];
  // Investor Grade Data
  batchNumber?: string;
  expirationDate?: string;
  packaging?: string;
  description?: string;
  pregnancyCategory?: string;
  category?: string;
  price?: number;
}

export interface Reminder {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string;
  frequency: "daily" | "weekly" | "monthly" | "as_needed";
  daysOfWeek?: number[];
  isEnabled: boolean;
  lastTaken?: string;
  takenDates: string[];
}

export interface ScanMatchDetails {
  shape: boolean;
  color: boolean;
  imprint: boolean;
}

export interface ScanHistoryItem {
  id: string;
  medicationId: string;
  medicationName: string;
  scannedAt: string;
  imageUri?: string;
  confidence: number;
  analysisMethod?: "ai" | "database" | "visual";
  matchDetails?: ScanMatchDetails;
  // Investor Grade Data
  batchNumber?: string;
  expirationDate?: string;
}

export interface GamificationData {
  points: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  achievements: string[];
  scansThisWeek: number;
  reportsThisMonth: number;
  totalInteractionsChecked: number;
  totalReportsSubmitted: number;
}

export interface Settings {
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  reminderNotifications: boolean;
  recallAlerts: boolean;
  familyUpdates: boolean;
  measurementUnits: "metric" | "imperial";
  highContrastMode: boolean;
  medicalTourismMode: boolean;
  travelDestination?: string;
  autoTranslateMeds: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  inviteCode: string;
  isConnected: boolean;
  adherencePercentage: number;
}

const defaultProfile: UserProfile = {
  id: "user_1",
  name: "User",
  allergies: [],
  chronicConditions: [],
  language: "en",
  currency: "USD",
  avatarIndex: 0,
};

const defaultGamification: GamificationData = {
  points: 0,
  level: 1,
  streak: 0,
  lastActiveDate: new Date().toISOString().split("T")[0],
  achievements: [],
  scansThisWeek: 0,
  reportsThisMonth: 0,
  totalInteractionsChecked: 0,
  totalReportsSubmitted: 0,
};

const defaultSettings: Settings = {
  theme: "system",
  notificationsEnabled: true,
  reminderNotifications: true,
  recallAlerts: true,
  familyUpdates: true,
  measurementUnits: "metric",
  highContrastMode: false,
  medicalTourismMode: false,
  autoTranslateMeds: true,
};

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(getUserStorageKey(STORAGE_KEY_BASES.USER_PROFILE));
    return data ? JSON.parse(data) : defaultProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return defaultProfile;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(
      getUserStorageKey(STORAGE_KEY_BASES.USER_PROFILE),
      JSON.stringify(profile),
    );
  } catch (error) {
    console.error("Error saving user profile:", error);
  }
}

export async function getMedications(): Promise<Medication[]> {
  try {
    const data = await AsyncStorage.getItem(getUserStorageKey(STORAGE_KEY_BASES.MEDICATIONS));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting medications:", error);
    return [];
  }
}

export async function saveMedication(medication: Medication): Promise<void> {
  try {
    const medications = await getMedications();
    const existingIndex = medications.findIndex((m) => m.id === medication.id);
    if (existingIndex >= 0) {
      medications[existingIndex] = medication;
    } else {
      medications.push(medication);
    }
    await AsyncStorage.setItem(
      getUserStorageKey(STORAGE_KEY_BASES.MEDICATIONS),
      JSON.stringify(medications),
    );
  } catch (error) {
    console.error("Error saving medication:", error);
  }
}

export async function getReminders(): Promise<Reminder[]> {
  try {
    const data = await AsyncStorage.getItem(getUserStorageKey(STORAGE_KEY_BASES.REMINDERS));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting reminders:", error);
    return [];
  }
}

export async function saveReminder(reminder: Reminder): Promise<void> {
  try {
    const reminders = await getReminders();
    const existingIndex = reminders.findIndex((r) => r.id === reminder.id);
    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.push(reminder);
    }
    await AsyncStorage.setItem(
      getUserStorageKey(STORAGE_KEY_BASES.REMINDERS),
      JSON.stringify(reminders),
    );
  } catch (error) {
    console.error("Error saving reminder:", error);
  }
}

export async function deleteReminder(reminderId: string): Promise<void> {
  try {
    const reminders = await getReminders();
    const filteredReminders = reminders.filter((r) => r.id !== reminderId);
    await AsyncStorage.setItem(
      getUserStorageKey(STORAGE_KEY_BASES.REMINDERS),
      JSON.stringify(filteredReminders),
    );
  } catch (error) {
    console.error("Error deleting reminder:", error);
  }
}

export async function markReminderTaken(
  reminderId: string,
  dateStr?: string,
): Promise<void> {
  try {
    const reminders = await getReminders();
    const reminder = reminders.find((r) => r.id === reminderId);
    if (reminder) {
      const targetDate = dateStr || new Date().toISOString().split("T")[0];

      if (reminder.takenDates.includes(targetDate)) {
        reminder.takenDates = reminder.takenDates.filter(
          (d) => d !== targetDate,
        );
      } else {
        reminder.takenDates.push(targetDate);
        reminder.lastTaken = new Date().toISOString();
      }

      await saveReminder(reminder);
    }
  } catch (error) {
    console.error("Error marking reminder taken:", error);
  }
}

export async function getScanHistory(): Promise<ScanHistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(getUserStorageKey(STORAGE_KEY_BASES.SCAN_HISTORY));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting scan history:", error);
    return [];
  }
}

export async function addScanToHistory(scan: ScanHistoryItem): Promise<void> {
  try {
    const history = await getScanHistory();
    history.unshift(scan);
    if (history.length > 50) {
      history.pop();
    }
    await AsyncStorage.setItem(
      getUserStorageKey(STORAGE_KEY_BASES.SCAN_HISTORY),
      JSON.stringify(history),
    );
  } catch (error) {
    console.error("Error adding scan to history:", error);
  }
}

export async function getGamificationData(): Promise<GamificationData> {
  try {
    const data = await AsyncStorage.getItem(getUserStorageKey(STORAGE_KEY_BASES.GAMIFICATION));
    if (data) {
      const gamification = JSON.parse(data);
      const today = new Date().toISOString().split("T")[0];
      if (gamification.lastActiveDate !== today) {
        const lastDate = new Date(gamification.lastActiveDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays > 1) {
          gamification.streak = 0;
        }
      }
      return gamification;
    }
    return defaultGamification;
  } catch (error) {
    console.error("Error getting gamification data:", error);
    return defaultGamification;
  }
}

export async function updateGamification(
  updates: Partial<GamificationData>,
): Promise<GamificationData> {
  try {
    const current = await getGamificationData();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(
      getUserStorageKey(STORAGE_KEY_BASES.GAMIFICATION),
      JSON.stringify(updated),
    );
    return updated;
  } catch (error) {
    console.error("Error updating gamification:", error);
    return await getGamificationData();
  }
}

export async function saveGamificationData(
  data: GamificationData,
): Promise<void> {
  try {
    await AsyncStorage.setItem(getUserStorageKey(STORAGE_KEY_BASES.GAMIFICATION), JSON.stringify(data));
  } catch (error) {
    console.error("Error saving gamification data:", error);
  }
}

export async function addPoints(points: number): Promise<GamificationData> {
  const current = await getGamificationData();
  const today = new Date().toISOString().split("T")[0];

  let newStreak = current.streak;
  if (current.lastActiveDate !== today) {
    const lastDate = new Date(current.lastActiveDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) {
      newStreak = current.streak + 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const newPoints = current.points + points;
  const newLevel = Math.floor(newPoints / 100) + 1;

  return updateGamification({
    points: newPoints,
    level: newLevel,
    streak: newStreak,
    lastActiveDate: today,
  });
}

export async function getSettings(): Promise<Settings> {
  try {
    const data = await AsyncStorage.getItem(getUserStorageKey(STORAGE_KEY_BASES.SETTINGS));
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch (error) {
    console.error("Error getting settings:", error);
    return defaultSettings;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(getUserStorageKey(STORAGE_KEY_BASES.SETTINGS), JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  try {
    const data = await AsyncStorage.getItem(getUserStorageKey(STORAGE_KEY_BASES.FAMILY_MEMBERS));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting family members:", error);
    return [];
  }
}

export async function saveFamilyMember(member: FamilyMember): Promise<void> {
  try {
    const members = await getFamilyMembers();
    const existingIndex = members.findIndex((m) => m.id === member.id);
    if (existingIndex >= 0) {
      members[existingIndex] = member;
    } else {
      members.push(member);
    }
    await AsyncStorage.setItem(
      getUserStorageKey(STORAGE_KEY_BASES.FAMILY_MEMBERS),
      JSON.stringify(members),
    );
  } catch (error) {
    console.error("Error saving family member:", error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    // Clear user-scoped data for current user
    const keysToRemove = Object.values(STORAGE_KEY_BASES).map(base => getUserStorageKey(base));
    await AsyncStorage.multiRemove(keysToRemove);
    console.log(`[Storage] Cleared all data for user: ${currentUserId || 'guest'}`);
  } catch (error) {
    console.error("Error clearing all data:", error);
  }
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
