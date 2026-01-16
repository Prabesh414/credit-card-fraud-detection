import type { NextApiRequest, NextApiResponse } from "next";
import { execSync } from "child_process";

const GEMINI_API_KEY = process.env.GEMINI_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { features } = req.body; // should be array of 30 numbers

    if (!Array.isArray(features) || features.length !== 30) {
      return res.status(400).json({ error: "Features must be an array of 30 numbers" });
    }

    // -----------------------------
    // Run Python ML prediction
    // -----------------------------
    const pyOutput = execSync(
      `python models/predict.py '${JSON.stringify(features)}'`,
      { encoding: "utf-8" }
    );

    const pyResult = JSON.parse(pyOutput); // { prediction: 0 or 1 }

    // -----------------------------
    // Gemini API call
    // -----------------------------
    const prompt = `A credit card transaction has features: ${JSON.stringify(
      features
    )}. The ML model predicted: ${
      pyResult.prediction === 1 ? "Fraud" : "Not Fraud"
    }. Explain why.`;

   const geminiRes = await fetch(
  `https://generativelanguage.googleapis.com/v1beta2/models/gemini-1:generateMessage?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: { messages: [{ author: "user", content: prompt }] },
      temperature: 0.6,
      max_output_tokens: 180,
    }),
  }
);

const geminiData = await geminiRes.json(); // read once
console.log("Gemini response:", geminiData);

const reasoning =
  geminiData?.candidates?.[0]?.content?.[0]?.text ||
  JSON.stringify(geminiData); // show raw if something is wrong

    // -----------------------------
    // Send response
    // -----------------------------
    res.status(200).json({ prediction: pyResult.prediction, reasoning });
  } catch (err: any) {
    console.error("API error:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
}
