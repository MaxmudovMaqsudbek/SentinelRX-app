import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { GamificationData } from "@/utils/storage";

const SCREEN_WIDTH = Dimensions.get("window").width;

// --- 1. Hero Card (The "Wow" Factor) ---
interface GamificationHeroCardProps {
  data: GamificationData | null;
}

export function GamificationHeroCard({ data }: GamificationHeroCardProps) {
  const { theme } = useTheme();
  const currentPoints = data?.points || 0;
  const currentLevel = data?.level || 1;
  const pointsToNext = 100 - (currentPoints % 100);
  const progress = (currentPoints % 100) / 100;

  // Simple SVG Gauge Calculation
  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={[styles.heroContainer, Shadows.medium]}>
      <LinearGradient
        colors={['#10B981', '#059669', '#047857']} // Emerald Green Gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={styles.heroContent}>
          <View>
            <ThemedText type="label" style={{color: 'rgba(255,255,255,0.8)'}}>CURRENT LEVEL</ThemedText>
            <ThemedText type="display" style={{color: '#FFF', fontSize: 32}}>Level {currentLevel}</ThemedText>
            <View style={styles.heroBadge}>
                <Feather name="shield" size={14} color="#FFF" />
                <ThemedText type="small" style={{color: '#FFF', fontWeight: 'bold'}}>Top 5%</ThemedText>
            </View>
          </View>
          
          <View style={styles.heroGauge}>
             <Svg width={140} height={140} viewBox="0 0 140 140" style={{transform: [{rotate: '-90deg'}]}}>
                {/* Background Track */}
                <Circle 
                    cx="70" cy="70" r={radius} 
                    stroke="rgba(255,255,255,0.2)" 
                    strokeWidth={strokeWidth} 
                    fill="none" 
                />
                {/* Progress Arc */}
                <Circle 
                    cx="70" cy="70" r={radius} 
                    stroke="#FFF" 
                    strokeWidth={strokeWidth} 
                    fill="none" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
             </Svg>
             <View style={styles.heroGaugeValue}>
                 <ThemedText type="h3" style={{color: '#FFF'}}>{currentPoints}</ThemedText>
                 <ThemedText type="small" style={{color: 'rgba(255,255,255,0.8)'}}>PTS</ThemedText>
             </View>
          </View>
        </View>
        
        <View style={styles.heroFooter}>
             <ThemedText type="caption" style={{color: 'rgba(255,255,255,0.9)'}}>
                Next Reward: <ThemedText type="defaultSemiBold" style={{color: '#FFF'}}>Free Consultation</ThemedText> in {pointsToNext} pts
             </ThemedText>
             <Feather name="chevron-right" size={16} color="#FFF" />
        </View>
      </LinearGradient>
    </View>
  );
}


// --- 2. Daily Quests Widget (Engagement) ---
interface Quest {
    id: string;
    title: string;
    points: number;
    icon: keyof typeof Feather.glyphMap;
    completed: boolean;
}

const MOCK_QUESTS: Quest[] = [
    { id: '1', title: 'Morning Scan', points: 10, icon: 'camera', completed: true },
    { id: '2', title: 'Check Interactions', points: 50, icon: 'search', completed: false },
    { id: '3', title: 'Read Health Tip', points: 5, icon: 'book-open', completed: false },
];

export function DailyQuestsWidget() {
    const { theme } = useTheme();

    return (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <ThemedText type="h3">Daily Quests</ThemedText>
                <View style={[styles.timerBadge, {backgroundColor: theme.secondary + '20'}]}>
                    <Feather name="clock" size={12} color={theme.secondary} />
                    <ThemedText type="small" style={{color: theme.secondary}}>12h left</ThemedText>
                </View>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.questScroll}>
                {MOCK_QUESTS.map((quest) => (
                    <TouchableOpacity 
                        key={quest.id}
                        activeOpacity={0.8}
                        style={[
                            styles.questCard, 
                            {backgroundColor: theme.cardBackground}, 
                            quest.completed && {backgroundColor: theme.success + '10', borderColor: theme.success, borderWidth: 1},
                            Shadows.small
                        ]}
                    >
                        <View style={[
                            styles.questIcon, 
                            {backgroundColor: quest.completed ? theme.success : theme.backgroundSecondary}
                        ]}>
                            <Feather 
                                name={quest.completed ? 'check' : quest.icon} 
                                size={20} 
                                color={quest.completed ? '#FFF' : theme.textSecondary} 
                            />
                        </View>
                        <ThemedText type="defaultSemiBold" style={{marginTop: 8}}>{quest.title}</ThemedText>
                        <ThemedText type="caption" style={{color: theme.success, fontWeight: 'bold'}}>+{quest.points} PTS</ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

// --- 3. Marketplace (Business/Monetization) ---
interface MarketplaceProps {
    userPoints: number;
}

type TabType = 'coupons' | 'premium' | 'impact';

export function RewardsMarketplace({ userPoints }: MarketplaceProps) {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('coupons');

    const renderTab = (id: TabType, label: string) => (
        <TouchableOpacity 
            onPress={() => setActiveTab(id)}
            style={[
                styles.tabBtn, 
                activeTab === id && {backgroundColor: theme.primary, borderColor: theme.primary}
            ]}
        >
            <ThemedText 
                type="small" 
                style={{
                    color: activeTab === id ? '#FFF' : theme.textSecondary, 
                    fontWeight: activeTab === id ? 'bold' : 'normal'
                }}
            >
                {label}
            </ThemedText>
        </TouchableOpacity>
    );

    return (
        <View style={styles.sectionContainer}>
             <ThemedText type="h3" style={{marginBottom: Spacing.md}}>Rewards Marketplace</ThemedText>
             
             {/* Tabs */}
             <View style={[styles.tabBar, {backgroundColor: theme.cardBackground}]}>
                 {renderTab('coupons', 'Partner Deals')}
                 {renderTab('premium', 'Premium')}
                 {renderTab('impact', 'Social Impact')}
             </View>

             <View style={{marginTop: Spacing.md}}>
                 {/* Insurance Ad (Always Visible or Top) */}
                 <LinearGradient
                    colors={['#1E1B4B', '#312E81']}
                    start={{x:0, y:0}} end={{x:1, y:1}}
                    style={[styles.insuranceCard, Shadows.medium]}
                 >
                     <View style={{flex: 1}}>
                         <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4}}>
                            <Feather name="shield" size={14} color="#FBBF24" />
                            <ThemedText type="small" style={{color: '#FBBF24', fontWeight: 'bold'}}>PLATINUM PARTNER</ThemedText>
                         </View>
                         <ThemedText type="h4" style={{color: '#FFF'}}>Link Health Insurance</ThemedText>
                         <ThemedText type="caption" style={{color: 'rgba(255,255,255,0.7)', marginTop: 2}}>
                             Lower your premiums by up to 20% with your Sentinel Score.
                         </ThemedText>
                     </View>
                     <TouchableOpacity style={styles.insuranceBtn}>
                         <ThemedText type="small" style={{color: '#1E1B4B', fontWeight: 'bold'}}>Connect</ThemedText>
                     </TouchableOpacity>
                 </LinearGradient>

                 {/* Content Switching */}
                 {activeTab === 'coupons' && (
                     <View style={{gap: Spacing.md}}>
                         <MarketplaceItem 
                            icon="percent" 
                            title="10% Pharmacy Discount" 
                            cost={500} 
                            userPoints={userPoints}
                            desc="Valid at Grand Pharm & OXYmed"
                         />
                         <MarketplaceItem 
                            icon="truck" 
                            title="Free Delivery" 
                            cost={250} 
                            userPoints={userPoints}
                            desc="Free delivery on your next meds order"
                         />
                     </View>
                 )}
                 
                 {activeTab === 'premium' && (
                     <View style={{gap: Spacing.md}}>
                         <MarketplaceItem 
                            icon="moon" 
                            title="Unlock Dark Mode+" 
                            cost={1000} 
                            userPoints={userPoints}
                            desc="OLED black themes & custom icons"
                         />
                         <MarketplaceItem 
                            icon="zap" 
                            title="Ad-Free Experience" 
                            cost={2000} 
                            userPoints={userPoints}
                            desc="Remove all promoted suggestions"
                         />
                     </View>
                 )}

                 {activeTab === 'impact' && (
                     <View style={{gap: Spacing.md}}>
                        <MarketplaceItem 
                            icon="heart" 
                            title="Donate 5 Meals" 
                            cost={800} 
                            userPoints={userPoints}
                            desc="We donate to local charities on your behalf"
                         />
                         <MarketplaceItem 
                            icon="droplet" 
                            title="Clean Water Initiative" 
                            cost={1200} 
                            userPoints={userPoints}
                            desc="Support rural water access projects"
                         />
                     </View>
                 )}
             </View>
        </View>
    );
}

// Sub-component for MP Items
function MarketplaceItem({icon, title, cost, userPoints, desc}: any) {
    const { theme } = useTheme();
    const canAfford = userPoints >= cost;

    return (
        <View style={[styles.mpItem, {backgroundColor: theme.cardBackground}, Shadows.small]}>
            <View style={[styles.mpIcon, {backgroundColor: theme.backgroundSecondary}]}>
                <Feather name={icon} size={20} color={theme.text} />
            </View>
            <View style={{flex: 1}}>
                <ThemedText type="defaultSemiBold">{title}</ThemedText>
                <ThemedText type="caption" style={{color: theme.textSecondary}}>{desc}</ThemedText>
            </View>
            <TouchableOpacity 
                disabled={!canAfford}
                style={[
                    styles.buyBtn, 
                    {backgroundColor: canAfford ? theme.primary : theme.border}
                ]}
            >
                <ThemedText type="small" style={{color: canAfford ? '#FFF' : theme.textSecondary}}>
                    {cost} pts
                </ThemedText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    heroContainer: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.lg
    },
    heroGradient: {
        padding: Spacing.lg
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
        gap: 4,
        alignSelf: 'flex-start'
    },
    heroGauge: {
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: -20,
        marginTop: -10
    },
    heroGaugeValue: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center'
    },
    heroFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)'
    },
    
    // Quests
    sectionContainer: {
        marginBottom: Spacing.xl
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4
    },
    questScroll: {
        gap: Spacing.md,
        paddingRight: Spacing.xl // Padding for scroll end
    },
    questCard: {
        width: 140,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'flex-start'
    },
    questIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center'
    },
    
    // Marketplace
    tabBar: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        gap: 4
    },
    tabBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 8
    },
    insuranceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md
    },
    insuranceBtn: {
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: Spacing.md
    },
    mpItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.md
    },
    mpIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buyBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6
    }
});
