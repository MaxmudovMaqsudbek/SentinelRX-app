/**
 * Form086Section - 086-Forma Medical Examination Form
 * 
 * Comprehensive input form for Uzbekistan's standard medical examination form.
 * Follows accessibility guidelines with proper labels and input validation.
 * 
 * @component
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Spacer from '@/components/Spacer';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { 
  Form086Data, 
  ExaminationResult, 
  saveForm086, 
  getForm086 
} from '@/utils/documentService';

// ============================================================================
// TYPES
// ============================================================================

interface Form086SectionProps {
  onSave?: (data: Partial<Form086Data>) => void;
  onGenerateSummary?: () => void;
  isLoading?: boolean;
}

interface FormField {
  key: string;
  label: string;
  labelUz: string;
  labelRu: string;
  placeholder: string;
  type: 'text' | 'date' | 'select' | 'multiline';
  options?: string[];
  required?: boolean;
}

// ============================================================================
// FORM CONFIGURATION
// ============================================================================

const PERSONAL_FIELDS: FormField[] = [
  { key: 'fullName', label: 'Full Name', labelUz: 'F.I.Sh.', labelRu: 'ФИО', placeholder: 'Aliyev Sherzod Karimovich', type: 'text', required: true },
  { key: 'dateOfBirth', label: 'Date of Birth', labelUz: "Tug'ilgan sana", labelRu: 'Дата рождения', placeholder: 'DD.MM.YYYY', type: 'date', required: true },
  { key: 'gender', label: 'Gender', labelUz: 'Jinsi', labelRu: 'Пол', placeholder: 'Select', type: 'select', options: ['male', 'female'], required: true },
  { key: 'address', label: 'Address', labelUz: 'Manzil', labelRu: 'Адрес', placeholder: 'Tashkent, Yunusobod...', type: 'text' },
  { key: 'workplace', label: 'Workplace', labelUz: 'Ish joyi', labelRu: 'Место работы', placeholder: 'Company name', type: 'text' },
];

const EXAMINATION_FIELDS: Array<{ key: keyof Form086Data; label: string; icon: string }> = [
  { key: 'therapist', label: 'Therapist / Terapevt', icon: 'heart' },
  { key: 'surgeon', label: 'Surgeon / Jarroh', icon: 'scissors' },
  { key: 'neurologist', label: 'Neurologist / Nevrolog', icon: 'activity' },
  { key: 'ophthalmologist', label: 'Ophthalmologist / Ko\'z', icon: 'eye' },
  { key: 'otolaryngologist', label: 'ENT / LOR', icon: 'volume-2' },
  { key: 'dermatologist', label: 'Dermatologist / Dermatolog', icon: 'sun' },
  { key: 'psychiatrist', label: 'Psychiatrist / Psixiatr', icon: 'smile' },
  { key: 'narcologist', label: 'Narcologist / Narkolog', icon: 'shield' },
];

const LAB_FIELDS: FormField[] = [
  { key: 'bloodType', label: 'Blood Type', labelUz: 'Qon guruhi', labelRu: 'Группа крови', placeholder: 'A, B, AB, O', type: 'select', options: ['A', 'B', 'AB', 'O'] },
  { key: 'rhFactor', label: 'Rh Factor', labelUz: 'Rezus omil', labelRu: 'Резус-фактор', placeholder: '+/-', type: 'select', options: ['+', '-'] },
  { key: 'hemoglobin', label: 'Hemoglobin', labelUz: 'Gemoglobin', labelRu: 'Гемоглобин', placeholder: 'e.g., 140 g/L', type: 'text' },
  { key: 'bloodSugar', label: 'Blood Sugar', labelUz: 'Qon shakari', labelRu: 'Сахар крови', placeholder: 'e.g., 5.2 mmol/L', type: 'text' },
  { key: 'urinalysis', label: 'Urinalysis', labelUz: 'Siydik tahlili', labelRu: 'Анализ мочи', placeholder: 'Normal / Abnormal', type: 'text' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function Form086Section({ onSave, onGenerateSummary, isLoading }: Form086SectionProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Partial<Form086Data>>({});
  const [expandedSections, setExpandedSections] = useState<string[]>(['personal']);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing data on mount
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    const existing = await getForm086();
    if (existing) {
      setFormData(existing);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const updateField = useCallback((key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateExamination = useCallback((key: string, field: keyof ExaminationResult, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...(prev[key as keyof Form086Data] as ExaminationResult || {}),
        [field]: value,
      },
    }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveForm086(formData);
      onSave?.(formData);
      Alert.alert('✅ Saved', 'Your 086-Forma has been saved successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save form data.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSectionHeader = (title: string, section: string, icon: string) => (
    <Pressable
      onPress={() => toggleSection(section)}
      style={[styles.sectionHeader, { backgroundColor: theme.backgroundSecondary }]}
      accessibilityRole="button"
      accessibilityLabel={`${title} section, ${expandedSections.includes(section) ? 'expanded' : 'collapsed'}`}
    >
      <View style={styles.sectionHeaderLeft}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '20' }]}>
          <Feather name={icon as any} size={18} color={theme.primary} />
        </View>
        <ThemedText type="h4">{title}</ThemedText>
      </View>
      <Feather
        name={expandedSections.includes(section) ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={theme.textSecondary}
      />
    </Pressable>
  );

  const renderTextInput = (field: FormField) => (
    <View key={field.key} style={styles.fieldContainer}>
      <ThemedText type="label" style={{ marginBottom: Spacing.xs }}>
        {field.label} {field.required && <ThemedText style={{ color: theme.error }}>*</ThemedText>}
      </ThemedText>
      <TextInput
        style={[
          styles.textInput,
          { 
            backgroundColor: theme.backgroundSecondary, 
            color: theme.text,
            borderColor: theme.border,
          },
          field.type === 'multiline' && styles.multilineInput,
        ]}
        placeholder={field.placeholder}
        placeholderTextColor={theme.textSecondary}
        value={(formData as any)[field.key] || ''}
        onChangeText={(text) => updateField(field.key, text)}
        multiline={field.type === 'multiline'}
        accessibilityLabel={field.label}
      />
    </View>
  );

  const renderSelectInput = (field: FormField) => (
    <View key={field.key} style={styles.fieldContainer}>
      <ThemedText type="label" style={{ marginBottom: Spacing.xs }}>
        {field.label}
      </ThemedText>
      <View style={styles.selectRow}>
        {field.options?.map(option => (
          <Pressable
            key={option}
            onPress={() => updateField(field.key, option)}
            style={[
              styles.selectOption,
              { 
                backgroundColor: (formData as any)[field.key] === option 
                  ? theme.primary 
                  : theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: (formData as any)[field.key] === option }}
          >
            <ThemedText
              type="small"
              style={{ 
                color: (formData as any)[field.key] === option 
                  ? '#FFF' 
                  : theme.text 
              }}
            >
              {option === 'male' ? '👨 Male' : option === 'female' ? '👩 Female' : option}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderExaminationCard = (exam: typeof EXAMINATION_FIELDS[0]) => {
    const data = formData[exam.key] as ExaminationResult | undefined;
    
    return (
      <Animated.View
        key={exam.key}
        entering={FadeInDown.delay(100)}
        style={[styles.examCard, { backgroundColor: theme.cardBackground }, Shadows.small]}
      >
        <View style={styles.examHeader}>
          <View style={[styles.examIcon, { backgroundColor: data?.isNormal ? '#10B98120' : theme.backgroundSecondary }]}>
            <Feather 
              name={exam.icon as any} 
              size={16} 
              color={data?.isNormal ? '#10B981' : theme.textSecondary} 
            />
          </View>
          <ThemedText type="body" style={{ flex: 1 }}>{exam.label}</ThemedText>
          <Pressable
            onPress={() => updateExamination(exam.key, 'isNormal', !data?.isNormal)}
            style={[
              styles.normalBadge,
              { backgroundColor: data?.isNormal ? '#10B981' : theme.backgroundSecondary },
            ]}
          >
            <Feather name={data?.isNormal ? 'check' : 'x'} size={14} color={data?.isNormal ? '#FFF' : theme.textSecondary} />
            <ThemedText type="small" style={{ color: data?.isNormal ? '#FFF' : theme.textSecondary, marginLeft: 4 }}>
              {data?.isNormal ? 'Normal' : 'Not Set'}
            </ThemedText>
          </Pressable>
        </View>
        
        <View style={styles.examFields}>
          <TextInput
            style={[styles.examInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
            placeholder="Doctor name"
            placeholderTextColor={theme.textSecondary}
            value={data?.doctor || ''}
            onChangeText={(text) => updateExamination(exam.key, 'doctor', text)}
          />
          <TextInput
            style={[styles.examInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
            placeholder="Conclusion / Notes"
            placeholderTextColor={theme.textSecondary}
            value={data?.conclusion || ''}
            onChangeText={(text) => updateExamination(exam.key, 'conclusion', text)}
          />
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Personal Information Section */}
      {renderSectionHeader('Personal Information / Shaxsiy Ma\'lumotlar', 'personal', 'user')}
      {expandedSections.includes('personal') && (
        <Animated.View entering={FadeInDown} style={[styles.sectionContent, { backgroundColor: theme.cardBackground }]}>
          {PERSONAL_FIELDS.map(field =>
            field.type === 'select' ? renderSelectInput(field) : renderTextInput(field)
          )}
        </Animated.View>
      )}

      <Spacer height={Spacing.md} />

      {/* Medical Examinations Section */}
      {renderSectionHeader('Medical Examinations / Tibbiy Ko\'riklar', 'examinations', 'clipboard')}
      {expandedSections.includes('examinations') && (
        <Animated.View entering={FadeInDown} style={styles.sectionContent}>
          {EXAMINATION_FIELDS.map(renderExaminationCard)}
        </Animated.View>
      )}

      <Spacer height={Spacing.md} />

      {/* Laboratory Tests Section */}
      {renderSectionHeader('Laboratory Tests / Laboratoriya Tahlillari', 'lab', 'activity')}
      {expandedSections.includes('lab') && (
        <Animated.View entering={FadeInDown} style={[styles.sectionContent, { backgroundColor: theme.cardBackground }]}>
          {LAB_FIELDS.map(field =>
            field.type === 'select' ? renderSelectInput(field) : renderTextInput(field)
          )}
        </Animated.View>
      )}

      <Spacer height={Spacing.md} />

      {/* Final Conclusion Section */}
      {renderSectionHeader('Conclusion / Xulosa', 'conclusion', 'check-circle')}
      {expandedSections.includes('conclusion') && (
        <Animated.View entering={FadeInDown} style={[styles.sectionContent, { backgroundColor: theme.cardBackground }]}>
          <ThemedText type="label" style={{ marginBottom: Spacing.sm }}>
            Final Status / Yakuniy Holat
          </ThemedText>
          <View style={styles.conclusionRow}>
            {(['fit', 'conditionallyFit', 'unfit'] as const).map(status => (
              <Pressable
                key={status}
                onPress={() => updateField('conclusion', status)}
                style={[
                  styles.conclusionOption,
                  { 
                    backgroundColor: formData.conclusion === status 
                      ? (status === 'fit' ? '#10B981' : status === 'unfit' ? '#EF4444' : '#F59E0B')
                      : theme.backgroundSecondary,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Feather
                  name={status === 'fit' ? 'check-circle' : status === 'unfit' ? 'x-circle' : 'alert-circle'}
                  size={16}
                  color={formData.conclusion === status ? '#FFF' : theme.textSecondary}
                />
                <ThemedText
                  type="small"
                  style={{ 
                    color: formData.conclusion === status ? '#FFF' : theme.text,
                    marginLeft: 6,
                  }}
                >
                  {status === 'fit' ? 'Fit / Sog\'lom' : status === 'unfit' ? 'Unfit / Yaroqsiz' : 'Conditional'}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          
          <Spacer height={Spacing.md} />
          
          <TextInput
            style={[
              styles.textInput,
              styles.multilineInput,
              { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="Additional restrictions or notes..."
            placeholderTextColor={theme.textSecondary}
            value={formData.restrictions?.join(', ') || ''}
            onChangeText={(text) => updateField('restrictions', text.split(',').map(s => s.trim()))}
            multiline
          />
        </Animated.View>
      )}

      <Spacer height={Spacing.xl} />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          onPress={handleSave}
          style={{ flex: 1, marginRight: Spacing.sm }}
          disabled={isSaving}
        >
          {isSaving ? <ActivityIndicator color="#FFF" /> : '💾 Save Form'}
        </Button>
        <Button
          onPress={onGenerateSummary}
          variant="secondary"
          style={{ flex: 1 }}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color={theme.primary} /> : '🤖 AI Summary'}
        </Button>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sectionContent: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  selectOption: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  examCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  examHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  examIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  normalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  examFields: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  examInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 14,
  },
  conclusionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  conclusionOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
});

export default Form086Section;
