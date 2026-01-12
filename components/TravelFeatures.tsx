import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

// --- 1. Customs Certificate Generator ---
interface CustomsCertificateProps {
  userName: string;
  passportNumber?: string;
  medicationCount: number;
  destination: string;
}

export function CustomsCertificateCard({ userName, medicationCount, destination }: CustomsCertificateProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.certContainer, Shadows.medium]}>
        <LinearGradient
            colors={['#1E293B', '#334155']} 
            style={styles.certGradient}
        >
            <View style={styles.certHeader}>
                <Feather name="shield" size={24} color="#FFF" />
                <ThemedText type="h4" style={{color: '#FFF', marginLeft: 8}}>Medical Clearance</ThemedText>
            </View>
            
            <View style={styles.certBody}>
                <View style={styles.certRow}>
                    <ThemedText type="caption" style={{color: '#94A3B8'}}>TRAVELER</ThemedText>
                    <ThemedText type="body" style={{color: '#FFF', fontWeight: '600', flex: 1, textAlign: 'right'}} numberOfLines={1}>{userName}</ThemedText>
                </View>
                <View style={styles.certRow}>
                    <ThemedText type="caption" style={{color: '#94A3B8'}}>DESTINATION</ThemedText>
                    <ThemedText type="body" style={{color: '#FFF', fontWeight: '600', flex: 1, textAlign: 'right'}} numberOfLines={1}>{destination}</ThemedText>
                </View>
                <View style={styles.certRow}>
                    <ThemedText type="caption" style={{color: '#94A3B8'}}>DECLARED ITEMS</ThemedText>
                    <ThemedText type="body" style={{color: '#FFF', fontWeight: '600', flex: 1, textAlign: 'right'}} numberOfLines={1}>{medicationCount} Medications</ThemedText>
                </View>
            </View>

            <View style={styles.certFooter}>
                <ThemedText type="small" style={{color: '#22C55E'}}>● APPROVED FOR TRAVEL</ThemedText>
                <Feather name="maximize" size={32} color="#FFF" />
            </View>
        </LinearGradient>
    </View>
  );
}

// --- 2. Pharmacist Translator Card ---
interface PharmacistCardProps {
    language: string; // 'uz' | 'ru'
    onToggleLanguage: () => void;
}

export function PharmacistCard({ language, onToggleLanguage }: PharmacistCardProps) {
    const { theme } = useTheme();
    const isUzbek = language === 'uz';

    return (
        <View style={[styles.pharmCard, {backgroundColor: theme.cardBackground}, Shadows.medium]}>
            <View style={styles.pharmHeader}>
                <View style={styles.pharmIcon}>
                    <Feather name="message-circle" size={24} color="#FFF" />
                </View>
                <View style={{flex: 1}}>
                    <ThemedText type="h4">Pharmacist Helper</ThemedText>
                    <ThemedText type="caption" style={{color: theme.textSecondary}}>Show this screen at the pharmacy</ThemedText>
                </View>
            </View>
            
            <View style={[styles.pharmBubble, {backgroundColor: theme.primary + '10'}]}>
                <ThemedText type="h3" style={{color: theme.primary, textAlign: 'center', marginBottom: 8}}>
                    {isUzbek ? "Iltimos, menga yordam bering." : "Пожалуйста, помогите мне."}
                </ThemedText>
                <ThemedText type="body" style={{textAlign: 'center', color: theme.text}}>
                    {isUzbek ? "Menga shifokor retsepti bo'yicha dori kerak." : "Мне нужно лекарство по рецепту."}
                </ThemedText>
            </View>

            <TouchableOpacity onPress={onToggleLanguage} style={[styles.langToggle, {borderColor: theme.border}]}>
                <ThemedText type="small" style={{color: theme.primary}}>
                    Switch to {isUzbek ? "Russian" : "Uzbek"}
                </ThemedText>
                <Feather name="refresh-cw" size={14} color={theme.primary} />
            </TouchableOpacity>
        </View>
    );
}

// --- 3. Emergency Contact Row ---
interface EmergencyRowProps {
    number: string;
    label: string;
    icon: keyof typeof Feather.glyphMap;
    onCall: () => void;
}

export function EmergencyRow({ number, label, icon, onCall }: EmergencyRowProps) {
    const { theme } = useTheme();

    return (
        <TouchableOpacity onPress={onCall} style={[styles.emerRow, {backgroundColor: theme.cardBackground}, Shadows.small]}>
            <View style={[styles.emerIcon, {backgroundColor: '#EF4444'}]}>
                <Feather name={icon} size={20} color="#FFF" />
            </View>
            <View style={{flex: 1}}>
                <ThemedText type="h4">{number}</ThemedText>
                <ThemedText type="caption" style={{color: theme.textSecondary}}>{label}</ThemedText>
            </View>
            <View style={[styles.callBtn, {backgroundColor: theme.success}]}>
                 <Feather name="phone-call" size={18} color="#FFF" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  // Certificate
  certContainer: {
     borderRadius: BorderRadius.lg,
     overflow: 'hidden',
  },
  certGradient: {
      padding: Spacing.lg
  },
  certHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
      paddingBottom: Spacing.sm
  },
  certBody: {
      gap: Spacing.md,
      marginBottom: Spacing.lg
  },
  certRow: {
      flexDirection: 'row',
      justifyContent: 'space-between'
  },
  certFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.sm
  },

  // Pharmacist
  pharmCard: {
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg
  },
  pharmHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginBottom: Spacing.lg
  },
  pharmIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#3B82F6',
      alignItems: 'center',
      justifyContent: 'center'
  },
  pharmBubble: {
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      borderBottomLeftRadius: 4,
      marginBottom: Spacing.md
  },
  langToggle: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.sm,
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      gap: 8
  },

  // Emergency
  emerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      gap: Spacing.md,
      marginBottom: Spacing.sm
  },
  emerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center'
  },
  callBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center'
  }
});
