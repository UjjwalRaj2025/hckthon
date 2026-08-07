import express from "express";
import { analyzeSOS, assessDamage } from "./src/services/aiService.js";

const router = express.Router();

// 🚨 1. Handle incoming SOS broadcasts
router.post("/api/sos", async (req, res) => {
  const { description, disasterType, latitude, longitude, audioBase64 } = req.body;

  try {
    // 1. Send the raw data to Gemini for instant triage
    const aiVerdict = await analyzeSOS(description, disasterType, audioBase64);

    // 2. Return the fully processed object to React
    res.status(200).json({ 
      success: true, 
      data: {
        disasterType,
        description,
        location: { lat: latitude, lng: longitude },
        status: "pending",
        severity: aiVerdict.severity,
        aiReasoning: aiVerdict.ai_reasoning,
        dispatchUnit: aiVerdict.dispatch_unit
      } 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 📷 2. Handle Drag-and-Drop Damage Assessment
router.post("/api/damage-assessment", async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  try {
    const damageReport = await assessDamage(imageBase64, mimeType);
    
    // Check if the AI flagged it as a fake/screenshot
    if (!damageReport.is_real_disaster) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid image detected.", 
        reason: damageReport.rejection_reason 
      });
    }

    res.status(200).json({ success: true, data: damageReport });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
