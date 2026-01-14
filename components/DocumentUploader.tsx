/**
 * DocumentUploader - Medical Document Upload Component
 * 
 * Provides document picking, preview, and upload functionality
 * with support for PDF, images, and common document formats.
 * 
 * @component
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Spacer from '@/components/Spacer';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import {
  pickDocument,
  saveDocument,
  MedicalDocument,
  generateDocumentId,
  formatFileSize,
  isSupportedFileType,
  getDocumentIcon,
} from '@/utils/documentService';
import { parseDocumentWithAI } from '@/utils/medicalAIService';

// ============================================================================
// TYPES
// ============================================================================

interface DocumentUploaderProps {
  onUploadComplete?: (document: MedicalDocument) => void;
  onParseComplete?: (parsedData: any) => void;
  documentType?: MedicalDocument['type'];
  showAIParsing?: boolean;
  maxSizeMB?: number;
}

interface UploadState {
  status: 'idle' | 'picking' | 'uploading' | 'parsing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DocumentUploader({
  onUploadComplete,
  onParseComplete,
  documentType = 'other',
  showAIParsing = true,
  maxSizeMB = 10,
}: DocumentUploaderProps) {
  const { theme } = useTheme();
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle', progress: 0 });
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const handlePickDocument = async () => {
    setUploadState({ status: 'picking', progress: 0 });

    try {
      const result = await pickDocument();

      if (result.canceled || !result.assets?.[0]) {
        setUploadState({ status: 'idle', progress: 0 });
        return;
      }

      const asset = result.assets[0];

      // Validate file type
      if (!isSupportedFileType(asset.mimeType || '')) {
        Alert.alert('Unsupported Format', 'Please select a PDF or image file.');
        setUploadState({ status: 'idle', progress: 0 });
        return;
      }

      // Validate file size
      const sizeMB = (asset.size || 0) / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        Alert.alert('File Too Large', `Maximum file size is ${maxSizeMB}MB.`);
        setUploadState({ status: 'idle', progress: 0 });
        return;
      }

      setUploadState({ status: 'uploading', progress: 30 });

      // Create document object
      const newDocument: MedicalDocument = {
        id: generateDocumentId(),
        type: documentType,
        name: asset.name || 'Unnamed Document',
        uri: asset.uri,
        mimeType: asset.mimeType || 'application/octet-stream',
        size: asset.size || 0,
        uploadedAt: new Date().toISOString(),
        isProcessed: false,
      };

      // Set preview for images
      if (asset.mimeType?.startsWith('image/')) {
        setPreviewUri(asset.uri);
      } else {
        setPreviewUri(null);
      }

      setSelectedDocument(newDocument);
      setUploadState({ status: 'uploading', progress: 60 });

      // Save to storage
      await saveDocument(newDocument);
      setUploadState({ status: 'uploading', progress: 100 });

      setTimeout(() => {
        setUploadState({ status: 'complete', progress: 100 });
        onUploadComplete?.(newDocument);
      }, 500);

    } catch (error: any) {
      console.error('[DocumentUploader] Error:', error);
      setUploadState({ status: 'error', progress: 0, error: error.message });
      Alert.alert('Upload Failed', 'Could not upload the document. Please try again.');
    }
  };

  const handleAIParsing = async () => {
    if (!selectedDocument || !previewUri) return;

    setUploadState({ status: 'parsing', progress: 0 });

    try {
      // Read image as base64
      const base64 = await FileSystem.readAsStringAsync(selectedDocument.uri, {
        encoding: 'base64',
      });

      setUploadState({ status: 'parsing', progress: 50 });

      // Parse with AI
      const parsedData = await parseDocumentWithAI(
        base64,
        documentType as 'form086' | 'labResult' | 'prescription'
      );

      if (parsedData) {
        // Update document with parsed data
        const updatedDoc: MedicalDocument = {
          ...selectedDocument,
          parsedData: parsedData as MedicalDocument['parsedData'],
          isProcessed: true,
        };
        await saveDocument(updatedDoc);
        setSelectedDocument(updatedDoc);
        onParseComplete?.(parsedData);
        
        Alert.alert('✅ AI Analysis Complete', 'Document has been analyzed successfully.');
      } else {
        Alert.alert('Analysis Failed', 'Could not extract data from this document.');
      }

      setUploadState({ status: 'complete', progress: 100 });

    } catch (error: any) {
      console.error('[DocumentUploader] AI Parsing Error:', error);
      setUploadState({ status: 'error', progress: 0, error: error.message });
      Alert.alert('Analysis Failed', 'AI analysis encountered an error.');
    }
  };

  const handleReset = () => {
    setSelectedDocument(null);
    setPreviewUri(null);
    setUploadState({ status: 'idle', progress: 0 });
  };

  const getDocumentTypeLabel = () => {
    const labels: Record<MedicalDocument['type'], string> = {
      form086: '086-Forma',
      labResult: 'Lab Results',
      prescription: 'Prescription',
      xray: 'X-Ray / Scan',
      other: 'Other Document',
    };
    return labels[documentType];
  };

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  // Idle State - Upload Button
  if (uploadState.status === 'idle' && !selectedDocument) {
    return (
      <Animated.View entering={FadeIn}>
        <Pressable
          onPress={handlePickDocument}
          style={[
            styles.uploadZone,
            { 
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.primary,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Upload ${getDocumentTypeLabel()}`}
        >
          <View style={[styles.uploadIcon, { backgroundColor: theme.primary + '20' }]}>
            <Feather name="upload-cloud" size={32} color={theme.primary} />
          </View>
          <Spacer height={Spacing.md} />
          <ThemedText type="h4">Upload {getDocumentTypeLabel()}</ThemedText>
          <Spacer height={Spacing.xs} />
          <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Tap to select a PDF or image file{'\n'}
            Max size: {maxSizeMB}MB
          </ThemedText>
          <Spacer height={Spacing.md} />
          <View style={styles.supportedFormats}>
            {['PDF', 'JPG', 'PNG'].map(format => (
              <View key={format} style={[styles.formatBadge, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>{format}</ThemedText>
              </View>
            ))}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Loading States
  if (['picking', 'uploading', 'parsing'].includes(uploadState.status)) {
    return (
      <Animated.View 
        entering={FadeIn}
        style={[styles.loadingContainer, { backgroundColor: theme.cardBackground }, Shadows.medium]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Spacer height={Spacing.md} />
        <ThemedText type="body">
          {uploadState.status === 'picking' && 'Selecting document...'}
          {uploadState.status === 'uploading' && 'Uploading...'}
          {uploadState.status === 'parsing' && '🤖 Analyzing with AI...'}
        </ThemedText>
        <Spacer height={Spacing.sm} />
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              { 
                backgroundColor: theme.primary,
                width: `${uploadState.progress}%`,
              },
            ]}
          />
        </View>
      </Animated.View>
    );
  }

  // Complete / Preview State
  if (selectedDocument) {
    return (
      <Animated.View 
        entering={FadeInUp}
        style={[styles.previewContainer, { backgroundColor: theme.cardBackground }, Shadows.medium]}
      >
        {/* Document Preview */}
        <View style={styles.previewHeader}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={[styles.previewPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name={getDocumentIcon(documentType) as any} size={48} color={theme.textSecondary} />
            </View>
          )}
          
          {selectedDocument.isProcessed && (
            <Animated.View 
              entering={ZoomIn}
              style={[styles.processedBadge, { backgroundColor: '#10B981' }]}
            >
              <Feather name="check" size={14} color="#FFF" />
              <ThemedText type="small" style={{ color: '#FFF', marginLeft: 4 }}>AI Analyzed</ThemedText>
            </Animated.View>
          )}
        </View>

        {/* Document Info */}
        <View style={styles.previewInfo}>
          <ThemedText type="h4" numberOfLines={2}>{selectedDocument.name}</ThemedText>
          <Spacer height={Spacing.xs} />
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="file" size={14} color={theme.textSecondary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                {formatFileSize(selectedDocument.size)}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Feather name="calendar" size={14} color={theme.textSecondary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                {new Date(selectedDocument.uploadedAt).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {showAIParsing && previewUri && !selectedDocument.isProcessed && (
            <Button
              onPress={handleAIParsing}
              style={{ flex: 1, marginRight: Spacing.sm }}
            >
              🤖 Analyze with AI
            </Button>
          )}
          <Pressable
            onPress={handleReset}
            style={[styles.resetButton, { borderColor: theme.border }]}
            accessibilityRole="button"
            accessibilityLabel="Remove document"
          >
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  return null;
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  uploadIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportedFormats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  formatBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  loadingContainer: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  previewContainer: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  previewHeader: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 160,
  },
  previewPlaceholder: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processedBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  previewInfo: {
    padding: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: Spacing.lg,
    paddingTop: 0,
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DocumentUploader;
