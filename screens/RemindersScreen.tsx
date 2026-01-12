/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ReminderCard } from "@/components/ReminderCard";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations } from "@/contexts/AppContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import {
  getReminders,
  saveReminder,
  deleteReminder,
  markReminderTaken,
  Reminder,
  generateId,
} from "@/utils/storage";
import {
  scheduleReminderNotification,
  cancelReminderNotification,
  calculateAdherenceStats,
  getAdherenceColor,
  getAdherenceLabel,
  requestNotificationPermissions,
  checkNotificationPermissions,
  AdherenceStats,
} from "@/utils/notifications";
import { syncReminderToCloud, syncReminderDeleteToCloud } from "@/utils/syncEngine";

type RemindersScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "Reminders">;
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function generateCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days: (Date | null)[] = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

export default function RemindersScreen({ navigation }: RemindersScreenProps) {
  const { theme } = useTheme();
  const { t } = useTranslations();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [adherenceStats, setAdherenceStats] = useState<AdherenceStats | null>(
    null,
  );
  const [notificationStatus, setNotificationStatus] = useState<
    "granted" | "denied" | "undetermined"
  >("undetermined");
  const [newReminder, setNewReminder] = useState({
    medicationName: "",
    dosage: "",
    time: "08:00",
  });

  const loadReminders = useCallback(async () => {
    const data = await getReminders();
    setReminders(data);
    const stats = calculateAdherenceStats(data);
    setAdherenceStats(stats);
  }, []);

  const checkNotifications = useCallback(async () => {
    const status = await checkNotificationPermissions();
    setNotificationStatus(status);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReminders();
      checkNotifications();
    }, [loadReminders, checkNotifications]),
  );

  const handleToggle = async (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const dateStr = selectedDate.toISOString().split("T")[0];
    await markReminderTaken(id, dateStr);
    await loadReminders();
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermissions();
    if (granted) {
      setNotificationStatus("granted");
      for (const reminder of reminders) {
        if (reminder.isEnabled) {
          await scheduleReminderNotification(reminder);
        }
      }
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setNotificationStatus("denied");
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.medicationName.trim()) return;

    const reminder: Reminder = {
      id: generateId(),
      medicationId: generateId(),
      medicationName: newReminder.medicationName.trim(),
      dosage: newReminder.dosage.trim() || "As prescribed",
      time: newReminder.time,
      frequency: "daily",
      isEnabled: true,
      takenDates: [],
    };

    await saveReminder(reminder);
    
    // 🔄 Sync to cloud
    await syncReminderToCloud(reminder);

    if (notificationStatus === "granted") {
      await scheduleReminderNotification(reminder);
    }

    await loadReminders();

    setNewReminder({ medicationName: "", dosage: "", time: "08:00" });
    setIsModalVisible(false);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    await cancelReminderNotification(id);
    await deleteReminder(id);
    // 🔄 Sync deletion to cloud
    await syncReminderDeleteToCloud(id);
    await loadReminders();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const selectedDateStr = selectedDate.toISOString().split("T")[0];

  const todayReminders = reminders.filter((r) => r.isEnabled);
  const takenToday = todayReminders.filter((r) =>
    r.takenDates.includes(selectedDateStr),
  );

  const currentWeekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const diff = i - dayOfWeek;
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + diff);
    return newDate;
  });

  const getAdherenceForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const taken = reminders.filter((r) =>
      r.takenDates.includes(dateStr),
    ).length;
    const total = reminders.filter((r) => r.isEnabled).length;
    if (total === 0) return null;
    return taken / total;
  };

  const calendarDays = generateCalendarDays(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
  );

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCalendarMonth(newMonth);
  };

  return (
    <>
      <ScreenScrollView>
        {notificationStatus !== "granted" && Platform.OS !== "web" && (
          <>
            <Card
              style={[styles.notificationBanner, { borderColor: theme.accent }]}
            >
              <View style={styles.notificationContent}>
                <View
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: theme.accent + "20" },
                  ]}
                >
                  <Feather name="bell-off" size={20} color={theme.accent} />
                </View>
                <View style={styles.notificationTextContainer}>
                  <ThemedText type="label">{t.reminders.enableNotifications}</ThemedText>
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textSecondary }}
                  >
                    {t.reminders.enableNotificationsDesc}
                  </ThemedText>
                </View>
              </View>
              <Spacer height={Spacing.md} />
              <Button
                onPress={handleEnableNotifications}
                variant="secondary"
                size="small"
              >
                {t.reminders.enableNotifications}
              </Button>
            </Card>
            <Spacer height={Spacing.lg} />
          </>
        )}

        {adherenceStats && reminders.length > 0 && (
          <>
            <Card style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <ThemedText type="h4">Adherence Overview</ThemedText>
                <Pressable onPress={() => setShowCalendar(!showCalendar)}>
                  <Feather
                    name={showCalendar ? "list" : "calendar"}
                    size={20}
                    color={theme.primary}
                  />
                </Pressable>
              </View>

              <Spacer height={Spacing.lg} />

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={styles.statCircle}>
                    <ThemedText
                      type="h3"
                      style={{
                        color: getAdherenceColor(
                          adherenceStats.weeklyAdherence,
                        ),
                      }}
                    >
                      {Math.round(adherenceStats.weeklyAdherence)}%
                    </ThemedText>
                  </View>
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textSecondary }}
                  >
                    This Week
                  </ThemedText>
                  <ThemedText
                    type="caption"
                    style={{
                      color: getAdherenceColor(adherenceStats.weeklyAdherence),
                    }}
                  >
                    {getAdherenceLabel(adherenceStats.weeklyAdherence)}
                  </ThemedText>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <View
                    style={[
                      styles.streakBadge,
                      { backgroundColor: theme.primary + "20" },
                    ]}
                  >
                    <Feather name="zap" size={16} color={theme.primary} />
                    <ThemedText type="h4" style={{ marginLeft: Spacing.xs }}>
                      {adherenceStats.currentStreak}
                    </ThemedText>
                  </View>
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textSecondary }}
                  >
                    Day Streak
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.primary }}>
                    Best: {adherenceStats.longestStreak} days
                  </ThemedText>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <ThemedText type="h3" style={{ color: theme.success }}>
                    {adherenceStats.totalDosesTaken}
                  </ThemedText>
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textSecondary }}
                  >
                    Doses Taken
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.error }}>
                    {adherenceStats.totalDosesMissed} missed
                  </ThemedText>
                </View>
              </View>
            </Card>
            <Spacer height={Spacing.lg} />
          </>
        )}

        {showCalendar && reminders.length > 0 ? (
          <>
            <Card style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <Pressable
                  onPress={() => navigateMonth(-1)}
                  style={styles.calendarNavButton}
                >
                  <Feather name="chevron-left" size={24} color={theme.text} />
                </Pressable>
                <ThemedText type="h4">
                  {calendarMonth.toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </ThemedText>
                <Pressable
                  onPress={() => navigateMonth(1)}
                  style={styles.calendarNavButton}
                >
                  <Feather name="chevron-right" size={24} color={theme.text} />
                </Pressable>
              </View>

              <Spacer height={Spacing.md} />

              <View style={styles.calendarDaysHeader}>
                {DAYS_OF_WEEK.map((day) => (
                  <View key={day} style={styles.calendarDayHeader}>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.textSecondary }}
                    >
                      {day}
                    </ThemedText>
                  </View>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return (
                      <View key={`empty-${index}`} style={styles.calendarDay} />
                    );
                  }

                  const dateStr = date.toISOString().split("T")[0];
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDateStr;
                  const adherence = getAdherenceForDate(date);
                  const isFuture = date > new Date();

                  return (
                    <Pressable
                      key={dateStr}
                      onPress={() => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                      style={[
                        styles.calendarDay,
                        isToday && {
                          borderWidth: 2,
                          borderColor: theme.primary,
                        },
                        isSelected && { backgroundColor: theme.primary },
                      ]}
                    >
                      <ThemedText
                        type="body"
                        style={[
                          {
                            color: isFuture ? theme.textSecondary : theme.text,
                          },
                          isSelected && { color: "#FFFFFF" },
                        ]}
                      >
                        {date.getDate()}
                      </ThemedText>
                      {adherence !== null && !isFuture ? (
                        <View
                          style={[
                            styles.calendarAdherenceDot,
                            {
                              backgroundColor:
                                adherence >= 1
                                  ? theme.success
                                  : adherence > 0
                                    ? theme.accent
                                    : theme.error,
                            },
                          ]}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              <Spacer height={Spacing.md} />

              <View style={styles.calendarLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: theme.success },
                    ]}
                  />
                  <ThemedText type="caption">All taken</ThemedText>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: theme.accent },
                    ]}
                  />
                  <ThemedText type="caption">Partial</ThemedText>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: theme.error }]}
                  />
                  <ThemedText type="caption">Missed</ThemedText>
                </View>
              </View>
            </Card>
            <Spacer height={Spacing.lg} />
          </>
        ) : (
          <>
            <View style={styles.weekContainer}>
              {currentWeekDates.map((date, index) => {
                const dateStr = date.toISOString().split("T")[0];
                const isSelected = dateStr === selectedDateStr;
                const adherence = getAdherenceForDate(date);

                return (
                  <Pressable
                    key={index}
                    onPress={() => setSelectedDate(date)}
                    style={[
                      styles.dayItem,
                      isSelected && { backgroundColor: theme.primary },
                    ]}
                  >
                    <ThemedText
                      type="caption"
                      style={[
                        styles.dayLabel,
                        { color: isSelected ? "#FFFFFF" : theme.textSecondary },
                      ]}
                    >
                      {DAYS_OF_WEEK[date.getDay()]}
                    </ThemedText>
                    <ThemedText
                      type="h4"
                      style={[
                        styles.dayNumber,
                        { color: isSelected ? "#FFFFFF" : theme.text },
                      ]}
                    >
                      {date.getDate()}
                    </ThemedText>
                    {adherence !== null ? (
                      <View
                        style={[
                          styles.adherenceDot,
                          {
                            backgroundColor:
                              adherence >= 1
                                ? theme.success
                                : adherence > 0
                                  ? theme.accent
                                  : theme.error,
                          },
                        ]}
                      />
                    ) : (
                      <View style={styles.adherenceDot} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Spacer height={Spacing.xl} />
          </>
        )}

        <View style={styles.summaryRow}>
          <ThemedText type="h3">
            {selectedDateStr === today
              ? "Today's Medications"
              : selectedDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {takenToday.length}/{todayReminders.length} {t.reminders.taken.toLowerCase()}
          </ThemedText>
        </View>

        <Spacer height={Spacing.lg} />

        {reminders.length === 0 ? (
          <EmptyState
            icon="bell"
            title={t.reminders.noRemindersYet}
            description={t.reminders.addReminderDescription}
            actionLabel={t.reminders.addReminder}
            onAction={() => setIsModalVisible(true)}
          />
        ) : (
          <View style={styles.remindersList}>
            {todayReminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderItem}>
                <ReminderCard
                  reminder={reminder}
                  onToggle={handleToggle}
                  onPress={() => {}}
                  isTaken={reminder.takenDates.includes(selectedDateStr)}
                />
                <Pressable
                  onPress={() => handleDeleteReminder(reminder.id)}
                  style={[
                    styles.deleteButton,
                    { backgroundColor: theme.error + "20" },
                  ]}
                >
                  <Feather name="trash-2" size={16} color={theme.error} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Spacer height={Spacing["3xl"]} />
      </ScreenScrollView>

      <Pressable
        onPress={() => setIsModalVisible(true)}
        style={[styles.fab, { backgroundColor: theme.primary }, Shadows.large]}
        accessibilityLabel="Add medication reminder"
        accessibilityRole="button"
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">{t.reminders.addReminder}</ThemedText>
              <Pressable onPress={() => setIsModalVisible(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <Spacer height={Spacing.xl} />

            <ThemedText type="label">{t.reminders.medicationName}</ThemedText>
            <Spacer height={Spacing.sm} />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              placeholder="e.g., Acetaminophen"
              placeholderTextColor={theme.textSecondary}
              value={newReminder.medicationName}
              onChangeText={(text) =>
                setNewReminder({ ...newReminder, medicationName: text })
              }
            />

            <Spacer height={Spacing.lg} />

            <ThemedText type="label">{t.reminders.dosage}</ThemedText>
            <Spacer height={Spacing.sm} />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              placeholder="e.g., 500mg"
              placeholderTextColor={theme.textSecondary}
              value={newReminder.dosage}
              onChangeText={(text) =>
                setNewReminder({ ...newReminder, dosage: text })
              }
            />

            <Spacer height={Spacing.lg} />

            <ThemedText type="label">{t.reminders.time}</ThemedText>
            <Spacer height={Spacing.sm} />
            <View style={styles.timePickerRow}>
              {["06:00", "08:00", "12:00", "14:00", "18:00", "21:00"].map((time) => (
                <Pressable
                  key={time}
                  onPress={() => setNewReminder({ ...newReminder, time })}
                  style={[
                    styles.timeChip,
                    {
                      backgroundColor:
                        newReminder.time === time
                          ? theme.primary
                          : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <ThemedText
                    type="label"
                    style={{
                      color: newReminder.time === time ? "#FFFFFF" : theme.text,
                    }}
                  >
                    {time}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <Spacer height={Spacing.md} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {t.reminders.enterCustomTime}
            </ThemedText>
            <Spacer height={Spacing.sm} />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              placeholder="HH:MM (e.g., 09:30)"
              placeholderTextColor={theme.textSecondary}
              value={newReminder.time}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9:]/g, "");
                if (cleaned.length <= 5) {
                  if (cleaned.length === 2 && !cleaned.includes(":")) {
                    setNewReminder({ ...newReminder, time: cleaned + ":" });
                  } else {
                    setNewReminder({ ...newReminder, time: cleaned });
                  }
                }
              }}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            <Spacer height={Spacing["2xl"]} />

            <Button
              onPress={handleAddReminder}
              disabled={!newReminder.medicationName.trim()}
            >
              {t.reminders.addReminder}
            </Button>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  notificationBanner: {
    borderWidth: 1,
    borderStyle: "dashed",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  statsCard: {
    padding: Spacing.lg,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statCircle: {
    marginBottom: Spacing.xs,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: "rgba(128, 128, 128, 0.2)",
  },
  calendarCard: {
    padding: Spacing.lg,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calendarNavButton: {
    padding: Spacing.sm,
  },
  calendarDaysHeader: {
    flexDirection: "row",
  },
  calendarDayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
  },
  calendarAdherenceDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  calendarLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayItem: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    minWidth: 44,
  },
  dayLabel: {
    marginBottom: Spacing.xs,
  },
  dayNumber: {},
  adherenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: Spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remindersList: {
    gap: Spacing.md,
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing["4xl"],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  timePickerRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  timeChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
