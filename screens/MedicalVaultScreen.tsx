/**
 * MedicalVaultScreen - Medical Documents Hub
 * 
 * Central hub for managing medical documents, 086-Forma,
 * and AI-generated health summaries.
 * 
 * @screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { MedCard } from '@/components/MedCard';
import { Button } from '@/components/Button';
import Spacer from '@/components/Spacer';
import { Form086Section } from '@/components/Form086Section';
import { DocumentUploader } from '@/components/DocumentUploader';
import { useTheme } from '@/hooks/useTheme';
import { useApp } from '@/contexts/AppContext';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { ProfileStackParamList } from '@/navigation/ProfileStackNavigator';
import {
  Form086Data,
  MedicalDocument,
  getForm086,
  getDocuments,
  formatFileSize,
  getDocumentIcon,
} from '@/utils/documentService';
import {
  MedicalSummary,
  getCachedMedicalSummary,
} from '@/utils/medicalAIService';
import { getUserProfile, getMedications } from '@/utils/storage';

// ============================================================================
// TYPES
// ============================================================================

type MedicalVaultScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'MedicalVault'>;
};

type ActiveTab = 'overview' | 'form086' | 'documents';

// ============================================================================
// COMPONENT
// ============================================================================

export default function MedicalVaultScreen({ navigation }: MedicalVaultScreenProps) {
  const { theme } = useTheme();
  const { language } = useApp();
  
  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [form086Data, setForm086Data] = useState<Partial<Form086Data> | null>(null);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [form, docs] = await Promise.all([
        getForm086(),
        getDocuments(),
      ]);
      setForm086Data(form);
      setDocuments(docs);
    } catch (error) {
      console.error('[MedicalVault] Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleGenerateSummary = async () => {
    if (!form086Data || Object.keys(form086Data).length === 0) {
      Alert.alert('Missing Data', 'Please fill in your 086-Forma first before generating a summary.');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const profile = await getUserProfile();
      const meds = await getMedications();
      
      const generatedSummary = await getCachedMedicalSummary(
        form086Data,
        profile?.allergies || [],
        meds.map(m => m.name),
        language as 'en' | 'uz' | 'ru'
      );

      if (generatedSummary) {
        setSummary(generatedSummary);
        Alert.alert('✅ Summary Generated', 'Your AI health summary is ready!');
      } else {
        Alert.alert('Error', 'Could not generate summary. Please check your internet connection.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate summary.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const getCompletionPercentage = () => {
    if (!form086Data) return 0;
    
    const requiredFields = ['fullName', 'dateOfBirth', 'gender', 'conclusion'];
    const examFields = ['therapist', 'surgeon', 'neurologist', 'ophthalmologist', 'otolaryngologist'];
    
    let filled = 0;
    requiredFields.forEach(field => {
      if ((form086Data as any)[field]) filled++;
    });
    examFields.forEach(field => {
      if ((form086Data as any)[field]?.isNormal !== undefined) filled++;
    });
    
    return Math.round((filled / (requiredFields.length + examFields.length)) * 100);
  };

  // ============================================================================
  // RENDER TABS
  // ============================================================================

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {(['overview', 'form086', 'documents'] as ActiveTab[]).map(tab => (
        <Pressable
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={[
            styles.tab,
            activeTab === tab && { backgroundColor: theme.primary },
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab }}
        >
          <Feather
            name={tab === 'overview' ? 'home' : tab === 'form086' ? 'file-text' : 'folder'}
            size={16}
            color={activeTab === tab ? '#FFF' : theme.textSecondary}
          />
          <ThemedText
            type="small"
            style={{
              color: activeTab === tab ? '#FFF' : theme.textSecondary,
              marginLeft: Spacing.xs,
              textTransform: 'capitalize',
            }}
          >
            {tab === 'form086' ? '086-Forma' : tab}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );

  // ============================================================================
  // RENDER OVERVIEW TAB
  // ============================================================================

  const renderOverviewTab = () => (
    <Animated.View entering={FadeIn}>
      {/* Hero Card */}
      <LinearGradient
        colors={[theme.primary, '#0E7490']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroCard, Shadows.large]}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroIcon}>
            <Feather name="shield" size={32} color="#FFF" />
          </View>
          <View style={styles.heroText}>
            <ThemedText type="h3" style={{ color: '#FFF' }}>
              Medical Vault
            </ThemedText>
            <ThemedText type="body" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Your secure health data hub
            </ThemedText>
          </View>
        </View>
        
        {/* Completion Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <ThemedText type="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Profile Completion
            </ThemedText>
            <ThemedText type="body" style={{ color: '#FFF', fontWeight: '600' }}>
              {getCompletionPercentage()}%
            </ThemedText>
          </View>
          <View style={styles.progressBar}>
            <Animated.View
              entering={FadeIn.delay(300)}
              style={[
                styles.progressFill,
                { width: `${getCompletionPercentage()}%` },
              ]}
            />
          </View>
        </View>
      </LinearGradient>

      <Spacer height={Spacing.xl} />

      {/* Quick Actions */}
      <ThemedText type="h4">Quick Actions</ThemedText>
      <Spacer height={Spacing.md} />

      <View style={styles.quickActions}>
        <Pressable
          onPress={() => setActiveTab('form086')}
          style={[styles.quickAction, { backgroundColor: theme.cardBackground }, Shadows.small]}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#10B98120' }]}>
            <Feather name="file-text" size={20} color="#10B981" />
          </View>
          <ThemedText type="body">086-Forma</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {form086Data ? 'Edit' : 'Fill'}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('documents')}
          style={[styles.quickAction, { backgroundColor: theme.cardBackground }, Shadows.small]}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#6366F120' }]}>
            <Feather name="upload-cloud" size={20} color="#6366F1" />
          </View>
          <ThemedText type="body">Upload</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {documents.length} files
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('DoctorConnect' as any)}
          style={[styles.quickAction, { backgroundColor: theme.cardBackground }, Shadows.small]}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#F5920B20' }]}>
            <Feather name="users" size={20} color="#F59E0B" />
          </View>
          <ThemedText type="body">Doctors</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Consult
          </ThemedText>
        </Pressable>
      </View>

      <Spacer height={Spacing.xl} />

      {/* AI Summary Section */}
      <View style={[styles.summarySection, { backgroundColor: theme.cardBackground }, Shadows.medium]}>
        <View style={styles.summaryHeader}>
          <View style={[styles.aiIcon, { backgroundColor: theme.primary + '20' }]}>
            <ThemedText type="h4">🤖</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="h4">AI Health Summary</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Powered by GPT-4o-mini
            </ThemedText>
          </View>
        </View>

        {summary ? (
          <Animated.View entering={FadeInDown}>
            <Spacer height={Spacing.md} />
            <ThemedText type="body">{summary.patientOverview}</ThemedText>
            
            {summary.keyFindings.length > 0 && (
              <>
                <Spacer height={Spacing.md} />
                <ThemedText type="label">Key Findings:</ThemedText>
                {summary.keyFindings.map((finding, i) => (
                  <View key={i} style={styles.findingItem}>
                    <Feather name="check-circle" size={14} color="#10B981" />
                    <ThemedText type="body" style={{ marginLeft: Spacing.sm, flex: 1 }}>
                      {finding}
                    </ThemedText>
                  </View>
                ))}
              </>
            )}

            {summary.riskFactors.length > 0 && (
              <>
                <Spacer height={Spacing.md} />
                <ThemedText type="label" style={{ color: '#F59E0B' }}>⚠️ Risk Factors:</ThemedText>
                {summary.riskFactors.map((risk, i) => (
                  <ThemedText key={i} type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.md }}>
                    • {risk}
                  </ThemedText>
                ))}
              </>
            )}

            <Spacer height={Spacing.md} />
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Generated: {new Date(summary.generatedAt).toLocaleString()}
            </ThemedText>
          </Animated.View>
        ) : (
          <>
            <Spacer height={Spacing.md} />
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Fill your 086-Forma to generate an AI-powered health summary that doctors can review quickly.
            </ThemedText>
          </>
        )}

        <Spacer height={Spacing.md} />
        <Button
          onPress={handleGenerateSummary}
          disabled={isGeneratingSummary}
          variant={summary ? 'secondary' : 'primary'}
        >
          {isGeneratingSummary ? (
            <ActivityIndicator color={summary ? theme.primary : '#FFF'} />
          ) : (
            summary ? '🔄 Regenerate Summary' : '✨ Generate AI Summary'
          )}
        </Button>
      </View>

      <Spacer height={Spacing.xl} />

      {/* Recent Documents */}
      {documents.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4">Recent Documents</ThemedText>
            <Pressable onPress={() => setActiveTab('documents')}>
              <ThemedText type="link">View All</ThemedText>
            </Pressable>
          </View>
          <Spacer height={Spacing.md} />
          
          {documents.slice(0, 3).map((doc, index) => (
            <Animated.View
              key={doc.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <View style={[styles.documentItem, { backgroundColor: theme.cardBackground }]}>
                <View style={[styles.docIcon, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name={getDocumentIcon(doc.type) as any} size={20} color={theme.textSecondary} />
                </View>
                <View style={styles.docInfo}>
                  <ThemedText type="body" numberOfLines={1}>{doc.name}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                  </ThemedText>
                </View>
                {doc.isProcessed && (
                  <View style={[styles.processedBadge, { backgroundColor: '#10B98120' }]}>
                    <Feather name="check" size={12} color="#10B981" />
                  </View>
                )}
              </View>
            </Animated.View>
          ))}
        </>
      )}
    </Animated.View>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Spacer height={Spacing.md} />
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Loading your medical vault...
        </ThemedText>
      </View>
    );
  }

  return (
    <ScreenScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
      }
    >
      {renderTabBar()}
      <Spacer height={Spacing.lg} />

      {activeTab === 'overview' && renderOverviewTab()}

      {activeTab === 'form086' && (
        <Animated.View entering={FadeIn}>
          <Form086Section
            onSave={(data) => setForm086Data(data)}
            onGenerateSummary={handleGenerateSummary}
            isLoading={isGeneratingSummary}
          />
        </Animated.View>
      )}

      {activeTab === 'documents' && (
        <Animated.View entering={FadeIn}>
          <ThemedText type="h4">Upload Medical Documents</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
            Upload lab results, prescriptions, X-rays, or other medical documents
          </ThemedText>
          <Spacer height={Spacing.lg} />

          <DocumentUploader
            documentType="labResult"
            onUploadComplete={(doc) => setDocuments(prev => [...prev, doc])}
            showAIParsing={true}
          />

          {documents.length > 0 && (
            <>
              <Spacer height={Spacing.xl} />
              <ThemedText type="h4">All Documents ({documents.length})</ThemedText>
              <Spacer height={Spacing.md} />
              
              {documents.map((doc, index) => (
                <Animated.View
                  key={doc.id}
                  entering={FadeInUp.delay(index * 50)}
                >
                  <MedCard
                    title={doc.name}
                    subtitle={`${formatFileSize(doc.size)} • ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                    leftIcon={getDocumentIcon(doc.type) as any}
                  />
                </Animated.View>
              ))}
            </>
          )}
        </Animated.View>
      )}

      <Spacer height={Spacing['3xl']} />
    </ScreenScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  heroText: {
    flex: 1,
  },
  progressSection: {
    marginTop: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  summarySection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  findingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  docInfo: {
    flex: 1,
  },
  processedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
