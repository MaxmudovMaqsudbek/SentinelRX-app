import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { UserProfile, FamilyMember } from "@/utils/storage";

// --- 1. Sentinel Score Gauge ---
interface SentinelScoreGaugeProps {
  score: number; // 0-1000
  trend?: "up" | "down" | "neutral";
}

const COLORS = {
  high: '#10B981', // Emerald 500
  medium: '#F59E0B', // Amber 500
  low: '#EF4444', // Red 500
};

export function SentinelScoreGauge({ score, trend = "up" }: SentinelScoreGaugeProps) {
  const { theme } = useTheme();
  
  // Normalized score for color logic
  const normalized = Math.min(1000, Math.max(0, score));
  const scoreColor = normalized >= 800 ? COLORS.high : normalized >= 600 ? COLORS.medium : COLORS.low;

  return (
    <View style={[styles.scoreContainer, { backgroundColor: theme.cardBackground }, Shadows.medium]}>
       {/* Minimalist Header */}
       <View style={styles.scoreHeader}>
           <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
               <View style={{padding: 6, borderRadius: 8, backgroundColor: theme.backgroundSecondary}}>
                    <Feather name="activity" size={16} color={scoreColor} />
               </View>
               <ThemedText type="h4">Sentinel Score</ThemedText>
           </View>
           <Feather name="info" size={16} color={theme.textSecondary} />
       </View>
       
       <View style={styles.gaugeWrapper}>
           {/* Decorative Ring Background */}
           <View style={[styles.gaugeRing, { borderColor: theme.border }]}>
               {/* Active Ring Segment */}
               <View style={[
                   styles.gaugeFill, 
                   { 
                       borderTopColor: scoreColor, 
                       borderRightColor: normalized > 500 ? scoreColor : 'transparent',
                       transform: [{rotate: '45deg'}] 
                   }
               ]} />
               
               <View style={styles.scoreValueContainer}>
                   <ThemedText type="display" style={{fontSize: 48, lineHeight: 56}}>{normalized}</ThemedText>
                   <ThemedText type="small" style={{color: scoreColor, fontWeight: 'bold'}}>
                       {normalized >= 800 ? 'EXCELLENT' : normalized >= 600 ? 'GOOD' : 'ATTENTION'}
                   </ThemedText>
               </View>
           </View>
       </View>

       <View style={styles.scoreFooter}>
            <View style={[styles.trendBadge, {backgroundColor: theme.backgroundSecondary}]}>
                <Feather name={trend === 'up' ? 'trending-up' : 'trending-down'} size={14} color={scoreColor} />
                <ThemedText type="small" style={{color: theme.textSecondary}}>Top 5% of users</ThemedText>
            </View>
       </View>
    </View>
  );
}

// --- 2. Medical ID Card ---
interface MedicalIDCardProps {
    profile: UserProfile | null;
    onExport: () => void;
}

export function MedicalIDCard({ profile, onExport }: MedicalIDCardProps) {

    return (
        <View style={[styles.idCardContainer, Shadows.medium]}>
            <LinearGradient
                colors={['#2563EB', '#1E40AF']} // Professional Medical Blue (Blue-600 to Blue-800)
                style={styles.idCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.idHeader}>
                    <View style={styles.idLogoRow}>
                         <Feather name="file-text" size={20} color="#FFF" />
                         <ThemedText type="label" style={{color: 'rgba(255,255,255,0.9)', marginLeft: 6}}>SENTINEL MEDICAL ID</ThemedText>
                    </View>
                    <TouchableOpacity onPress={onExport} style={styles.exportBtn}>
                        <Feather name="share" size={14} color="#FFF" />
                        <ThemedText type="small" style={{color: '#FFF'}}>Export PDF</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.idBody}>
                    <View style={styles.idAvatar}>
                         <Feather name="user" size={32} color="#93C5FD" />
                    </View>
                    <View style={styles.idMainInfo}>
                        <ThemedText type="h3" style={{color: '#FFF'}}>{profile?.name || "Guest User"}</ThemedText>
                        <ThemedText type="caption" style={{color: '#DBEAFE'}}>DOB: {profile?.age ? `19${90-profile.age}` : 'Unknown'}</ThemedText>
                    </View>
                </View>
                
                <View style={styles.idGrid}>
                    <View style={styles.idGridItem}>
                        <ThemedText type="small" style={{color: '#93C5FD'}}>BLOOD TYPE</ThemedText>
                        <ThemedText type="label" style={{color: '#FFF'}}>A+</ThemedText>
                    </View>
                    <View style={styles.idGridItem}>
                        <ThemedText type="small" style={{color: '#93C5FD'}}>ALLERGIES</ThemedText>
                        <ThemedText type="label" style={{color: '#FFF'}} numberOfLines={1}>
                            {profile?.allergies?.length ? profile.allergies[0] : "None"}
                        </ThemedText>
                    </View>
                     <View style={styles.idGridItem}>
                        <ThemedText type="small" style={{color: '#93C5FD'}}>CONDITIONS</ThemedText>
                        <ThemedText type="label" style={{color: '#FFF'}} numberOfLines={1}>
                             {profile?.chronicConditions?.length ? profile.chronicConditions[0] : "None"}
                        </ThemedText>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

// --- 3. Care Circle Widget ---
interface CareCircleWidgetProps {
    members: FamilyMember[];
    onAddMember: () => void;
}

export function CareCircleWidget({ members, onAddMember }: CareCircleWidgetProps) {
    const { theme } = useTheme();

    return (
        <View>
            <View style={styles.sectionHeader}>
                <ThemedText type="h3">Care Circle</ThemedText>
                <TouchableOpacity onPress={onAddMember}>
                    <ThemedText type="link">Manage</ThemedText>
                </TouchableOpacity>
            </View>
            <Spacer height={Spacing.md} />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.careScroll}>
                {/* Add Button First */}
                <TouchableOpacity 
                    onPress={onAddMember}
                    style={[styles.careAddCard, {borderColor: theme.border, borderStyle: 'dashed'}]}
                >
                    <Feather name="plus" size={24} color={theme.primary} />
                    <ThemedText type="small" style={{color: theme.primary, marginTop: 4}}>Add</ThemedText>
                </TouchableOpacity>

                {members.map(member => (
                    <View key={member.id} style={[styles.careMemberCard, {backgroundColor: theme.cardBackground}, Shadows.small]}>
                        <View style={[styles.careAvatar, {backgroundColor: member.isConnected ? theme.success : theme.secondary}]}> 
                             <ThemedText type="h4" style={{color: '#FFF'}}>{member.name.charAt(0)}</ThemedText>
                             {member.isConnected && (
                                 <View style={[styles.statusDot, {borderColor: theme.cardBackground}]} />
                             )}
                        </View>
                        <ThemedText type="label" numberOfLines={1} style={styles.careName}>{member.name}</ThemedText>
                        <ThemedText type="caption" style={{color: member.adherencePercentage > 80 ? COLORS.high : (member.adherencePercentage > 50 ? COLORS.medium : COLORS.low), fontWeight: 'bold'}}>
                            {member.adherencePercentage}%
                        </ThemedText>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const Spacer = ({ height }: { height: number }) => <View style={{ height }} />;

const styles = StyleSheet.create({
  // Score Gauge Styles
  scoreContainer: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    overflow: 'hidden'
  },
  scoreGradient: {
    padding: Spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  scoreFooter: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },

  gaugeWrapper: {
      height: 160,
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: Spacing.lg
  },
  gaugeRing: {
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 15,
      borderBottomColor: 'transparent',
      borderLeftColor: 'transparent', // Make it semi-circleish visually or full ring with hacks
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden' // Simplified for React Native non-SVG
  },
  gaugeFill: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 15,
      borderColor: 'transparent',
  },
  scoreValueContainer: {
      alignItems: 'center',
      justifyContent: 'center'
  },
  trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4
  },

  scoreHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: Spacing.lg
  },

  // Medical ID Styles
  idCardContainer: {
      borderRadius: BorderRadius.lg,
      overflow: 'hidden', // Mask the linear gradient
  },
  idCardGradient: {
      padding: Spacing.lg,
  },
  idHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.lg
  },
  idLogoRow: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  exportBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      gap: 4
  },
  idBody: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.xl
  },
  idAvatar: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: '#334155',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md
  },
  idMainInfo: {
      flex: 1
  },
  idGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.1)'
  },
  idGridItem: {
      flex: 1
  },

  // Care Circle Styles
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
  },
  careScroll: {
      paddingVertical: Spacing.sm,
      gap: Spacing.md
  },
  careAddCard: {
      width: 80,
      height: 100,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.sm
  },
  careMemberCard: {
      width: 90,
      height: 100,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.sm
  },
  careAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xs,
      position: 'relative'
  },
  statusDot: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#22C55E',
      borderWidth: 2
  },
  careName: {
      marginBottom: 2
  }
});
