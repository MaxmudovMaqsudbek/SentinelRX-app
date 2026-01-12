import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows, MedicalColors } from "@/constants/theme";

// --- Safety Hero Component ---
interface SafetyHeroProps {
  status: "safe" | "caution" | "danger";
  drugName: string;
  alertsCount: number;
}

export const SafetyHero = ({ status, drugName, alertsCount }: SafetyHeroProps) => {
  const { theme } = useTheme();

  let colors = ["#4ADE80", "#22C55E"]; // Default Green
  let iconName: any = "shield-check";
  let title = "SAFE FOR YOU";
  let subtitle = "No known interactions found";

  if (status === "danger") {
    colors = ["#EF4444", "#DC2626"];
    iconName = "shield-alert";
    title = "STOP - RISK DETECTED";
    subtitle = `${alertsCount} critical interaction(s) found`;
  } else if (status === "caution") {
    colors = ["#F59E0B", "#D97706"];
    iconName = "shield-alert-outline";
    title = "USE WITH CAUTION";
    subtitle = `${alertsCount} potential issue(s) detected`;
  }

  return (
    <LinearGradient
      colors={colors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroContainer, Shadows.medium]}
    >
      <View style={styles.heroContent}>
        <MaterialCommunityIcons name={iconName} size={48} color="#FFFFFF" />
        <View style={styles.heroText}>
          <ThemedText type="h2" style={{ color: "#FFFFFF", marginBottom: 4 }}>
            {title}
          </ThemedText>
          <ThemedText type="body" style={{ color: "rgba(255,255,255,0.9)" }}>
            {subtitle}
          </ThemedText>
        </View>
      </View>
      <View style={styles.heroDrugBadge}>
         <ThemedText type="small" style={{color: colors[1], fontWeight: 'bold'}}>{drugName.toUpperCase()}</ThemedText>
      </View>
    </LinearGradient>
  );
};

// --- Authenticity Seal Component ---
interface AuthenticitySealProps {
  batchNumber?: string;
  expirationDate?: string;
}

export const AuthenticitySeal = ({ batchNumber, expirationDate }: AuthenticitySealProps) => {
  const { theme } = useTheme();

  if (!batchNumber) return null;

  return (
    <View style={[styles.sealContainer, { backgroundColor: theme.cardBackground }, Shadows.small]}>
      <LinearGradient
        colors={["#3B82F6", "#2563EB"]}
        style={styles.sealIcon}
      >
        <Feather name="check" size={20} color="#FFFFFF" />
      </LinearGradient>
      
      <View style={styles.sealContent}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
             <ThemedText type="body" style={{ fontWeight: "700", color: theme.text }}>
                Verified Authentic
             </ThemedText>
             <MaterialCommunityIcons name="sticker-check-outline" size={16} color="#3B82F6" />
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Batch #{batchNumber} • Exp {expirationDate || 'N/A'}
        </ThemedText>
      </View>
      
      <View style={styles.holoBadge}>
           <ThemedText type="small" style={{fontSize: 8, color: theme.accent}}>ORIGINAL</ThemedText>
      </View>
    </View>
  );
};

// --- Fair Price Component ---
interface PriceBenchmarkProps {
  drugName: string;
  onCheckPrices: () => void;
}

export const PriceBenchmark = ({ drugName, onCheckPrices }: PriceBenchmarkProps) => {
  const { theme } = useTheme();
  
  // Mock logic for demo - in real app, fetch from API
  const fairPrice = 14.50;
  const userPrice = 22.00;
  const savings = userPrice - fairPrice;

  return (
    <View style={[styles.priceContainer, { backgroundColor: theme.cardBackground }, Shadows.small]}>
      <View style={styles.priceHeader}>
        <Feather name="dollar-sign" size={20} color={theme.success} />
        <ThemedText type="h4" style={{ marginLeft: 8 }}>Price Analysis</ThemedText>
      </View>
      
      <View style={styles.priceRow}>
        <View>
             <ThemedText type="caption" style={{color: theme.textSecondary}}>Fair Market Price</ThemedText>
             <ThemedText type="h3" style={{color: theme.success}}>${fairPrice.toFixed(2)}</ThemedText>
        </View>
        <View style={styles.priceDivider} />
        <View>
             <ThemedText type="caption" style={{color: theme.textSecondary}}>You Likely Paid</ThemedText>
             <ThemedText type="h3" style={{color: theme.text}}>${userPrice.toFixed(2)}</ThemedText>
        </View>
      </View>

      <View style={[styles.savingsBadge, {backgroundColor: theme.success + '20'}]}>
          <ThemedText type="small" style={{color: theme.success, fontWeight: 'bold'}}>
              Potential Savings: ${savings.toFixed(2)}
          </ThemedText>
      </View>

      <Button 
        onPress={onCheckPrices}
        style={{marginTop: Spacing.sm, height: 40}}
        variant="outline"
      >
        Find Cheaper Near Me
      </Button>
    </View>
  );
};


const styles = StyleSheet.create({
  heroContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  heroText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  heroDrugBadge: {
      position: 'absolute',
      right: -10,
      bottom: -10,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      transform: [{rotate: '-5deg'}],
      opacity: 0.9,
      zIndex: 1,
  },
  sealContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  sealIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  sealContent: {
    flex: 1,
  },
  holoBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
      paddingHorizontal: 4,
      borderRadius: 4,
  },
  priceContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  priceDivider: {
      width: 1,
      height: '80%',
      backgroundColor: 'rgba(0,0,0,0.1)',
      alignSelf: 'center',
  },
  savingsBadge: {
      alignSelf: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: 4,
      borderRadius: BorderRadius.pill,
      marginBottom: Spacing.md,
  }
});
