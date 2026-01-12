import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from './ThemedText';
import { Shadows, BorderRadius, Spacing } from '@/constants/theme';

// --- Clinical Source Badge ---

interface ClinicalBadgeProps {
  source: 'FDA' | 'PubMed' | 'EMA' | 'Mayo' | 'AI';
  confidence?: number;
}

export function ClinicalBadge({ source, confidence }: ClinicalBadgeProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.badgeContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
      <MaterialIcons name="verified" size={12} color={theme.primary} />
      <ThemedText type="small" style={{ fontSize: 10, fontWeight: '600', color: theme.textSecondary, marginLeft: 4 }}>
        {source} {confidence ? `${Math.round(confidence * 100)}%` : ''}
      </ThemedText>
    </View>
  );
}

// --- One-Tap Resolution / Recommendation Card ---

interface RecommendationCardProps {
  originalDrug: string;
  suggestedDrug: string;
  reason: string;
  price?: number; // Estimated price
  onSwitch: () => void;
}

export function RecommendationCard({ originalDrug, suggestedDrug, reason, price, onSwitch }: RecommendationCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.recCard, { backgroundColor: theme.cardBackground, borderLeftColor: theme.success }, Shadows.small]}>
      <View style={styles.recHeader}>
        <View style={styles.iconCircle}>
           <Feather name="shield" size={18} color={theme.success} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
           <ThemedText type="label" style={{ color: theme.success }}>Safer Alternative Found</ThemedText>
           <ThemedText type="small" style={{ color: theme.textSecondary }}>Switch {originalDrug} → {suggestedDrug}</ThemedText>
        </View>
      </View>

      <ThemedText type="body" style={{ marginTop: 8, marginBottom: 12, fontSize: 13 }}>
        {reason}
      </ThemedText>

      <Pressable 
        onPress={onSwitch}
        style={({pressed}) => [
            styles.switchButton, 
            { backgroundColor: theme.success, opacity: pressed ? 0.8 : 1 }
        ]}
      >
        <ThemedText type="small" style={{ color: '#fff', fontWeight: 'bold' }}>
           Switch to {suggestedDrug} {price ? `• $${price}` : ''}
        </ThemedText>
        <Feather name="arrow-right" size={14} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  recCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    marginBottom: Spacing.md,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9', // Light green
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
  }
});
