/**
 * Document Service - Medical Document Management
 * 
 * Handles document upload, storage, retrieval, and AI processing.
 * Follows SOLID principles with single responsibility per function.
 * 
 * @module documentService
 */

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MedicalDocument {
    id: string;
    type: 'form086' | 'labResult' | 'prescription' | 'xray' | 'other';
    name: string;
    uri: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
    parsedData?: Form086Data | LabResultData | null;
    aiSummary?: string;
    isProcessed: boolean;
}

export interface Form086Data {
    // Personal Information
    fullName: string;
    dateOfBirth: string;
    gender: 'male' | 'female';
    address: string;
    workplace?: string;

    // Medical Examinations
    therapist: ExaminationResult;
    surgeon: ExaminationResult;
    neurologist: ExaminationResult;
    ophthalmologist: ExaminationResult;
    otolaryngologist: ExaminationResult;
    dermatologist?: ExaminationResult;
    psychiatrist?: ExaminationResult;
    narcologist?: ExaminationResult;

    // Laboratory Tests
    bloodType?: string;
    rhFactor?: string;
    hemoglobin?: string;
    bloodSugar?: string;
    urinalysis?: string;

    // Vaccinations
    vaccinations: VaccinationRecord[];

    // Final Conclusion
    conclusion: 'fit' | 'conditionallyFit' | 'unfit';
    restrictions?: string[];
    validUntil: string;
    issuedBy: string;
    issuedAt: string;
}

export interface ExaminationResult {
    doctor: string;
    date: string;
    conclusion: string;
    notes?: string;
    isNormal: boolean;
}

export interface VaccinationRecord {
    name: string;
    date: string;
    nextDue?: string;
}

export interface LabResultData {
    testName: string;
    date: string;
    results: Array<{
        parameter: string;
        value: string;
        unit: string;
        reference: string;
        isNormal: boolean;
    }>;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
    DOCUMENTS: '@sentinelrx_medical_documents',
    FORM086: '@sentinelrx_form086_data',
    DOCTOR_REQUESTS: '@sentinelrx_doctor_requests',
} as const;

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

/**
 * Pick a document from device storage
 * Supports PDF, images, and common document formats
 */
export async function pickDocument(): Promise<DocumentPicker.DocumentPickerResult> {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: [
                'application/pdf',
                'image/*',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            copyToCacheDirectory: true,
            multiple: false,
        });

        return result;
    } catch (error) {
        console.error('[DocumentService] Pick error:', error);
        throw error;
    }
}

/**
 * Save a document to local storage
 */
export async function saveDocument(document: MedicalDocument): Promise<void> {
    try {
        const existing = await getDocuments();
        const updated = [...existing.filter(d => d.id !== document.id), document];
        await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));
        console.log('[DocumentService] Document saved:', document.name);
    } catch (error) {
        console.error('[DocumentService] Save error:', error);
        throw error;
    }
}

/**
 * Get all stored documents
 */
export async function getDocuments(): Promise<MedicalDocument[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('[DocumentService] Get error:', error);
        return [];
    }
}

/**
 * Get documents by type
 */
export async function getDocumentsByType(type: MedicalDocument['type']): Promise<MedicalDocument[]> {
    const all = await getDocuments();
    return all.filter(d => d.type === type);
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<void> {
    try {
        const existing = await getDocuments();
        const updated = existing.filter(d => d.id !== id);
        await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));
        console.log('[DocumentService] Document deleted:', id);
    } catch (error) {
        console.error('[DocumentService] Delete error:', error);
        throw error;
    }
}

// ============================================================================
// 086-FORMA MANAGEMENT
// ============================================================================

/**
 * Save 086-Forma data
 */
export async function saveForm086(data: Partial<Form086Data>): Promise<void> {
    try {
        const existing = await getForm086();
        const merged: Partial<Form086Data> = { ...existing, ...data };
        await AsyncStorage.setItem(STORAGE_KEYS.FORM086, JSON.stringify(merged));
        console.log('[DocumentService] Form 086 saved');
    } catch (error) {
        console.error('[DocumentService] Form 086 save error:', error);
        throw error;
    }
}

/**
 * Get 086-Forma data
 */
export async function getForm086(): Promise<Partial<Form086Data> | null> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.FORM086);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('[DocumentService] Form 086 get error:', error);
        return null;
    }
}

/**
 * Clear 086-Forma data
 */
export async function clearForm086(): Promise<void> {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.FORM086);
        console.log('[DocumentService] Form 086 cleared');
    } catch (error) {
        console.error('[DocumentService] Form 086 clear error:', error);
        throw error;
    }
}

// ============================================================================
// DOCTOR CONSULTATION REQUESTS
// ============================================================================

export interface DoctorConsultationRequest {
    id: string;
    doctorId: string;
    doctorName: string;
    specialty: string;
    patientName: string;
    patientAge?: number;
    reason: 'pillAnalysis' | 'generalConsultation' | 'form086Review' | 'labReview';
    attachedDocuments: string[]; // Document IDs
    attachedMedications?: string[]; // Medication names for pill analysis
    message: string;
    status: 'pending' | 'accepted' | 'completed' | 'rejected';
    createdAt: string;
    respondedAt?: string;
    response?: string;
}

/**
 * Create a consultation request
 */
export async function createConsultationRequest(
    request: Omit<DoctorConsultationRequest, 'id' | 'status' | 'createdAt'>
): Promise<DoctorConsultationRequest> {
    try {
        const newRequest: DoctorConsultationRequest = {
            ...request,
            id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        const existing = await getConsultationRequests();
        await AsyncStorage.setItem(
            STORAGE_KEYS.DOCTOR_REQUESTS,
            JSON.stringify([...existing, newRequest])
        );

        console.log('[DocumentService] Consultation request created:', newRequest.id);
        return newRequest;
    } catch (error) {
        console.error('[DocumentService] Create request error:', error);
        throw error;
    }
}

/**
 * Get all consultation requests
 */
export async function getConsultationRequests(): Promise<DoctorConsultationRequest[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.DOCTOR_REQUESTS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('[DocumentService] Get requests error:', error);
        return [];
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique document ID
 */
export function generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Check if file type is supported
 */
export function isSupportedFileType(mimeType: string): boolean {
    const supported = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    return supported.includes(mimeType);
}

/**
 * Get document type icon name
 */
export function getDocumentIcon(type: MedicalDocument['type']): string {
    const icons: Record<MedicalDocument['type'], string> = {
        form086: 'file-text',
        labResult: 'activity',
        prescription: 'clipboard',
        xray: 'image',
        other: 'file',
    };
    return icons[type] || 'file';
}
