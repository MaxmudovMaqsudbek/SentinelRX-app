import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, UIManager, LayoutAnimation, Platform } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop, G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "./ThemedText";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SafetyScoreGaugeProps {
  score: number; // 0 to 100
  factors: { label: string; impact: number; type: 'negative' | 'positive' | 'neutral' }[];
}

export function SafetyScoreGauge({ score, factors }: SafetyScoreGaugeProps) {
  const { theme } = useTheme();
  const animatedScore = useSharedValue(0);
  const [expanded, setExpanded] = React.useState(false);

  useEffect(() => {
    animatedScore.value = withTiming(score, {
      duration: 1500,
      easing: Easing.out(Easing.exp),
    });
  }, [score]);

  // Gauge Parameters
  const size = 180;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      halfCircumference - (halfCircumference * animatedScore.value) / 100;
    return {
      strokeDashoffset,
    };
  });

  const getStatusDetails = (val: number) => {
    if (val >= 80) return { text: "Optimal", color: "#4CAF50" }; // Green
    if (val >= 50) return { text: "Caution", color: "#FF9800" }; // Orange
    return { text: "Critical", color: "#F44336" }; // Red
  };

  const status = getStatusDetails(score);

  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.95}>
        <View style={styles.header}>
            <View>
                <ThemedText type="h4">Digital Twin Status</ThemedText>
                <ThemedText type="small" style={{color: theme.textSecondary}}>Medication Load & Vitals Analysis</ThemedText>
            </View>
            <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
        </View>

        <View style={styles.gaugeContainer}>
          <Svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
            <Defs>
              <LinearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#F44336" stopOpacity="1" />
                <Stop offset="0.5" stopColor="#FF9800" stopOpacity="1" />
                <Stop offset="1" stopColor="#4CAF50" stopOpacity="1" />
              </LinearGradient>
            </Defs>

            {/* Background Track */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={theme.border}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${halfCircumference} ${circumference}`}
              strokeLinecap="round"
              rotation="-180"
              origin={`${size / 2}, ${size / 2}`}
              opacity={0.3}
            />

            {/* Animated Score Arc */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#gaugeGrad)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${halfCircumference} ${circumference}`}
              strokeLinecap="round"
              rotation="-180"
              origin={`${size / 2}, ${size / 2}`}
              animatedProps={animatedProps}
            />
          </Svg>
          
          <View style={styles.scoreOverlay}>
             <ThemedText type="h1" style={{ fontSize: 42, lineHeight: 48, fontWeight: '800' }}>{score}%</ThemedText>
             <View style={[styles.statusBadge, { backgroundColor: status.color + '20', borderColor: status.color }]}>
                <ThemedText type="small" style={{ color: status.color, fontWeight: '700' }}>
                    {status.text.toUpperCase()}
                </ThemedText>
             </View>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.factorsList}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <ThemedText type="label" style={{marginBottom: 8, color: theme.textSecondary}}>CONTRIBUTING FACTORS</ThemedText>
            {factors.length === 0 ? (
                 <ThemedText type="small" style={{color: theme.success}}>No negative factors detected.</ThemedText>
            ) : (
                factors.map((factor, index) => (
                    <View key={index} style={styles.factorRow}>
                        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                             <Feather 
                                name={factor.type === 'positive' ? "check-circle" : factor.type === 'negative' ? "alert-circle" : "info"} 
                                size={14} 
                                color={factor.type === 'positive' ? theme.success : factor.type === 'negative' ? theme.error : theme.textSecondary} 
                                style={{marginRight: 8}}
                             />
                             <ThemedText type="body" style={{flex: 1}}>{factor.label}</ThemedText>
                        </View>
                        <ThemedText 
                            type="label" 
                            style={{ 
                                color: factor.type === 'positive' ? theme.success : factor.type === 'negative' ? theme.error : theme.textSecondary,
                                fontWeight: '700'
                            }}
                        >
                            {factor.impact > 0 ? '+' : ''}{factor.impact}%
                        </ThemedText>
                    </View>
                ))
            )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginHorizontal: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  gaugeContainer: {
    alignItems: "center",
    justifyContent: "flex-end", // Align svg to bottom to handle half-circle
    height: 140, 
    marginTop: 0,
    position: 'relative'
  },
  scoreOverlay: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    width: '100%'
  },
  statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 4
  },
  factorsList: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center'
  }
});
