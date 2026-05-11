import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini AI Setup
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Routes
  app.post("/api/ai/generate-contract", async (req, res) => {
    try {
      const { serviceDetails } = req.body;
      
      const prompt = `Generate a structured digital service agreement and quote for a mobile mechanic job.
    Details: ${JSON.stringify(serviceDetails)}.
    
    Return a JSON object with:
    - title: Professional title
    - scopeOfWork: Array of specific tasks
    - safetyObligations: Array of safety requirements
    - paymentTerms: String describing payment process
    - warrantyInfo: Detailed warranty terms
    - legalDisclaimer: A concise legal disclaimer covering liability and site safety conditions. Include a clause stating that all parts costs are verified via real-time receipt capture and that lack of immediate digital documentation may delay reimbursement.
    
    CRITICAL: Ensure the tone is professional, human, and natural. DO NOT use double asterisks (**) for bolding. Use standard sentence casing and layout.
    Focus on creating TRUST through TRANSPARENCY regarding part purchases and task validation.`;

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a legal and technical assistant for Makhanikhi, a mobile mechanic platform. You generate clear, binding service agreements in structured JSON format."
        }
      });

      res.json(JSON.parse(result.text || "{}"));
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/analyze-faults", async (req, res) => {
    try {
      const { faults, vehicleInfo } = req.body;
      
      const prompt = `Analyze these vehicle faults: ${faults.join(', ')} for a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}. 
    Provide a diagnostic summary and estimated parts/labor requirements.`;

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      res.json(JSON.parse(result.text || "{}"));
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
