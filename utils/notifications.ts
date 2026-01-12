import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Reminder, getSettings } from "./storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface ScheduledNotification {
  reminderId: string;
  notificationId: string;
  scheduledTime: Date;
}

const scheduledNotifications: ScheduledNotification[] = [];

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function checkNotificationPermissions(): Promise<
  "granted" | "denied" | "undetermined"
> {
  if (Platform.OS === "web") {
    return "denied";
  }

  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function scheduleReminderNotification(
  reminder: Reminder,
): Promise<string | null> {
  if (Platform.OS === "web") {
    console.log("[Notifications] Web platform - notifications simulated");
    return `web-sim-${reminder.id}`;
  }

  const settings = await getSettings();
  if (!settings.reminderNotifications) {
    return null;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return null;
  }

  await cancelReminderNotification(reminder.id);

  const [hours, minutes] = reminder.time.split(":").map(Number);

  const trigger: Notifications.DailyTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: hours,
    minute: minutes,
  };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for your medication",
      body: `Take ${reminder.medicationName} (${reminder.dosage})`,
      sound: true,
      data: {
        reminderId: reminder.id,
        medicationName: reminder.medicationName,
        type: "medication_reminder",
      },
      badge: 1,
    },
    trigger,
  });

  scheduledNotifications.push({
    reminderId: reminder.id,
    notificationId,
    scheduledTime: new Date(),
  });

  return notificationId;
}

export async function cancelReminderNotification(
  reminderId: string,
): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  const scheduled = scheduledNotifications.filter(
    (n) => n.reminderId === reminderId,
  );

  for (const notification of scheduled) {
    await Notifications.cancelScheduledNotificationAsync(
      notification.notificationId,
    );
  }

  const remainingNotifications = scheduledNotifications.filter(
    (n) => n.reminderId !== reminderId,
  );
  scheduledNotifications.length = 0;
  scheduledNotifications.push(...remainingNotifications);
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  scheduledNotifications.length = 0;
}

export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  if (Platform.OS === "web") {
    return [];
  }

  return await Notifications.getAllScheduledNotificationsAsync();
}

export async function scheduleImmediateNotification(
  title: string,
  body: string,
): Promise<void> {
  if (Platform.OS === "web") {
    console.log(`[Notification] ${title}: ${body}`);
    return;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null,
  });
}

export async function scheduleMissedDoseReminder(
  reminder: Reminder,
): Promise<void> {
  if (Platform.OS === "web") return;

  const [hours, minutes] = reminder.time.split(":").map(Number);
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  const followUpTime = new Date(scheduledTime.getTime() + 30 * 60 * 1000);

  const now = new Date();
  if (followUpTime > now) {
    const secondsUntil = Math.floor(
      (followUpTime.getTime() - now.getTime()) / 1000,
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Missed Medication Reminder",
        body: `Have you taken ${reminder.medicationName}? It was scheduled for ${reminder.time}`,
        sound: true,
        data: {
          reminderId: reminder.id,
          type: "missed_dose_followup",
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntil,
      },
    });
  }
}

export interface AdherenceStats {
  weeklyAdherence: number;
  monthlyAdherence: number;
  currentStreak: number;
  longestStreak: number;
  totalDosesTaken: number;
  totalDosesMissed: number;
  adherenceByDay: { [day: string]: number };
}

export function calculateAdherenceStats(reminders: Reminder[]): AdherenceStats {
  const today = new Date();
  const stats: AdherenceStats = {
    weeklyAdherence: 0,
    monthlyAdherence: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalDosesTaken: 0,
    totalDosesMissed: 0,
    adherenceByDay: {},
  };

  if (reminders.length === 0) {
    return stats;
  }

  const enabledReminders = reminders.filter((r) => r.isEnabled);
  if (enabledReminders.length === 0) {
    return stats;
  }

  const last7Days: string[] = [];
  const last30Days: string[] = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    last30Days.push(dateStr);
    if (i < 7) {
      last7Days.push(dateStr);
    }
  }

  let weeklyTaken = 0;
  let weeklyTotal = 0;
  let monthlyTaken = 0;
  let monthlyTotal = 0;

  for (const dateStr of last7Days) {
    let takenCount = 0;
    for (const reminder of enabledReminders) {
      if (reminder.takenDates.includes(dateStr)) {
        takenCount++;
        stats.totalDosesTaken++;
      } else {
        stats.totalDosesMissed++;
      }
    }
    weeklyTaken += takenCount;
    weeklyTotal += enabledReminders.length;
    stats.adherenceByDay[dateStr] =
      enabledReminders.length > 0 ? takenCount / enabledReminders.length : 0;
  }

  for (const dateStr of last30Days.slice(7)) {
    let takenCount = 0;
    for (const reminder of enabledReminders) {
      if (reminder.takenDates.includes(dateStr)) {
        takenCount++;
      }
    }
    monthlyTaken += takenCount;
    monthlyTotal += enabledReminders.length;
  }

  stats.weeklyAdherence =
    weeklyTotal > 0 ? (weeklyTaken / weeklyTotal) * 100 : 0;
  stats.monthlyAdherence =
    weeklyTotal + monthlyTotal > 0
      ? ((weeklyTaken + monthlyTaken) / (weeklyTotal + monthlyTotal)) * 100
      : 0;

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    let allTaken = true;
    for (const reminder of enabledReminders) {
      if (!reminder.takenDates.includes(dateStr)) {
        allTaken = false;
        break;
      }
    }

    if (allTaken && enabledReminders.length > 0) {
      tempStreak++;
      if (i === 0 || currentStreak > 0) {
        currentStreak = tempStreak;
      }
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      if (i === 0) {
        currentStreak = 0;
      }
      tempStreak = 0;
    }
  }

  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  stats.currentStreak = currentStreak;
  stats.longestStreak = Math.max(longestStreak, currentStreak);

  return stats;
}

export function getAdherenceColor(adherence: number): string {
  if (adherence >= 90) return "#10B981";
  if (adherence >= 70) return "#F59E0B";
  if (adherence >= 50) return "#F97316";
  return "#EF4444";
}

export function getAdherenceLabel(adherence: number): string {
  if (adherence >= 90) return "Excellent";
  if (adherence >= 70) return "Good";
  if (adherence >= 50) return "Fair";
  return "Needs Improvement";
}
