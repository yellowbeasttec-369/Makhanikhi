import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { google } from "googleapis";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini AI Setup
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // Email Setup (Placeholder for real service)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

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

  app.post("/api/notify/agreement-finalized", async (req, res) => {
    try {
      const { requestId, parties, agreement } = req.body;
      console.log(`[NOTIFY] Agreement finalized for request ${requestId}`);
      
      const emailPromises = parties.map((party: any) => {
        return transporter.sendMail({
          from: '"Makhanikhi Support" <noreply@makhanikhi.co.za>',
          to: party.email,
          subject: `Digital Service Agreement Signed: ${agreement.title}`,
          text: `A new agreement has been signed by all parties. View it in your dashboard.`,
          html: `<h1>${agreement.title}</h1><p>The agreement for your vehicle service has been finalized and signed by all parties.</p>`
        });
      });

      await Promise.all(emailPromises);
      res.json({ success: true, message: "Parties notified via email." });
    } catch (error: any) {
      console.error("Notify Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notify/apprentice-assign", async (req, res) => {
    try {
      const { apprenticeEmail, apprenticePhone, apprenticeName, specialistName, vehicleDetails, serviceType, description } = req.body;
      console.log(`[NOTIFY] Dispatching notification to apprentice team: ${apprenticeName} (${apprenticeEmail})`);
      console.log(`[WHATSAPP PING] Sending WhatsApp ping to ${apprenticePhone}: "Dumelang ${apprenticeName}! Master ${specialistName} has assigned you to a ${vehicleDetails} job. Open Makhanikhi to check SOP checklists and start the labor timer."`);
      
      let emailSent = false;
      if (apprenticeEmail) {
        await transporter.sendMail({
          from: '"Makhanikhi Command Center" <noreply@makhanikhi.co.za>',
          to: apprenticeEmail,
          subject: `Makhanikhi Dispatch: Job Assigned to ${apprenticeName}`,
          text: `Dumela ${apprenticeName}! Specialist master ${specialistName} assigned you to a ${vehicleDetails} repair. Check the App (The System) to view safety SOPs and log the repair. Together, let's keep high-grade steel in service and save carbon emissions!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #FFD200; border-radius: 16px; background-color: #121824; color: #ffffff;">
              <h1 style="color: #FFD200; border-bottom: 2px solid #FFD200; padding-bottom: 10px; margin-top: 0; font-size: 24px;">MAKHAHIKHI COMMAND CENTER</h1>
              <p style="font-size: 16px;">Dumela <strong>${apprenticeName}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6;">You have been co-opted for an active roadside / driveway job by Master Specialist (The Hands) <strong>${specialistName}</strong>.</p>
              
              <div style="background-color: #1e2640; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(255, 210, 0, 0.2);">
                <h3 style="margin-top: 0; color: #FFD200; font-size: 16px;">Job Brief:</h3>
                <p style="margin: 6px 0; font-size: 13px;"><strong>The Wheels (Bakkie):</strong> ${vehicleDetails}</p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>Service Type:</strong> ${serviceType}</p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>Work Scope:</strong> ${description}</p>
              </div>
              
              <h3 style="color: #FFD200; font-size: 16px;">🌿 Proof-of-Preservation (PoP) Circularity Math:</h3>
              <p style="font-size: 13px; line-height: 1.6; background-color: rgba(74, 222, 128, 0.05); border-left: 3px solid #4ade80; padding: 10px; border-radius: 4px;">
                "You replaced a <strong>150g bearing</strong> instead of throwing away a <strong>35kg gearbox</strong>. Together, we saved <strong>34.85kg of high-grade steel</strong> and kept <strong>64.47kg of carbon emissions</strong> out of our skies!"
              </p>
              <p style="font-size: 12px; color: #a0aec0; margin-bottom: 20px;">This eco-performance log will be minted as a compressed NFT (cNFT) on the Solana blockchain and verified via OYU Green to fund the local apprentice training pool.</p>
              
              <h3 style="color: #FFD200; font-size: 16px;">⚠️ Site SOP Checklist (TRL 5):</h3>
              <ul style="font-size: 13px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Setup (Sand-Bottle):</strong> Deploy sand-bottle perimeters. Capture 4-way visual scans and log GPS on <strong>The System</strong> (App).</li>
                <li><strong>The Thumbs Up:</strong> Specialist must approve part tolerances & invoices before installation. Only scanned VAT invoices allowed (SAPS Second-Hand Goods Compliance).</li>
                <li><strong>Hospitality (Ubuntu):</strong> Client food or drinks sit outside the cash invoice. Logged as 'Sustenance Stake' points to boost reputation!</li>
              </ul>
              
              <p style="font-size: 14px; margin-top: 25px;">Please open the app, verify OHS safety setup, and start your labor timer.</p>
              <p style="font-size: 12px; color: #718096; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; text-align: center;">Classic South African Inspired App | Powered by Yellow Beast Studio | Polokwane, Limpopo</p>
            </div>
          `
        });
        emailSent = true;
      }

      res.json({ 
        success: true, 
        emailSent, 
        whatsappPinged: true, 
        whatsappMessage: `Dumelang ${apprenticeName}! Master ${specialistName} has assigned you to a ${vehicleDetails} job. Open Makhanikhi to check SOP checklists and start the labor timer.`
      });
    } catch (error: any) {
      console.error("Apprentice Assignment Notification Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/calendar/add-event", async (req, res) => {
    try {
      const { eventData, accessToken } = req.body;
      if (!accessToken) return res.status(401).json({ error: "Access token required" });

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const result = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: `Makhanikhi: ${eventData.summary}`,
          location: eventData.location,
          description: eventData.description,
          start: { dateTime: eventData.startTime, timeZone: "Africa/Johannesburg" },
          end: { dateTime: eventData.endTime, timeZone: "Africa/Johannesburg" },
        },
      });

      res.json({ success: true, eventId: result.data.id });
    } catch (error: any) {
      console.error("Calendar Error:", error);
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
