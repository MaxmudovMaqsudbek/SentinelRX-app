import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { DrugInteractionAIResult } from "@/utils/aiServices";

/**
 * Generates an HTML string for the Clinical Interaction Report.
 */
function generateEvaluationReportHTML(
    userName: string,
    date: string,
    medications: string[],
    analysis: DrugInteractionAIResult
): string {

    const riskColor =
        analysis.riskLevel === 'critical' ? '#B71C1C' :
            analysis.riskLevel === 'high' ? '#D32F2F' :
                analysis.riskLevel === 'moderate' ? '#F57C00' : '#388E3C';

    const interactionsRows = analysis.interactions.map(interaction => `
    <div class="interaction-card">
        <div class="interaction-header">
            <h3>Interaction with ${interaction.drug}</h3>
            <span class="badge ${interaction.severity.toLowerCase()}">${interaction.severity}</span>
        </div>
        <p class="description">${interaction.description}</p>
    </div>
  `).join('');

    const recommendationsList = analysis.recommendations.map(rec => `<li>${rec}</li>`).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sentinel-RX Clinical Report</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            .header { border-bottom: 2px solid #EEE; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .brand { font-size: 24px; font-weight: bold; color: #4A148C; }
            .report-title { font-size: 18px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
            .patient-info { background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .info-group label { display: block; font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
            .info-group strong { font-size: 16px; color: #000; }
            
            .risk-summary { background: ${riskColor}10; border-left: 5px solid ${riskColor}; padding: 20px; margin-bottom: 30px; border-radius: 4px; }
            .risk-title { color: ${riskColor}; font-weight: bold; font-size: 18px; margin-bottom: 10px; display: block; }
            
            .section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #EEE; padding-bottom: 10px; margin-top: 40px; margin-bottom: 20px; color: #4A148C; }
            
            .interaction-card { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .interaction-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .interaction-header h3 { margin: 0; font-size: 16px; }
            
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #fff; }
            .badge.critical { background: #B71C1C; }
            .badge.high { background: #D32F2F; }
            .badge.moderate { background: #F57C00; }
            .badge.low { background: #388E3C; }
            
            .description { font-size: 14px; color: #555; margin: 0; }
            
            ul.recommendations { padding-left: 20px; }
            ul.recommendations li { margin-bottom: 10px; }
            
            .footer { margin-top: 60px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="brand">Sentinel-RX Guard</div>
            <div class="report-title">Clinical Interaction Report</div>
        </div>

        <div class="patient-info">
            <div class="info-group">
                <label>Patient</label>
                <strong>${userName}</strong>
            </div>
            <div class="info-group">
                <label>Date Generated</label>
                <strong>${date}</strong>
            </div>
             <div class="info-group">
                <label>Active Medications</label>
                <strong>${medications.length}</strong>
            </div>
        </div>
        
        <div class="risk-summary">
             <span class="risk-title">${analysis.riskLevel.toUpperCase()} RISK DETECTED</span>
             <p>${analysis.summary}</p>
        </div>

        <div class="section-title">Medication List</div>
        <p>${medications.join(', ')}</p>

        <div class="section-title">Interaction Details</div>
        ${interactionsRows || '<p>No interactions found.</p>'}

        <div class="section-title">AI Recommendations</div>
        <ul class="recommendations">
            ${recommendationsList || '<li>No specific recommendations.</li>'}
        </ul>
        
        <div class="footer">
            Generated by Sentinel-RX AI. This report is for informational purposes only and does not constitute medical advice.
            Please consult with a healthcare professional before making any changes to your medication regimen.
        </div>
    </body>
    </html>
  `;
}

/**
 * Generates and shares the PDF report.
 */
export async function generateAndShareReport(
    userName: string,
    medications: string[],
    analysis: DrugInteractionAIResult
): Promise<void> {
    try {
        const html = generateEvaluationReportHTML(
            userName,
            new Date().toLocaleDateString(),
            medications,
            analysis
        );

        const { uri } = await Print.printToFileAsync({
            html,
            base64: false
        });

        await Sharing.shareAsync(uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
            dialogTitle: 'Share Sentinel-RX Report'
        });

    } catch (error) {
        console.error("Error generating report:", error);
        throw error;
    }
}
