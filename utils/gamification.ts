import {
  getGamificationData,
  saveGamificationData,
  GamificationData,
  getScanHistory,
  getReminders,
} from "./storage";
import { syncGamificationToCloud } from "./syncEngine";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (data: GamificationData, stats: UserStats) => boolean;
  points: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  points: number;
  timestamp: string;
}

export interface UserStats {
  totalScans: number;
  totalInteractionsChecked: number;
  totalReportsSubmitted: number;
  remindersTakenToday: number;
  currentStreak: number;
}

const ACTIVITY_STORAGE_KEY = "@sentinelrx_recent_activity";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_scan",
    name: "First Scan",
    description: "Scan your first pill",
    icon: "camera",
    condition: (_, stats) => stats.totalScans >= 1,
    points: 10,
  },
  {
    id: "scanner_5",
    name: "Getting Started",
    description: "Scan 5 different pills",
    icon: "camera",
    condition: (_, stats) => stats.totalScans >= 5,
    points: 25,
  },
  {
    id: "scanner_25",
    name: "Pill Identifier",
    description: "Scan 25 different pills",
    icon: "camera",
    condition: (_, stats) => stats.totalScans >= 25,
    points: 100,
  },
  {
    id: "scanner_50",
    name: "Pill Expert",
    description: "Scan 50 different pills",
    icon: "award",
    condition: (_, stats) => stats.totalScans >= 50,
    points: 200,
  },
  {
    id: "streak_3",
    name: "Consistent",
    description: "3-day medication streak",
    icon: "zap",
    condition: (data) => data.streak >= 3,
    points: 30,
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "7-day medication streak",
    icon: "zap",
    condition: (data) => data.streak >= 7,
    points: 50,
  },
  {
    id: "streak_30",
    name: "Monthly Master",
    description: "30-day medication streak",
    icon: "zap",
    condition: (data) => data.streak >= 30,
    points: 200,
  },
  {
    id: "interaction_1",
    name: "Safety First",
    description: "Check your first drug interaction",
    icon: "alert-triangle",
    condition: (_, stats) => stats.totalInteractionsChecked >= 1,
    points: 15,
  },
  {
    id: "interaction_10",
    name: "Interaction Detective",
    description: "Check 10 drug interactions",
    icon: "search",
    condition: (_, stats) => stats.totalInteractionsChecked >= 10,
    points: 75,
  },
  {
    id: "interaction_20",
    name: "Pharmacology Pro",
    description: "Check 20 drug interactions",
    icon: "search",
    condition: (_, stats) => stats.totalInteractionsChecked >= 20,
    points: 150,
  },
  {
    id: "reporter_1",
    name: "Watchful Citizen",
    description: "Report your first suspicious listing",
    icon: "eye",
    condition: (_, stats) => stats.totalReportsSubmitted >= 1,
    points: 25,
  },
  {
    id: "reporter_10",
    name: "Watchful Eye",
    description: "Report 10 suspicious listings",
    icon: "eye",
    condition: (_, stats) => stats.totalReportsSubmitted >= 10,
    points: 100,
  },
  {
    id: "level_5",
    name: "Rising Star",
    description: "Reach Level 5",
    icon: "star",
    condition: (data) => data.level >= 5,
    points: 100,
  },
  {
    id: "level_10",
    name: "Medication Master",
    description: "Reach Level 10",
    icon: "star",
    condition: (data) => data.level >= 10,
    points: 300,
  },
  {
    id: "level_20",
    name: "Health Guardian",
    description: "Reach Level 20",
    icon: "shield",
    condition: (data) => data.level >= 20,
    points: 500,
  },
];

export const POINT_VALUES = {
  scan: 10,
  interaction_check: 15,
  reminder_taken: 5,
  report_submitted: 20,
  streak_bonus: 5,
  daily_login: 2,
};

async function getRecentActivity(): Promise<ActivityItem[]> {
  try {
    const AsyncStorageModule = await import(
      "@react-native-async-storage/async-storage"
    );
    const AsyncStorage = AsyncStorageModule.default;
    const data = await AsyncStorage.getItem(ACTIVITY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

async function saveRecentActivity(activities: ActivityItem[]): Promise<void> {
  try {
    const AsyncStorageModule = await import(
      "@react-native-async-storage/async-storage"
    );
    const AsyncStorage = AsyncStorageModule.default;
    const recentActivities = activities.slice(-50);
    await AsyncStorage.setItem(
      ACTIVITY_STORAGE_KEY,
      JSON.stringify(recentActivities),
    );
  } catch (error) {
    console.error("Error saving activity:", error);
  }
}

async function addActivity(action: string, points: number): Promise<void> {
  const activities = await getRecentActivity();
  activities.push({
    id: Date.now().toString(),
    action,
    points,
    timestamp: new Date().toISOString(),
  });
  await saveRecentActivity(activities);
}

export async function getLatestActivity(
  count: number = 10,
): Promise<ActivityItem[]> {
  const activities = await getRecentActivity();
  return activities.slice(-count).reverse();
}

export async function getUserStats(): Promise<UserStats> {
  const scanHistory = await getScanHistory();
  const gamification = await getGamificationData();
  const reminders = await getReminders();

  const today = new Date().toISOString().split("T")[0];
  const remindersTakenToday = reminders.filter(
    (r) => r.isEnabled && r.takenDates.includes(today),
  ).length;

  return {
    totalScans: scanHistory.length,
    totalInteractionsChecked: gamification.totalInteractionsChecked || 0,
    totalReportsSubmitted: gamification.totalReportsSubmitted || 0,
    remindersTakenToday,
    currentStreak: gamification.streak,
  };
}

function calculateLevel(points: number): number {
  return Math.floor(points / 100) + 1;
}

async function checkAndUnlockAchievements(
  data: GamificationData,
  stats: UserStats,
): Promise<string[]> {
  const newlyUnlocked: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!data.achievements.includes(achievement.id)) {
      if (achievement.condition(data, stats)) {
        newlyUnlocked.push(achievement.id);
      }
    }
  }

  return newlyUnlocked;
}

export async function awardPoints(
  action:
    | "scan"
    | "interaction_check"
    | "reminder_taken"
    | "report_submitted"
    | "daily_login",
  description?: string,
): Promise<{
  pointsAwarded: number;
  newAchievements: string[];
  newLevel: boolean;
  currentData: GamificationData;
}> {
  const data = await getGamificationData();
  const stats = await getUserStats();
  const today = new Date().toISOString().split("T")[0];

  let pointsAwarded = POINT_VALUES[action];

  if (data.lastActiveDate !== today) {
    pointsAwarded += POINT_VALUES.daily_login;
  }

  const streakBonus = Math.min(data.streak, 10) * POINT_VALUES.streak_bonus;
  if (action === "reminder_taken") {
    pointsAwarded += streakBonus;
  }

  if (action === "scan") {
    data.scansThisWeek++;
  } else if (action === "interaction_check") {
    data.reportsThisMonth++;
    data.totalInteractionsChecked = (data.totalInteractionsChecked || 0) + 1;
  } else if (action === "report_submitted") {
    data.totalReportsSubmitted = (data.totalReportsSubmitted || 0) + 1;
  }

  const oldLevel = data.level;
  data.points += pointsAwarded;
  data.level = calculateLevel(data.points);
  data.lastActiveDate = today;

  const updatedStats = { ...stats };
  if (action === "scan") {
    updatedStats.totalScans++;
  } else if (action === "interaction_check") {
    updatedStats.totalInteractionsChecked++;
  } else if (action === "report_submitted") {
    updatedStats.totalReportsSubmitted++;
  }

  const newAchievements = await checkAndUnlockAchievements(data, updatedStats);

  for (const achievementId of newAchievements) {
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (achievement) {
      data.points += achievement.points;
      data.achievements.push(achievement.id);
      await addActivity(`Unlocked: ${achievement.name}`, achievement.points);
    }
  }

  data.level = calculateLevel(data.points);

  await saveGamificationData(data);
  
  // 🔄 Sync to cloud
  await syncGamificationToCloud({
    points: data.points,
    level: data.level,
    streak: data.streak,
    badges: data.achievements,
  });

  const actionDescriptions: Record<string, string> = {
    scan: description || "Scanned a medication",
    interaction_check: "Checked drug interactions",
    reminder_taken: "Completed medication reminder",
    report_submitted: "Reported suspicious listing",
    daily_login: "Daily login bonus",
  };

  await addActivity(actionDescriptions[action], POINT_VALUES[action]);

  return {
    pointsAwarded,
    newAchievements,
    newLevel: data.level > oldLevel,
    currentData: data,
  };
}

export async function updateStreak(): Promise<{
  streak: number;
  streakBroken: boolean;
  streakMaintained: boolean;
}> {
  const data = await getGamificationData();
  const reminders = await getReminders();
  const today = new Date().toISOString().split("T")[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const enabledReminders = reminders.filter((r) => r.isEnabled);
  if (enabledReminders.length === 0) {
    return { streak: data.streak, streakBroken: false, streakMaintained: true };
  }

  const allTakenToday = enabledReminders.every((r) =>
    r.takenDates.includes(today),
  );
  const allTakenYesterday = enabledReminders.every((r) =>
    r.takenDates.includes(yesterdayStr),
  );

  let streakBroken = false;
  let streakMaintained = false;

  if (data.lastActiveDate !== today && data.lastActiveDate !== yesterdayStr) {
    data.streak = 0;
    streakBroken = true;
  } else if (!allTakenYesterday && data.lastActiveDate === yesterdayStr) {
    data.streak = 0;
    streakBroken = true;
  }

  if (allTakenToday) {
    if (data.lastActiveDate !== today) {
      data.streak++;
      streakMaintained = true;
    }
  }

  data.lastActiveDate = today;
  await saveGamificationData(data);

  return {
    streak: data.streak,
    streakBroken,
    streakMaintained,
  };
}

export async function resetWeeklyStats(): Promise<void> {
  const data = await getGamificationData();
  const today = new Date();

  if (today.getDay() === 0) {
    data.scansThisWeek = 0;
  }

  if (today.getDate() === 1) {
    data.reportsThisMonth = 0;
  }

  await saveGamificationData(data);
}

export function getAchievementProgress(
  achievementId: string,
  data: GamificationData,
  stats: UserStats,
): number {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return 0;

  if (data.achievements.includes(achievementId)) return 1;

  switch (achievementId) {
    case "first_scan":
      return Math.min(stats.totalScans / 1, 1);
    case "scanner_5":
      return Math.min(stats.totalScans / 5, 1);
    case "scanner_25":
      return Math.min(stats.totalScans / 25, 1);
    case "scanner_50":
      return Math.min(stats.totalScans / 50, 1);
    case "streak_3":
      return Math.min(data.streak / 3, 1);
    case "streak_7":
      return Math.min(data.streak / 7, 1);
    case "streak_30":
      return Math.min(data.streak / 30, 1);
    case "interaction_1":
      return Math.min(stats.totalInteractionsChecked / 1, 1);
    case "interaction_10":
      return Math.min(stats.totalInteractionsChecked / 10, 1);
    case "interaction_20":
      return Math.min(stats.totalInteractionsChecked / 20, 1);
    case "reporter_1":
      return Math.min(stats.totalReportsSubmitted / 1, 1);
    case "reporter_10":
      return Math.min(stats.totalReportsSubmitted / 10, 1);
    case "level_5":
      return Math.min(data.level / 5, 1);
    case "level_10":
      return Math.min(data.level / 10, 1);
    case "level_20":
      return Math.min(data.level / 20, 1);
    default:
      return 0;
  }
}

export async function getUnlockedAchievements(): Promise<Achievement[]> {
  const data = await getGamificationData();
  return ACHIEVEMENTS.filter((a) => data.achievements.includes(a.id));
}

export async function getLockedAchievements(): Promise<Achievement[]> {
  const data = await getGamificationData();
  return ACHIEVEMENTS.filter((a) => !data.achievements.includes(a.id));
}
