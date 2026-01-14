/**
 * DoctorConnectScreen - Find & Consult Professional Doctors
 * 
 * Discover doctors by specialty, request consultations,
 * and get professional pill safety analysis.
 * 
 * @screen
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DoctorCard, Doctor } from '@/components/DoctorCard';
import Spacer from '@/components/Spacer';
import { useTheme } from '@/hooks/useTheme';
import { useApp } from '@/contexts/AppContext';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { ProfileStackParamList } from '@/navigation/ProfileStackNavigator';
import { getUserProfile, getMedications } from '@/utils/storage';
import { getConsultationRequests, DoctorConsultationRequest } from '@/utils/documentService';

// ============================================================================
// TYPES
// ============================================================================

type DoctorConnectScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'DoctorConnect'>;
};

interface Specialty {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  icon: string;
  color: string;
}

// ============================================================================
// MOCK DATA - In production, fetch from API
// ============================================================================

const SPECIALTIES: Specialty[] = [
  { id: 'all', name: 'All Doctors', nameUz: 'Barcha shifokorlar', nameRu: 'Все врачи', icon: 'users', color: '#6366F1' },
  { id: 'therapist', name: 'Therapist', nameUz: 'Terapevt', nameRu: 'Терапевт', icon: 'heart', color: '#EF4444' },
  { id: 'cardiologist', name: 'Cardiologist', nameUz: 'Kardiolog', nameRu: 'Кардиолог', icon: 'activity', color: '#F59E0B' },
  { id: 'neurologist', name: 'Neurologist', nameUz: 'Nevrolog', nameRu: 'Невролог', icon: 'zap', color: '#10B981' },
  { id: 'pharmacist', name: 'Pharmacist', nameUz: 'Farmatsevt', nameRu: 'Фармацевт', icon: 'package', color: '#8B5CF6' },
  { id: 'dermatologist', name: 'Dermatologist', nameUz: 'Dermatolog', nameRu: 'Дерматолог', icon: 'sun', color: '#EC4899' },
  { id: 'ophthalmologist', name: 'Eye Doctor', nameUz: "Ko'z shifokori", nameRu: 'Офтальмолог', icon: 'eye', color: '#06B6D4' },
  { id: 'psychiatrist', name: 'Psychiatrist', nameUz: 'Psixiatr', nameRu: 'Психиатр', icon: 'smile', color: '#84CC16' },
];

const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'dr_001',
    name: 'Dr. Aziza Karimova',
    nameUz: 'Dr. Aziza Karimova',
    nameRu: 'Др. Азиза Каримова',
    specialty: 'Therapist',
    specialtyUz: 'Terapevt',
    specialtyRu: 'Терапевт',
    hospital: 'Republican Clinical Hospital',
    city: 'Tashkent',
    experience: 15,
    rating: 4.9,
    reviewCount: 342,
    consultationFee: 150000,
    currency: 'UZS',
    languages: ['uz', 'ru', 'en'],
    availability: 'available',
    services: ['General Check-up', '086-Forma Review', 'Pill Analysis', 'Chronic Disease Management'],
    isPillAnalysisExpert: true,
    isVerified: true,
  },
  {
    id: 'dr_002',
    name: 'Dr. Rustam Alimov',
    nameUz: 'Dr. Rustam Alimov',
    nameRu: 'Др. Рустам Алимов',
    specialty: 'Cardiologist',
    specialtyUz: 'Kardiolog',
    specialtyRu: 'Кардиолог',
    hospital: 'Tashkent Medical Academy',
    city: 'Tashkent',
    experience: 22,
    rating: 4.8,
    reviewCount: 567,
    consultationFee: 250000,
    currency: 'UZS',
    languages: ['uz', 'ru'],
    availability: 'busy',
    nextAvailable: 'Tomorrow 10:00',
    services: ['Heart Check-up', 'ECG Analysis', 'Blood Pressure Management', 'Medication Review'],
    isVerified: true,
  },
  {
    id: 'dr_003',
    name: 'Dr. Malika Yusupova',
    nameUz: 'Dr. Malika Yusupova',
    nameRu: 'Др. Малика Юсупова',
    specialty: 'Pharmacist',
    specialtyUz: 'Farmatsevt',
    specialtyRu: 'Фармацевт',
    hospital: 'Sentinel Pharmacy Network',
    city: 'Tashkent',
    experience: 8,
    rating: 4.95,
    reviewCount: 1203,
    consultationFee: 50000,
    currency: 'UZS',
    languages: ['uz', 'ru', 'en'],
    availability: 'available',
    services: ['Drug Interaction Check', 'Pill Safety Analysis', 'Dosage Consultation', 'OTC Recommendations'],
    isPillAnalysisExpert: true,
    isVerified: true,
  },
  {
    id: 'dr_004',
    name: 'Dr. Bobur Nazarov',
    nameUz: 'Dr. Bobur Nazarov',
    nameRu: 'Др. Бобур Назаров',
    specialty: 'Neurologist',
    specialtyUz: 'Nevrolog',
    specialtyRu: 'Невролог',
    hospital: 'National Neurology Center',
    city: 'Tashkent',
    experience: 18,
    rating: 4.7,
    reviewCount: 289,
    consultationFee: 200000,
    currency: 'UZS',
    languages: ['uz', 'ru'],
    availability: 'available',
    services: ['Headache Treatment', 'Sleep Disorders', 'Nerve Problems', 'Medication Review'],
    isVerified: true,
  },
  {
    id: 'dr_005',
    name: 'Dr. Nodira Rahimova',
    nameUz: 'Dr. Nodira Rahimova',
    nameRu: 'Др. Нодира Рахимова',
    specialty: 'Dermatologist',
    specialtyUz: 'Dermatolog',
    specialtyRu: 'Дерматолог',
    hospital: 'City Dermatology Clinic',
    city: 'Tashkent',
    experience: 12,
    rating: 4.85,
    reviewCount: 456,
    consultationFee: 180000,
    currency: 'UZS',
    languages: ['uz', 'ru', 'en'],
    availability: 'offline',
    services: ['Skin Problems', 'Allergy Testing', 'Cosmetic Dermatology', 'Medication Side Effects'],
    isVerified: true,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function DoctorConnectScreen({ navigation }: DoctorConnectScreenProps) {
  const { theme } = useTheme();
  const { language } = useApp();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [showPillExpertsOnly, setShowPillExpertsOnly] = useState(false);
  const [patientName, setPatientName] = useState('Patient');
  const [patientMedications, setPatientMedications] = useState<string[]>([]);
  const [consultationRequests, setConsultationRequests] = useState<DoctorConsultationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profile, meds, requests] = await Promise.all([
        getUserProfile(),
        getMedications(),
        getConsultationRequests(),
      ]);
      
      setPatientName(profile?.name || 'Patient');
      setPatientMedications(meds.map(m => m.name));
      setConsultationRequests(requests);
    } catch (error) {
      console.error('[DoctorConnect] Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    let doctors = [...MOCK_DOCTORS];

    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      const specialty = SPECIALTIES.find(s => s.id === selectedSpecialty);
      if (specialty) {
        doctors = doctors.filter(d => 
          d.specialty.toLowerCase().includes(specialty.name.toLowerCase())
        );
      }
    }

    // Filter by pill experts
    if (showPillExpertsOnly) {
      doctors = doctors.filter(d => d.isPillAnalysisExpert);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      doctors = doctors.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.specialty.toLowerCase().includes(query) ||
        d.hospital.toLowerCase().includes(query) ||
        d.services.some(s => s.toLowerCase().includes(query))
      );
    }

    // Sort: Available first, then by rating
    return doctors.sort((a, b) => {
      if (a.availability === 'available' && b.availability !== 'available') return -1;
      if (b.availability === 'available' && a.availability !== 'available') return 1;
      return b.rating - a.rating;
    });
  }, [selectedSpecialty, showPillExpertsOnly, searchQuery]);

  const handleConsultationRequest = (request: DoctorConsultationRequest) => {
    setConsultationRequests(prev => [...prev, request]);
  };

  const getLocalizedSpecialtyName = (specialty: Specialty) => {
    switch (language) {
      case 'uz': return specialty.nameUz;
      case 'ru': return specialty.nameRu;
      default: return specialty.name;
    }
  };

  // ============================================================================
  // RENDER HEADER
  // ============================================================================

  const renderHeader = () => (
    <Animated.View entering={FadeIn}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroCard, Shadows.large]}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroIcon}>
            <Feather name="users" size={28} color="#FFF" />
          </View>
          <View style={styles.heroText}>
            <ThemedText type="h3" style={{ color: '#FFF' }}>
              Doctor Connect
            </ThemedText>
            <ThemedText type="body" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Find specialists & get consultations
            </ThemedText>
          </View>
        </View>
        
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: '#FFF' }}>{MOCK_DOCTORS.length}</ThemedText>
            <ThemedText type="caption" style={{ color: 'rgba(255,255,255,0.7)' }}>Doctors</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: '#FFF' }}>
              {MOCK_DOCTORS.filter(d => d.availability === 'available').length}
            </ThemedText>
            <ThemedText type="caption" style={{ color: 'rgba(255,255,255,0.7)' }}>Available Now</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: '#FFF' }}>
              {MOCK_DOCTORS.filter(d => d.isPillAnalysisExpert).length}
            </ThemedText>
            <ThemedText type="caption" style={{ color: 'rgba(255,255,255,0.7)' }}>Pill Experts</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <Spacer height={Spacing.lg} />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground }, Shadows.small]}>
        <Feather name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search doctors, specialties..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search doctors"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      <Spacer height={Spacing.md} />

      {/* Pill Expert Toggle */}
      <Pressable
        onPress={() => setShowPillExpertsOnly(!showPillExpertsOnly)}
        style={[
          styles.pillExpertToggle,
          { 
            backgroundColor: showPillExpertsOnly ? theme.primary : theme.cardBackground,
            borderColor: theme.primary,
          },
          Shadows.small,
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: showPillExpertsOnly }}
      >
        <Feather
          name="shield"
          size={18}
          color={showPillExpertsOnly ? '#FFF' : theme.primary}
        />
        <ThemedText
          type="body"
          style={{
            color: showPillExpertsOnly ? '#FFF' : theme.text,
            marginLeft: Spacing.sm,
            fontWeight: '500',
          }}
        >
          💊 Pill Safety Experts Only
        </ThemedText>
        <View style={{ flex: 1 }} />
        <View style={[
          styles.toggleIndicator,
          { backgroundColor: showPillExpertsOnly ? '#FFF' : theme.backgroundSecondary }
        ]}>
          {showPillExpertsOnly && <Feather name="check" size={12} color={theme.primary} />}
        </View>
      </Pressable>

      <Spacer height={Spacing.lg} />

      {/* Specialties */}
      <ThemedText type="h4">Specialties</ThemedText>
      <Spacer height={Spacing.sm} />
      
      <FlatList
        horizontal
        data={SPECIALTIES}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: Spacing.lg }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50)}>
            <Pressable
              onPress={() => setSelectedSpecialty(item.id)}
              style={[
                styles.specialtyChip,
                { 
                  backgroundColor: selectedSpecialty === item.id 
                    ? item.color 
                    : theme.cardBackground,
                  borderColor: item.color,
                },
                Shadows.small,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedSpecialty === item.id }}
            >
              <View style={[
                styles.specialtyIcon,
                { backgroundColor: selectedSpecialty === item.id ? 'rgba(255,255,255,0.2)' : item.color + '20' }
              ]}>
                <Feather
                  name={item.icon as any}
                  size={16}
                  color={selectedSpecialty === item.id ? '#FFF' : item.color}
                />
              </View>
              <ThemedText
                type="small"
                style={{
                  color: selectedSpecialty === item.id ? '#FFF' : theme.text,
                  fontWeight: '500',
                }}
              >
                {getLocalizedSpecialtyName(item)}
              </ThemedText>
            </Pressable>
          </Animated.View>
        )}
      />

      <Spacer height={Spacing.xl} />

      {/* Pending Requests Alert */}
      {consultationRequests.filter(r => r.status === 'pending').length > 0 && (
        <Animated.View entering={FadeInUp}>
          <View style={[styles.pendingAlert, { backgroundColor: '#F59E0B20', borderColor: '#F59E0B' }]}>
            <Feather name="clock" size={20} color="#F59E0B" />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <ThemedText type="body" style={{ fontWeight: '600' }}>
                Pending Requests
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {consultationRequests.filter(r => r.status === 'pending').length} request(s) awaiting doctor response
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color="#F59E0B" />
          </View>
          <Spacer height={Spacing.lg} />
        </Animated.View>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <ThemedText type="h4">
          {filteredDoctors.length} Doctor{filteredDoctors.length !== 1 ? 's' : ''} Found
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          Sorted by availability & rating
        </ThemedText>
      </View>
      
      <Spacer height={Spacing.md} />
    </Animated.View>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Spacer height={Spacing.md} />
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Loading doctors...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 100)}
            style={{ paddingHorizontal: Spacing.lg }}
          >
            <DoctorCard
              doctor={item}
              patientName={patientName}
              patientMedications={patientMedications}
              onConsultRequest={handleConsultationRequest}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={48} color={theme.textSecondary} />
            <Spacer height={Spacing.md} />
            <ThemedText type="h4" style={{ color: theme.textSecondary }}>
              No doctors found
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              Try adjusting your filters or search query
            </ThemedText>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
      />
    </ThemedView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: Spacing['3xl'],
  },
  heroCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  heroText: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  pillExpertToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginLeft: Spacing.lg,
    borderWidth: 1,
  },
  specialtyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  pendingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
});
