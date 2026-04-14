import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateSmartContract = async (serviceDetails: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a digital service agreement (smart contract summary) for a mobile mechanic job. 
    Details: ${JSON.stringify(serviceDetails)}. 
    Include: Scope of work, safety obligations, payment terms for parts and consumables, and warranty info. 
    Format as a professional, concise summary.`,
    config: {
      systemInstruction: "You are a legal and technical assistant for Makhanikhi, a mobile mechanic platform. You generate clear, binding service agreements.",
    }
  });
  return response.text;
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
