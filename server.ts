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

  app.post("/api/parts/search", async (req, res) => {
    try {
      const { partQuery, vehicleMake, vehicleModel } = req.body;
      const vehicleDesc = `${vehicleMake || ''} ${vehicleModel || ''}`.trim() || 'passenger car';

      const prompt = `You are an automotive parts catalog specialist in South Africa.
Find realistic published parts catalog items for "${partQuery}" for vehicle "${vehicleDesc}".
Return a JSON object with key "items": array of 3 realistic items.
Each item must have:
- id: string
- dealerName: "Goldwagen" or "AutoZone" or "Midas" or "Masterparts"
- dealerWebsite: string url
- partName: string
- partNumber: string
- oemEquivalentNumber: string
- vehicleCompatibility: string
- estimatedPriceZAR: integer (realistic Rand price)
- condition: "Brand New (Tier 1 Aftermarket)" or "OEM Genuine" or "Certified Replacement"
- warrantyMonths: 12 or 24
- inStock: true
- publicCatalogUrl: string website url where clients can verify prices.`;

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      res.json(JSON.parse(result.text || '{"items":[]}'));
    } catch (error: any) {
      console.error("Parts Search Error:", error);
      res.status(500).json({ error: error.message, items: [] });
    }
  });

  app.post("/api/ai/explain-issue-video", async (req, res) => {
    try {
      const { issueTopic, vehicleInfo, clientConcerns } = req.body;
      const vehicleDesc = vehicleInfo ? `${vehicleInfo.year || ''} ${vehicleInfo.make || ''} ${vehicleInfo.model || ''}` : 'passenger vehicle';
      
      const prompt = `You are a master automotive technician and educational instructor.
A client has raised concerns or dissatisfaction regarding a mechanical issue: "${issueTopic || 'power steering failure'}" on vehicle "${vehicleDesc}".
Client concerns: "${clientConcerns || 'Car feels heavy and makes whining noise'}".

Generate an educational response that demystifies how the component works, typical failure causes, and remedial steps.
To eliminate mechanic parasitism, emphasize transparency and clear physical deliverables.
Provide a relevant YouTube tutorial / diagnostic query link.

Return JSON with:
- title: concise title (e.g. "Understanding Hydraulic & Electric Power Steering Failure Modes")
- explanation: 3-4 sentence clear explanation of the mechanics and why this failure occurs
- commonCauses: array of 3-4 specific mechanical root causes (e.g. "Fluid aeration due to reservoir O-ring breach", "Pump vane wear", "Rack spool valve leak")
- diagnosticChecklist: array of 3 steps the client can physically inspect with the technician
- recommendedVideoTitle: realistic YouTube educational video title (e.g. "How Power Steering Works and Why Pumps Fail - Engineering Explained")
- youtubeSearchUrl: YouTube search url (e.g. "https://www.youtube.com/results?search_query=power+steering+pump+failure+symptoms")
- antiParasitismGuideline: clear reminder that if deliverable value was not demonstrated that day, client payment is not compulsory, protecting client trust.`;

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      res.json(JSON.parse(result.text || "{}"));
    } catch (error: any) {
      console.error("Explain Issue Error:", error);
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

  app.post("/api/notify/send-poe-pdf", async (req, res) => {
    try {
      const { recipientEmail, recipientName, role, documentType, summaryText } = req.body;
      console.log(`[POE DISPATCH] Sending ${documentType} to ${recipientEmail} for ${recipientName} (${role})`);

      if (recipientEmail) {
        await transporter.sendMail({
          from: '"Makhanikhi Accreditation Desk" <noreply@makhanikhi.co.za>',
          to: recipientEmail,
          subject: `Makhanikhi Official ${documentType}: ${recipientName}`,
          text: `Official Portfolio of Evidence (PoE) & Technical Prowess growth record for ${recipientName} (${role}). Status: Audited & Compliant (>=90%).`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #FFD200; border-radius: 16px; background-color: #121824; color: #ffffff;">
              <h1 style="color: #FFD200; border-bottom: 2px solid #FFD200; padding-bottom: 10px; margin-top: 0; font-size: 22px;">MAKHANIKHI ACCREDITATION DESK</h1>
              <p style="font-size: 15px;">Dumela,</p>
              <p style="font-size: 14px; line-height: 1.6;">Enclosed is the official verification record for <strong>${recipientName}</strong> (${role.toUpperCase()}).</p>
              
              <div style="background-color: #1e2640; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(255, 210, 0, 0.2);">
                <p style="margin: 4px 0; font-size: 13px;"><strong>Document Type:</strong> ${documentType}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Regulatory Audit:</strong> CIPC (South Africa) / Bizee (USA) Verified</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Smart Escrow Compliance Score:</strong> 95% (Pass Threshold &ge; 90%)</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Live Substance Test:</strong> Timestamp Verified</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>PPE & Site Setup:</strong> Gazebo, Cones/6 Sand Bottles + Certified Toolset</p>
              </div>
              
              <p style="font-size: 13px; color: #a0aec0;">The full PDF record has been digitally stamped and archived under Solana smart escrow governance.</p>
              <p style="font-size: 12px; color: #718096; margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; text-align: center;">Makhanikhi Mobile Workshops | Powered by Yellow Beast Studio</p>
            </div>
          `
        });
      }

      res.json({ success: true, message: `PoE successfully dispatched to ${recipientEmail}` });
    } catch (error: any) {
      console.error("PoE Dispatch Error:", error);
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
