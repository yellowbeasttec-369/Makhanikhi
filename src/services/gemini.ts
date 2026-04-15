import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateSmartContract = async (serviceDetails: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a structured digital service agreement and quote for a mobile mechanic job.
    Details: ${JSON.stringify(serviceDetails)}.
    
    Return a JSON object with:
    - title: A professional title for the agreement
    - scopeOfWork: Array of specific tasks
    - safetyObligations: Array of safety requirements
    - paymentTerms: Object with callOutFee, diagnosticFee, laborEstimate, and partsEstimate (numeric values)
    - warrantyInfo: String describing the warranty
    - legalDisclaimer: A concise legal disclaimer
    
    Ensure the tone is professional and natural, avoiding markdown bolding like **.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          scopeOfWork: { type: Type.ARRAY, items: { type: Type.STRING } },
          safetyObligations: { type: Type.ARRAY, items: { type: Type.STRING } },
          paymentTerms: {
            type: Type.OBJECT,
            properties: {
              callOutFee: { type: Type.NUMBER },
              diagnosticFee: { type: Type.NUMBER },
              laborEstimate: { type: Type.NUMBER },
              partsEstimate: { type: Type.NUMBER }
            }
          },
          warrantyInfo: { type: Type.STRING },
          legalDisclaimer: { type: Type.STRING }
        },
        required: ["title", "scopeOfWork", "safetyObligations", "paymentTerms", "warrantyInfo", "legalDisclaimer"]
      },
      systemInstruction: "You are a legal and technical assistant for Makhanikhi, a mobile mechanic platform. You generate clear, binding service agreements in structured JSON format.",
    }
  });
  return JSON.parse(response.text);
};

export const analyzeFaults = async (faults: string[], vehicleInfo: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze these vehicle faults: ${faults.join(', ')} for a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}. 
    Provide a diagnostic summary and estimated parts/labor requirements.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          estimatedLaborHours: { type: Type.NUMBER },
          likelyPartsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
          safetyWarnings: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "estimatedLaborHours", "likelyPartsNeeded"]
      }
    }
  });
  return JSON.parse(response.text);
};
