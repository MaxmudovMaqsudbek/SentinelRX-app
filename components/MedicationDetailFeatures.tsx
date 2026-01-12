import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ProgressBar } from "@/components/ProgressBar";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { GamificationData, UserProfile } from "@/utils/storage";
import { DrugInfo } from "@/utils/drugDatabase";

// --- 1. Adherence Streak Card ---
interface AdherenceStreakCardProps {
  gamification: GamificationData | null;
  medicationName: string;
}

export function AdherenceStreakCard({ gamification, medicationName }: AdherenceStreakCardProps) {
  const { theme } = useTheme();

  // Pseudo-logic: In a real app, we'd track per-medication adherence. 
  // Here we project the global streak onto the medication to show "Contribution".
  const streak = gamification?.streak || 0;
  const xpContribution = 50; // Static gamification rule

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }, Shadows.small]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: theme.primary + "20" }]}>
          <Feather name="activity" size={20} color={theme.primary} />
        </View>
        <View style={styles.titleColumn}>
          <ThemedText type="h4">Streak Contribution</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
             Keeps your {streak}-day streak alive
          </ThemedText>
        </View>
        <View style={styles.badge}>
            <Feather name="zap" size={14} color="#FFF" />
            <ThemedText type="small" style={styles.badgeText}>+{xpContribution} XP</ThemedText>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
         <View style={styles.progressRow}>
             <ThemedText type="label">Level {gamification?.level || 1} Progress</ThemedText>
             <ThemedText type="small" style={{color: theme.primary}}>{(gamification?.points || 0) % 100}%</ThemedText>
         </View>
         <ProgressBar progress={((gamification?.points || 0) % 100) / 100} color={theme.primary} height={8} />
         <ThemedText type="caption" style={[styles.hintText, { color: theme.textSecondary }]}>
            Taking {medicationName} today adds directly to your global health score.
         </ThemedText>
      </View>
    </View>
  );
}

// --- 2. Condition Context Badge ---
export function ConditionContextBadge({ drug, profile }: { drug: DrugInfo; profile: UserProfile | null }) {
    const { theme } = useTheme();

    if (!profile?.chronicConditions || profile.chronicConditions.length === 0) return null;

    // Simple keyword matching logic
    const matchedCondition = profile.chronicConditions.find(condition => 
        (drug.description || "").toLowerCase().includes(condition.toLowerCase()) ||
        (drug.name || "").toLowerCase().includes(condition.toLowerCase()) || 
        // Fallback for demo purposes if no direct match, assuming widespread common meds
        ["hypertension", "diabetes", "pain"].some(c => condition.toLowerCase().includes(c))
    );

    if (!matchedCondition) return null;

    return (
        <View style={[styles.contextContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="check-circle" size={18} color={theme.success} />
             <ThemedText type="small" style={[styles.contextText, { color: theme.text }]}>
                Fighting your <ThemedText type="body" style={{color: theme.success, fontWeight: '600'}}>{matchedCondition}</ThemedText>
             </ThemedText>
        </View>
    );
}

// --- 3. Smart Refill Gauge ---
interface SmartRefillGaugeProps {
    quantity?: number; // Estimated remaining pills
    totalQuantity?: number;
    onFindPharmacy: () => void;
}

export function SmartRefillGauge({ quantity = 7, totalQuantity = 30, onFindPharmacy }: SmartRefillGaugeProps) {
    const { theme } = useTheme();
    
    // Simulate % calculation
    const percentage = Math.min(100, Math.max(0, (quantity / totalQuantity) * 100));
    const isLow = percentage < 25;
    const color = isLow ? theme.error : theme.success;

    return (
        <View style={[styles.card, { backgroundColor: theme.cardBackground }, Shadows.small]}>
            <View style={styles.headerRow}>
                 <ThemedText type="h4">Smart Inventory</ThemedText>
                 {isLow && (
                     <View style={[styles.alertBadge, { backgroundColor: theme.error + "20" }]}>
                         <ThemedText type="small" style={{ color: theme.error }}>Low Supply</ThemedText>
                     </View>
                 )}
            </View>

            <View style={styles.gaugeRow}>
                {/* Circular Gauge Simulation using Borders */}
                <View style={[styles.circularGauge, { borderColor: theme.border, borderTopColor: color }]}>
                     <ThemedText type="h2" style={{ color: color }}>{quantity}</ThemedText>
                     <ThemedText type="caption" style={{ color: theme.textSecondary }}>Days Left</ThemedText>
                </View>

                <View style={styles.infoColumn}>
                    <ThemedText type="body">
                        Refill recommended <ThemedText type="body" style={{color: theme.error, fontWeight: '600'}}>by Tuesday</ThemedText>.
                    </ThemedText>
                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                        onPress={onFindPharmacy}
                    >
                        <Feather name="map-pin" size={16} color="#FFF" />
                        <ThemedText type="label" style={{ color: "#FFF" }}>Find Pharmacy</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
            
            <View style={[styles.predictionBox, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="trending-up" size={14} color={theme.textSecondary} />
                <ThemedText type="caption" style={{ color: theme.textSecondary, flex: 1 }}>
                     Estimated Price: <ThemedText type="body" style={{fontWeight: '600'}}>$12.50</ThemedText> at CVS
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  titleColumn: {
    flex: 1,
  },
  badge: {
    backgroundColor: "#F59E0B", // Gold/Amber for XP
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  progressContainer: {
     marginTop: Spacing.xs,
  },
  progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.xs
  },
  hintText: {
      marginTop: Spacing.sm,
      fontStyle: 'italic',
  },
  contextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.md, // Spacing above the title usually
      gap: Spacing.sm
  },
  contextText: {
      flex: 1,
  },
  alertBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
  },
  gaugeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.lg,
  },
  circularGauge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 6,
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{rotate: '-45deg'}] // Aesthetic rotation for the border/arc effect
  },
  infoColumn: {
      flex: 1,
      gap: Spacing.sm,
  },
  actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
      gap: Spacing.sm,
  },
  predictionBox: {
      marginTop: Spacing.md,
      padding: Spacing.sm,
      borderRadius: BorderRadius.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm
  }
});
