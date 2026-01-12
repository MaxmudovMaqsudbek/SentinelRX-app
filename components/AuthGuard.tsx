import React from 'react';
import { View, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { ThemedText } from './ThemedText';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface AuthGuardProps {
  children: React.ReactNode;
  featureName: string;
}

/**
 * 🔐 AuthGuard Component
 * Wraps premium features and shows login prompt if user is not authenticated.
 * Used for: Interactions, Family Panel, Travel Mode, Rewards
 */
export function AuthGuard({ children, featureName }: AuthGuardProps) {
  const { isAuthenticated } = useApp();
  const navigation = useNavigation<any>();
  
  // Get root navigator for Login/Register navigation
  const rootNav = navigation.getParent()?.getParent() || navigation.getParent() || navigation;

  // If authenticated, show the children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not authenticated - show premium lock screen
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Elements */}
      <View style={[styles.decorCircle, styles.circle1]} />
      <View style={[styles.decorCircle, styles.circle2]} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <Animated.View entering={FadeIn.delay(100)} style={styles.content}>
        {/* Lock Icon */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <View style={styles.lockContainer}>
            <View style={styles.lockGlow} />
            <BlurView intensity={20} tint="dark" style={styles.lockInner}>
              <Feather name="lock" size={48} color="#e94560" />
            </BlurView>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.textContainer}>
          <ThemedText type="h2" style={styles.title}>
            Premium Feature
          </ThemedText>
          <ThemedText type="body" style={styles.subtitle}>
            {featureName} requires an account
          </ThemedText>
        </Animated.View>

        {/* Benefits */}
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.benefitsContainer}>
          <BlurView intensity={15} tint="dark" style={styles.benefitsCard}>
            <View style={styles.benefitsInner}>
              <ThemedText type="label" style={styles.benefitsTitle}>
                ✨ Unlock with free account:
              </ThemedText>
              
              <View style={styles.benefitRow}>
                <Feather name="check-circle" size={16} color="#4CAF50" />
                <ThemedText type="body" style={styles.benefitText}>
                  Save your medication history
                </ThemedText>
              </View>
              
              <View style={styles.benefitRow}>
                <Feather name="check-circle" size={16} color="#4CAF50" />
                <ThemedText type="body" style={styles.benefitText}>
                  Family member monitoring
                </ThemedText>
              </View>
              
              <View style={styles.benefitRow}>
                <Feather name="check-circle" size={16} color="#4CAF50" />
                <ThemedText type="body" style={styles.benefitText}>
                  Earn rewards & achievements
                </ThemedText>
              </View>
              
              <View style={styles.benefitRow}>
                <Feather name="check-circle" size={16} color="#4CAF50" />
                <ThemedText type="body" style={styles.benefitText}>
                  Sync across all devices
                </ThemedText>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.buttonsContainer}>
          <Pressable 
            style={styles.signUpButton}
            onPress={() => rootNav.navigate('Register')}
          >
            <LinearGradient
              colors={['#e94560', '#ff6b6b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signUpGradient}
            >
              <ThemedText type="body" style={styles.signUpText}>
                Create Free Account
              </ThemedText>
              <Feather name="arrow-right" size={20} color="#fff" />
            </LinearGradient>
          </Pressable>

          <Pressable 
            style={styles.signInButton}
            onPress={() => rootNav.navigate('Login')}
          >
            <ThemedText type="body" style={styles.signInText}>
              Already have an account? Sign In
            </ThemedText>
          </Pressable>
        </Animated.View>

        {/* Stats Proof - Improved Card Layout */}
        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.statsContainer}>
          <BlurView intensity={15} tint="dark" style={styles.statsCard}>
            <View style={styles.statsInner}>
              <View style={styles.statItem}>
                <View style={styles.statIconBg}>
                  <Feather name="users" size={18} color="#e94560" />
                </View>
                <ThemedText type="h3" style={styles.statNumber}>100+</ThemedText>
                <ThemedText type="caption" style={styles.statLabel}>Active Users</ThemedText>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <View style={styles.statIconBg}>
                  <Feather name="check-circle" size={18} color="#4CAF50" />
                </View>
                <ThemedText type="h3" style={styles.statNumber}>10K+</ThemedText>
                <ThemedText type="caption" style={styles.statLabel}>Pills Scanned</ThemedText>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <View style={styles.statIconBg}>
                  <Feather name="star" size={18} color="#FFD700" />
                </View>
                <ThemedText type="h3" style={styles.statNumber}>5.0</ThemedText>
                <ThemedText type="caption" style={styles.statLabel}>App Rating</ThemedText>
              </View>
            </View>
          </BlurView>
        </Animated.View>

      </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 100,
    paddingBottom: 120,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  
  // Decorative
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 250,
    height: 250,
    backgroundColor: '#e94560',
    top: -80,
    right: -80,
  },
  circle2: {
    width: 180,
    height: 180,
    backgroundColor: '#0f3460',
    bottom: 100,
    left: -60,
  },

  // Lock Icon
  lockContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  lockGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e94560',
    opacity: 0.2,
  },
  lockInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(233, 69, 96, 0.3)',
  },

  // Text
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
  },

  // Benefits Card
  benefitsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  benefitsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  benefitsInner: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  benefitsTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  benefitText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },

  // Buttons
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  signUpButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  signUpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 8,
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  signInButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  signInText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },

  // Stats - Improved Card Layout
  statsContainer: {
    width: '100%',
    marginTop: 24,
    marginBottom: 100,
  },
  statsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});

export default AuthGuard;
