import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Share,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { AuthGuard } from "@/components/AuthGuard";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import {
  getFamilyMembers,
  saveFamilyMember,
  generateInviteCode,
  generateId,
  FamilyMember,
  getReminders,
} from "@/utils/storage";
import { calculateAdherenceStats, AdherenceStats } from "@/utils/notifications";
import { syncFamilyMemberToCloud } from "@/utils/syncEngine";

type FamilyPanelScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "FamilyPanel">;
};

export default function FamilyPanelScreen({
  navigation,
}: FamilyPanelScreenProps) {
  const { theme } = useTheme();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [adherenceStats, setAdherenceStats] = useState<AdherenceStats | null>(
    null,
  );
  const [medicationCount, setMedicationCount] = useState(0);
  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "",
  });

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const [members, reminders] = await Promise.all([
          getFamilyMembers(),
          getReminders(),
        ]);
        setFamilyMembers(members);
        setInviteCode(generateInviteCode());
        setMedicationCount(reminders.filter((r) => r.isEnabled).length);
        setAdherenceStats(calculateAdherenceStats(reminders));
      };
      loadData();
    }, []),
  );

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join my family group on SentinelRX to monitor medication adherence. Use code: ${inviteCode}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name.trim()) return;

    const member: FamilyMember = {
      id: generateId(),
      name: newMember.name.trim(),
      relationship: newMember.relationship.trim() || "Family",
      inviteCode: generateInviteCode(),
      isConnected: false,
      adherencePercentage: 0,
    };

    await saveFamilyMember(member);
    // 🔄 Sync to cloud
    await syncFamilyMemberToCloud(member);
    const members = await getFamilyMembers();
    setFamilyMembers(members);

    setNewMember({ name: "", relationship: "" });
    setIsModalVisible(false);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleJoinFamily = async () => {
    if (!joinCode.trim()) return;

    const member: FamilyMember = {
      id: generateId(),
      name: "Connected Member",
      relationship: "Caregiver",
      inviteCode: joinCode.trim(),
      isConnected: true,
      adherencePercentage: Math.floor(Math.random() * 40) + 60,
    };

    await saveFamilyMember(member);
    // 🔄 Sync to cloud
    await syncFamilyMemberToCloud(member);
    const members = await getFamilyMembers();
    setFamilyMembers(members);

    setJoinCode("");
    setIsJoinModalVisible(false);
  };

  return (
    <AuthGuard featureName="Family Panel">
    <>
      <ScreenScrollView>
        <View
          style={[
            styles.inviteCard,
            { backgroundColor: theme.cardBackground },
            Shadows.medium,
          ]}
        >
          <ThemedText type="h4">Your Invite Code</ThemedText>
          <Spacer height={Spacing.sm} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Share this code with family members to let them monitor your
            medication adherence
          </ThemedText>
          <Spacer height={Spacing.lg} />

          <View
            style={[
              styles.codeContainer,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <ThemedText type="h2" style={styles.codeText}>
              {inviteCode}
            </ThemedText>
          </View>

          <Spacer height={Spacing.lg} />

          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleCopyCode}
              style={[
                styles.actionButton,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="copy" size={20} color={theme.primary} />
              <ThemedText
                type="label"
                style={[styles.actionText, { color: theme.primary }]}
              >
                Copy
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={handleShareCode}
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
            >
              <Feather name="share-2" size={20} color="#FFFFFF" />
              <ThemedText
                type="label"
                style={[styles.actionText, { color: "#FFFFFF" }]}
              >
                Share
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <Spacer height={Spacing.xl} />

        <View
          style={[
            styles.yourAdherenceCard,
            { backgroundColor: theme.cardBackground },
            Shadows.small,
          ]}
        >
          <View style={styles.adherenceCardHeader}>
            <View style={styles.adherenceCardTitle}>
              <Feather name="activity" size={20} color={theme.primary} />
              <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>
                Your Adherence Summary
              </ThemedText>
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <View style={styles.adherenceStatsGrid}>
            <View style={styles.adherenceStatBox}>
              <ThemedText type="h2" style={{ color: theme.primary }}>
                {Math.round(adherenceStats?.weeklyAdherence || 0)}%
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                This Week
              </ThemedText>
            </View>
            <View style={styles.adherenceStatBox}>
              <ThemedText type="h2" style={{ color: theme.primary }}>
                {Math.round(adherenceStats?.monthlyAdherence || 0)}%
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                This Month
              </ThemedText>
            </View>
            <View style={styles.adherenceStatBox}>
              <ThemedText type="h2" style={{ color: theme.accent }}>
                {adherenceStats?.longestStreak || 0}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Best Streak
              </ThemedText>
            </View>
          </View>
        </View>

        <Spacer height={Spacing.xl} />

        <View style={styles.sectionHeader}>
          <ThemedText type="h3">Family Members</ThemedText>
          <Pressable
            onPress={() => setIsJoinModalVisible(true)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <ThemedText type="link">Join Family</ThemedText>
          </Pressable>
        </View>
        <Spacer height={Spacing.md} />

        {familyMembers.length === 0 ? (
          <EmptyState
            icon="users"
            title="No Family Members"
            description="Add family members to let them monitor your medication adherence"
            actionLabel="Add Member"
            onAction={() => setIsModalVisible(true)}
          />
        ) : (
          <View style={styles.membersList}>
            {familyMembers.map((member) => (
              <View
                key={member.id}
                style={[
                  styles.memberCard,
                  { backgroundColor: theme.cardBackground },
                  Shadows.small,
                ]}
              >
                <View style={styles.memberHeader}>
                  <View
                    style={[
                      styles.memberAvatar,
                      {
                        backgroundColor: member.isConnected
                          ? theme.success
                          : theme.secondary,
                      },
                    ]}
                  >
                    <Feather name="user" size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.memberInfo}>
                    <ThemedText type="h4">{member.name}</ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      {member.relationship}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: member.isConnected
                          ? theme.success + "20"
                          : theme.accent + "20",
                      },
                    ]}
                  >
                    <ThemedText
                      type="caption"
                      style={{
                        color: member.isConnected
                          ? theme.success
                          : theme.accent,
                      }}
                    >
                      {member.isConnected ? "Connected" : "Pending"}
                    </ThemedText>
                  </View>
                </View>

                {member.isConnected ? (
                  <>
                    <Spacer height={Spacing.lg} />
                    <View style={styles.adherenceSection}>
                      <View style={styles.adherenceHeader}>
                        <ThemedText type="label">Adherence Rate</ThemedText>
                        <ThemedText type="h4" style={{ color: theme.primary }}>
                          {member.adherencePercentage}%
                        </ThemedText>
                      </View>
                      <Spacer height={Spacing.sm} />
                      <ProgressBar
                        progress={member.adherencePercentage / 100}
                        color={
                          member.adherencePercentage >= 80
                            ? theme.success
                            : member.adherencePercentage >= 50
                              ? theme.accent
                              : theme.error
                        }
                      />
                    </View>

                    <Spacer height={Spacing.lg} />

                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <ThemedText type="h4">
                          {adherenceStats?.currentStreak || 0}
                        </ThemedText>
                        <ThemedText
                          type="caption"
                          style={{ color: theme.textSecondary }}
                        >
                          Days Streak
                        </ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <ThemedText type="h4">{medicationCount}</ThemedText>
                        <ThemedText
                          type="caption"
                          style={{ color: theme.textSecondary }}
                        >
                          Medications
                        </ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <ThemedText type="h4">
                          {adherenceStats?.totalDosesMissed || 0}
                        </ThemedText>
                        <ThemedText
                          type="caption"
                          style={{ color: theme.textSecondary }}
                        >
                          Missed This Week
                        </ThemedText>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <Spacer height={Spacing.md} />
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      Invite code: {member.inviteCode}
                    </ThemedText>
                  </>
                )}
              </View>
            ))}
          </View>
        )}

        <Spacer height={Spacing["2xl"]} />

        <Button onPress={() => setIsModalVisible(true)}>
          Add Family Member
        </Button>

        <Spacer height={Spacing["3xl"]} />
      </ScreenScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Add Family Member</ThemedText>
              <Pressable onPress={() => setIsModalVisible(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <Spacer height={Spacing.xl} />

            <ThemedText type="label">Name</ThemedText>
            <Spacer height={Spacing.sm} />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              placeholder="Enter name"
              placeholderTextColor={theme.textSecondary}
              value={newMember.name}
              onChangeText={(text) =>
                setNewMember({ ...newMember, name: text })
              }
            />

            <Spacer height={Spacing.lg} />

            <ThemedText type="label">Relationship</ThemedText>
            <Spacer height={Spacing.sm} />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              placeholder="e.g., Parent, Child, Caregiver"
              placeholderTextColor={theme.textSecondary}
              value={newMember.relationship}
              onChangeText={(text) =>
                setNewMember({ ...newMember, relationship: text })
              }
            />

            <Spacer height={Spacing["2xl"]} />

            <Button onPress={handleAddMember}>Add Member</Button>
          </ThemedView>
        </View>
      </Modal>

      <Modal
        visible={isJoinModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsJoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Join Family</ThemedText>
              <Pressable onPress={() => setIsJoinModalVisible(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <Spacer height={Spacing.xl} />

            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Enter the invite code shared by a family member to connect
            </ThemedText>

            <Spacer height={Spacing.lg} />

            <TextInput
              style={[
                styles.input,
                styles.codeInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              placeholder="Enter code"
              placeholderTextColor={theme.textSecondary}
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="characters"
              maxLength={6}
            />

            <Spacer height={Spacing["2xl"]} />

            <Button onPress={handleJoinFamily}>Join</Button>
          </ThemedView>
        </View>
      </Modal>
    </>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  inviteCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  codeContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  codeText: {
    letterSpacing: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  actionText: {
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  membersList: {
    gap: Spacing.md,
  },
  memberCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  adherenceSection: {},
  adherenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
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
  codeInput: {
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 4,
    fontWeight: "600",
  },
  yourAdherenceCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  adherenceCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adherenceCardTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  adherenceStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  adherenceStatBox: {
    alignItems: "center",
  },
});
