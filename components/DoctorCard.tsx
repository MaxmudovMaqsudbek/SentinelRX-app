/**
 * DoctorCard - Professional Doctor Profile Card
 * 
 * Displays doctor information with specialty, ratings, availability,
 * and consultation request functionality.
 * 
 * @component
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Spacer from '@/components/Spacer';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { createConsultationRequest, DoctorConsultationRequest } from '@/utils/documentService';

// ============================================================================
// TYPES
// ============================================================================

export interface Doctor {
  id: string;
  name: string;
  nameUz?: string;
  nameRu?: string;
  specialty: string;
  specialtyUz?: string;
  specialtyRu?: string;
  hospital: string;
  city: string;
  experience: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  currency: string;
  languages: string[];
  availability: 'available' | 'busy' | 'offline';
  nextAvailable?: string;
  imageUrl?: string;
  services: string[];
  isPillAnalysisExpert?: boolean;
  isVerified?: boolean;
}

interface DoctorCardProps {
  doctor: Doctor;
  onConsultRequest?: (request: DoctorConsultationRequest) => void;
  patientName?: string;
  patientMedications?: string[];
  compact?: boolean;
}

type ConsultationReason = DoctorConsultationRequest['reason'];

// ============================================================================
// CONSTANTS
// ============================================================================

const CONSULTATION_REASONS: Array<{ value: ConsultationReason; label: string; icon: string }> = [
  { value: 'generalConsultation', label: 'General Consultation', icon: 'message-circle' },
  { value: 'pillAnalysis', label: 'Pill Safety Analysis 💊', icon: 'shield' },
  { value: 'form086Review', label: '086-Forma Review', icon: 'file-text' },
  { value: 'labReview', label: 'Lab Results Review', icon: 'activity' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function DoctorCard({
  doctor,
  onConsultRequest,
  patientName = 'Patient',
  patientMedications = [],
  compact = false,
}: DoctorCardProps) {
  const { theme } = useTheme();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ConsultationReason>('generalConsultation');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAvailabilityColor = () => {
    switch (doctor.availability) {
      case 'available': return '#10B981';
      case 'busy': return '#F59E0B';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getAvailabilityText = () => {
    switch (doctor.availability) {
      case 'available': return 'Available Now';
      case 'busy': return `Available ${doctor.nextAvailable || 'Soon'}`;
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const handleSubmitRequest = async () => {
    if (!message.trim()) {
      Alert.alert('Message Required', 'Please describe your concern or question.');
      return;
    }

    setIsSubmitting(true);

    try {
      const request = await createConsultationRequest({
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        patientName,
        reason: selectedReason,
        attachedDocuments: [],
        attachedMedications: selectedReason === 'pillAnalysis' ? patientMedications : undefined,
        message,
      });

      onConsultRequest?.(request);
      setShowRequestModal(false);
      setMessage('');
      
      Alert.alert(
        '✅ Request Sent!',
        `Your consultation request has been sent to ${doctor.name}. You'll be notified when they respond.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // REQUEST MODAL (Shared between compact and full card)
  // ============================================================================

  const renderRequestModal = () => (
    <Modal
      visible={showRequestModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowRequestModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
        {/* Modal Header */}
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => setShowRequestModal(false)} style={styles.closeButton}>
            <Feather name="x" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="h3">Request Consultation</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Doctor Summary */}
          <View style={[styles.doctorSummary, { backgroundColor: theme.backgroundSecondary }]}>
            {doctor.imageUrl ? (
              <Image source={{ uri: doctor.imageUrl }} style={styles.modalAvatar} />
            ) : (
              <View style={[styles.modalAvatar, { backgroundColor: theme.primary }]}>
                <ThemedText type="h2" style={{ color: '#FFF' }}>
                  {doctor.name.charAt(0)}
                </ThemedText>
              </View>
            )}
            <View style={styles.doctorSummaryInfo}>
              <ThemedText type="h4">{doctor.name}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {doctor.specialty}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.primary }}>
                {doctor.hospital}
              </ThemedText>
            </View>
          </View>

          <Spacer height={Spacing.lg} />

          {/* Consultation Reason */}
          <ThemedText type="label">What do you need help with?</ThemedText>
          <Spacer height={Spacing.sm} />
          
          <View style={styles.reasonGrid}>
            {CONSULTATION_REASONS.map(reason => (
              <Pressable
                key={reason.value}
                onPress={() => setSelectedReason(reason.value)}
                style={[
                  styles.reasonOption,
                  { 
                    backgroundColor: selectedReason === reason.value 
                      ? theme.primary 
                      : theme.backgroundSecondary,
                    borderColor: theme.border,
                  },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedReason === reason.value }}
              >
                <Feather
                  name={reason.icon as any}
                  size={20}
                  color={selectedReason === reason.value ? '#FFF' : theme.textSecondary}
                />
                <ThemedText
                  type="small"
                  style={{ 
                    color: selectedReason === reason.value ? '#FFF' : theme.text,
                    marginTop: Spacing.xs,
                    textAlign: 'center',
                  }}
                >
                  {reason.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {/* Pill Analysis - Show Medications */}
          {selectedReason === 'pillAnalysis' && patientMedications.length > 0 && (
            <Animated.View entering={FadeIn} style={[styles.medicationsBox, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={styles.medicationsHeader}>
                <Feather name="package" size={16} color={theme.primary} />
                <ThemedText type="label" style={{ marginLeft: Spacing.sm }}>
                  Medications to Analyze:
                </ThemedText>
              </View>
              <View style={styles.medicationTags}>
                {patientMedications.map((med, index) => (
                  <View key={index} style={[styles.medicationTag, { backgroundColor: theme.primary + '20' }]}>
                    <ThemedText type="small" style={{ color: theme.primary }}>{med}</ThemedText>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          <Spacer height={Spacing.lg} />

          {/* Message Input */}
          <ThemedText type="label">Describe your concern</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={[
              styles.messageInput,
              { 
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Please describe your symptoms, questions, or what you'd like the doctor to review..."
            placeholderTextColor={theme.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <Spacer height={Spacing.xl} />

          {/* Fee Info */}
          <View style={[styles.feeBox, { backgroundColor: theme.backgroundSecondary }]}>
            <View>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Consultation Fee
              </ThemedText>
              <ThemedText type="h3" style={{ color: theme.primary }}>
                {doctor.consultationFee.toLocaleString()} {doctor.currency}
              </ThemedText>
            </View>
            <Feather name="credit-card" size={24} color={theme.textSecondary} />
          </View>

          <Spacer height={Spacing.xl} />

          {/* Submit Button */}
          <Button
            onPress={handleSubmitRequest}
            disabled={isSubmitting || !message.trim()}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              `Send Request to ${doctor.name}`
            )}
          </Button>

          <Spacer height={Spacing.lg} />
          
          <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            The doctor will review your request and respond within 24 hours.
            Payment is only processed after consultation is accepted.
          </ThemedText>

          <Spacer height={Spacing['3xl']} />
        </ScrollView>
      </View>
    </Modal>
  );

  // ============================================================================
  // COMPACT CARD
  // ============================================================================

  if (compact) {
    return (
      <Animated.View entering={SlideInRight}>
        <Pressable
          onPress={() => setShowRequestModal(true)}
          style={[styles.compactCard, { backgroundColor: theme.cardBackground }, Shadows.small]}
          accessibilityRole="button"
          accessibilityLabel={`Dr. ${doctor.name}, ${doctor.specialty}`}
        >
          <View style={styles.compactLeft}>
            {doctor.imageUrl ? (
              <Image source={{ uri: doctor.imageUrl }} style={styles.compactAvatar} />
            ) : (
              <View style={[styles.compactAvatar, { backgroundColor: theme.primary }]}>
                <ThemedText type="h4" style={{ color: '#FFF' }}>
                  {doctor.name.charAt(0)}
                </ThemedText>
              </View>
            )}
            <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor() }]} />
          </View>
          
          <View style={styles.compactInfo}>
            <View style={styles.nameRow}>
              <ThemedText type="body" style={{ fontWeight: '600' }}>{doctor.name}</ThemedText>
              {doctor.isVerified && (
                <Feather name="check-circle" size={14} color="#10B981" style={{ marginLeft: 4 }} />
              )}
            </View>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {doctor.specialty} • ⭐ {doctor.rating}
            </ThemedText>
          </View>
          
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        {renderRequestModal()}
      </Animated.View>
    );
  }

  // ============================================================================
  // FULL CARD
  // ============================================================================

  return (
    <Animated.View entering={FadeInUp}>
      <View style={[styles.fullCard, { backgroundColor: theme.cardBackground }, Shadows.medium]}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={[theme.primary, theme.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardHeader}
        >
          {doctor.isPillAnalysisExpert && (
            <View style={styles.expertBadge}>
              <Feather name="award" size={12} color="#FFF" />
              <ThemedText type="small" style={{ color: '#FFF', marginLeft: 4 }}>
                Pill Expert
              </ThemedText>
            </View>
          )}
          
          <View style={styles.headerContent}>
            {doctor.imageUrl ? (
              <Image source={{ uri: doctor.imageUrl }} style={styles.fullAvatar} />
            ) : (
              <View style={[styles.fullAvatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <ThemedText type="h1" style={{ color: '#FFF' }}>
                  {doctor.name.charAt(0)}
                </ThemedText>
              </View>
            )}
            
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <ThemedText type="h3" style={{ color: '#FFF' }}>{doctor.name}</ThemedText>
                {doctor.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Feather name="check" size={10} color="#FFF" />
                  </View>
                )}
              </View>
              <ThemedText type="body" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {doctor.specialty}
              </ThemedText>
              <ThemedText type="caption" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {doctor.hospital} • {doctor.city}
              </ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={[styles.statsRow, { borderBottomColor: theme.border }]}>
          <View style={styles.statItem}>
            <ThemedText type="h4">⭐ {doctor.rating}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {doctor.reviewCount} reviews
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <ThemedText type="h4">{doctor.experience}+ yrs</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Experience
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <View style={[styles.availabilityIndicator, { backgroundColor: getAvailabilityColor() }]} />
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {getAvailabilityText()}
            </ThemedText>
          </View>
        </View>

        {/* Services */}
        <View style={styles.servicesSection}>
          <ThemedText type="label" style={{ marginBottom: Spacing.sm }}>Services</ThemedText>
          <View style={styles.serviceTags}>
            {doctor.services.slice(0, 3).map((service, index) => (
              <View key={index} style={[styles.serviceTag, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>{service}</ThemedText>
              </View>
            ))}
            {doctor.services.length > 3 && (
              <View style={[styles.serviceTag, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  +{doctor.services.length - 3} more
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>Starting from</ThemedText>
            <ThemedText type="h4" style={{ color: theme.primary }}>
              {doctor.consultationFee.toLocaleString()} {doctor.currency}
            </ThemedText>
          </View>
          <Button onPress={() => setShowRequestModal(true)}>
            Book Consultation
          </Button>
        </View>
      </View>

      {renderRequestModal()}
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Compact Card
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  compactLeft: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  compactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availabilityDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  compactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Full Card
  fullCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  expertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  headerInfo: {
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  availabilityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  servicesSection: {
    padding: Spacing.lg,
  },
  serviceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  serviceTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingTop: 0,
  },

  // Modal
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  doctorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  modalAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  doctorSummaryInfo: {
    flex: 1,
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  reasonOption: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  medicationsBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  medicationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  medicationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  medicationTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 120,
  },
  feeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
});

export default DoctorCard;
