/**
 * Medical AI Service - AI-Powered Medical Analysis
 * 
 * Provides intelligent medical document analysis, summarization,
 * and doctor-ready report generation using GPT-4o-mini.
 * 
 * @module medicalAIService
 */

import Constants from 'expo-constants';
import { Form086Data, MedicalDocument, LabResultData } from './documentService';

// ============================================================================
// CONFIGURATION
// ============================================================================

const getOpenAIKey = (): string =>
    Constants.expoConfig?.extra?.OPENAI_API_KEY ||
    process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
    '';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// ============================================================================
// TYPES
// ============================================================================

export interface MedicalSummary {
    patientOverview: string;
    keyFindings: string[];
    riskFactors: string[];
    recommendations: string[];
    medicationSafety: {
        safe: string[];
        caution: string[];
        avoid: string[];
    };
    doctorNotes: string;
    language: 'en' | 'uz' | 'ru';
    generatedAt: string;
}

export interface PillAnalysisRequest {
    medicationName: string;
    dosage: string;
    patientAge?: number;
    patientConditions: string[];
    currentMedications: string[];
    allergies: string[];
    form086Summary?: string;
}

export interface PillAnalysisResult {
    isSafe: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    analysis: string;
    interactions: Array<{
        drug: string;
        severity: 'low' | 'medium' | 'high';
        description: string;
    }>;
    allergyWarnings: string[];
    conditionWarnings: string[];
    recommendations: string[];
    alternativeMedications?: string[];
}

export interface DoctorReport {
    title: string;
    patientSummary: string;
    medicalHistory: string;
    currentConcerns: string;
    relevantTests: string;
    medicationProfile: string;
    assessmentRequest: string;
    attachments: string[];
    generatedAt: string;
}

// ============================================================================
// AI SUMMARIZATION
// ============================================================================

/**
 * Generate a comprehensive medical summary from 086-Forma data
 */
export async function generateMedicalSummary(
    form086: Partial<Form086Data>,
    allergies: string[],
    medications: string[],
    language: 'en' | 'uz' | 'ru' = 'en'
): Promise<MedicalSummary | null> {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
        console.error('[MedicalAI] No API key configured');
        return null;
    }

    const languageInstructions = {
        en: 'Respond in English.',
        uz: "O'zbek tilida javob bering.",
        ru: 'Отвечайте на русском языке.',
    };

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a medical AI assistant that creates comprehensive health summaries for patients and doctors.
            
${languageInstructions[language]}

IMPORTANT RULES:
1. Be accurate and professional
2. Highlight any concerning findings
3. Consider drug interactions with allergies and existing medications
4. Provide actionable recommendations
5. Flag any medications that should be avoided based on the patient's conditions
6. This is NOT a diagnosis - always recommend consulting a doctor for final decisions

Return a JSON object with this structure:
{
  "patientOverview": "Brief patient summary",
  "keyFindings": ["Finding 1", "Finding 2"],
  "riskFactors": ["Risk 1", "Risk 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "medicationSafety": {
    "safe": ["Safe medication categories"],
    "caution": ["Use with caution"],
    "avoid": ["Should avoid"]
  },
  "doctorNotes": "Notes for healthcare provider"
}`
                    },
                    {
                        role: 'user',
                        content: `Analyze this patient's medical profile:

086-FORMA DATA:
${JSON.stringify(form086, null, 2)}

KNOWN ALLERGIES:
${allergies.length > 0 ? allergies.join(', ') : 'None reported'}

CURRENT MEDICATIONS:
${medications.length > 0 ? medications.join(', ') : 'None reported'}

Generate a comprehensive medical summary.`
                    }
                ],
                response_format: { type: 'json_object' },
                max_tokens: 1500,
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
            const parsed = JSON.parse(content);
            return {
                ...parsed,
                language,
                generatedAt: new Date().toISOString(),
            };
        }

        return null;
    } catch (error) {
        console.error('[MedicalAI] Summary generation error:', error);
        return null;
    }
}

/**
 * Analyze a specific medication for safety based on patient profile
 */
export async function analyzePillSafety(
    request: PillAnalysisRequest
): Promise<PillAnalysisResult | null> {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
        console.error('[MedicalAI] No API key configured');
        return null;
    }

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert pharmacist AI that analyzes medication safety for individual patients.

CRITICAL SAFETY CHECK:
1. Check for drug allergies FIRST
2. Check for drug-drug interactions
3. Check for contraindications based on patient conditions
4. Consider age-related risks
5. Provide alternatives if medication is unsafe

RISK LEVELS:
- low: Safe to use, minor precautions
- medium: Use with monitoring, discuss with pharmacist
- high: Significant risks, requires doctor approval
- critical: Do NOT use, immediate danger

Return JSON:
{
  "isSafe": boolean,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "analysis": "Detailed safety analysis",
  "interactions": [{"drug": "name", "severity": "level", "description": "explanation"}],
  "allergyWarnings": ["warning1"],
  "conditionWarnings": ["warning1"],
  "recommendations": ["rec1"],
  "alternativeMedications": ["alt1"]
}`
                    },
                    {
                        role: 'user',
                        content: `Analyze medication safety:

MEDICATION: ${request.medicationName}
DOSAGE: ${request.dosage}
PATIENT AGE: ${request.patientAge || 'Unknown'}

PATIENT CONDITIONS:
${request.patientConditions.length > 0 ? request.patientConditions.join(', ') : 'None reported'}

CURRENT MEDICATIONS:
${request.currentMedications.length > 0 ? request.currentMedications.join(', ') : 'None'}

KNOWN ALLERGIES:
${request.allergies.length > 0 ? request.allergies.join(', ') : 'None'}

${request.form086Summary ? `086-FORMA SUMMARY:\n${request.form086Summary}` : ''}

Is this medication safe for this patient?`
                    }
                ],
                response_format: { type: 'json_object' },
                max_tokens: 1000,
                temperature: 0.2,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
            return JSON.parse(content);
        }

        return null;
    } catch (error) {
        console.error('[MedicalAI] Pill analysis error:', error);
        return null;
    }
}

/**
 * Generate a doctor-ready report for consultation
 */
export async function generateDoctorReport(
    patientName: string,
    form086: Partial<Form086Data> | null,
    medications: string[],
    allergies: string[],
    concerns: string,
    language: 'en' | 'uz' | 'ru' = 'en'
): Promise<DoctorReport | null> {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
        console.error('[MedicalAI] No API key configured');
        return null;
    }

    const languageInstructions = {
        en: 'Write in formal medical English.',
        uz: "Rasmiy tibbiy o'zbek tilida yozing.",
        ru: 'Пишите на формальном медицинском русском языке.',
    };

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a medical AI assistant that generates professional doctor consultation reports.

${languageInstructions[language]}

Create a concise, well-structured report that a doctor can review in under 2 minutes.

Return JSON:
{
  "title": "Consultation Request: [Brief Title]",
  "patientSummary": "Age, gender, general health status",
  "medicalHistory": "Relevant history from 086-forma",
  "currentConcerns": "Patient's current issues",
  "relevantTests": "Any relevant test results",
  "medicationProfile": "Current medications and allergies",
  "assessmentRequest": "What the doctor should assess"
}`
                    },
                    {
                        role: 'user',
                        content: `Create a doctor consultation report:

PATIENT: ${patientName}

086-FORMA DATA:
${form086 ? JSON.stringify(form086, null, 2) : 'Not provided'}

CURRENT MEDICATIONS:
${medications.length > 0 ? medications.join(', ') : 'None'}

ALLERGIES:
${allergies.length > 0 ? allergies.join(', ') : 'None'}

PATIENT CONCERNS:
${concerns}`
                    }
                ],
                response_format: { type: 'json_object' },
                max_tokens: 1200,
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
            const parsed = JSON.parse(content);
            return {
                ...parsed,
                attachments: [],
                generatedAt: new Date().toISOString(),
            };
        }

        return null;
    } catch (error) {
        console.error('[MedicalAI] Doctor report error:', error);
        return null;
    }
}

/**
 * Parse uploaded document using AI (OCR + Understanding)
 */
export async function parseDocumentWithAI(
    base64Image: string,
    documentType: 'form086' | 'labResult' | 'prescription'
): Promise<Partial<Form086Data | LabResultData> | null> {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
        console.error('[MedicalAI] No API key configured');
        return null;
    }

    const typeInstructions = {
        form086: `Extract 086-forma medical examination data. Look for:
- Patient name, DOB, gender
- Each specialist's examination results
- Laboratory test results
- Vaccination records
- Final conclusion (fit/unfit)`,
        labResult: `Extract laboratory test results. Look for:
- Test name and date
- Each parameter with value, unit, and reference range
- Flag abnormal values`,
        prescription: `Extract prescription information. Look for:
- Medication names and dosages
- Frequency and duration
- Doctor's name and date`,
    };

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Analyze this medical document image and extract structured data.

Type: ${documentType}
${typeInstructions[documentType]}

Return a JSON object with the extracted data. If a field is not visible or unclear, omit it.`,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
            // Try to parse JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }

        return null;
    } catch (error) {
        console.error('[MedicalAI] Document parsing error:', error);
        return null;
    }
}

// ============================================================================
// CACHING (Performance Optimization)
// ============================================================================

const summaryCache = new Map<string, { data: MedicalSummary; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached summary or generate new one
 */
export async function getCachedMedicalSummary(
    form086: Partial<Form086Data>,
    allergies: string[],
    medications: string[],
    language: 'en' | 'uz' | 'ru'
): Promise<MedicalSummary | null> {
    const cacheKey = JSON.stringify({ form086, allergies, medications, language });
    const cached = summaryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('[MedicalAI] Using cached summary');
        return cached.data;
    }

    const summary = await generateMedicalSummary(form086, allergies, medications, language);

    if (summary) {
        summaryCache.set(cacheKey, { data: summary, timestamp: Date.now() });
    }

    return summary;
}

/**
 * Clear summary cache
 */
export function clearSummaryCache(): void {
    summaryCache.clear();
    console.log('[MedicalAI] Cache cleared');
}
