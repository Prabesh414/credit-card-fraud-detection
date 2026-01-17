// pages/api/predict.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { spawnSync } from "child_process";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not configured");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { features } = req.body;
  console.log("API Received Features:", features);

  try {
    // -------------------
    // Call Python ML model
    // -------------------
    const py = spawnSync(
      "python",
      ["models/predict.py", JSON.stringify(features)],
      { encoding: "utf-8" }
    );

    console.log("Python stdout:", py.stdout);
    console.log("Python stderr:", py.stderr);

    const pyResult = JSON.parse(py.stdout || '{"error":"Python error"}');

    if (pyResult.error) {
      return res.status(500).json({ error: pyResult.error });
    }

    // -------------------
    // Call Gemini API for reasoning using SDK
    // -------------------
    if (!GEMINI_API_KEY) {
      return res.status(200).json({
        prediction: pyResult.prediction,
        reasoning: "Gemini API key is not configured"
      });
    }

    const predictionText = pyResult.prediction === 1 ? "FRAUDULENT" : "LEGITIMATE";
    const prompt = `You are an expert fraud detection analyst. A machine learning model has classified this credit card transaction as ${predictionText}.

Transaction Details:
- Prediction: ${predictionText}
- Features: ${features.join(", ")}

Provide a confident, detailed analysis (3-4 sentences) explaining:
1. WHY this transaction is classified as ${predictionText.toLowerCase()}
2. What specific patterns or indicators support this classification
3. Key risk factors or safety indicators present in the data

Be direct and authoritative in your explanation. Use phrases like "This transaction is clearly..." or "The data strongly indicates..." Avoid hedging language.`;

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const reasoning = response.text();

    // -----------------------------
    // Send response
    // -----------------------------
    res.status(200).json({
      prediction: pyResult.prediction,
      reasoning
    });

  } catch (err: any) {
    console.error("API error:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
}
