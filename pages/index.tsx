import { useState } from "react";

const FEATURE_NAMES = [
  "Time", "V1","V2","V3","V4","V5","V6","V7","V8","V9","V10",
  "V11","V12","V13","V14","V15","V16","V17","V18","V19","V20",
  "V21","V22","V23","V24","V25","V26","V27","V28","Amount"
];

export default function Home() {
  const [features, setFeatures] = useState<number[]>(Array(FEATURE_NAMES.length).fill(0));
  const [prediction, setPrediction] = useState<string>("");
  const [reasoning, setReasoning] = useState<string>("");

  const handleChange = (index: number, value: number) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handlePredict = async () => {
    try {
      // Call Gemini API directly
      const prompt = `Transaction features: ${FEATURE_NAMES.map((f,i) => `${f}: ${features[i]}`).join(", ")}. Explain if it's fraud or not.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta2/models/gemini-1:generateMessage?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
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

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.[0]?.text || "AI reasoning could not be generated";
      setPrediction("Not Fraud"); // or integrate your ML prediction
      setReasoning(text);

    } catch (err) {
      console.error("Gemini API error:", err);
      setReasoning("AI reasoning could not be generated.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Credit Card Fraud Detection with Gemini AI</h1>
      {FEATURE_NAMES.map((f, i) => (
        <div key={i}>
          <label>{f}: </label>
          <input
            type="number"
            value={features[i]}
            onChange={(e) => handleChange(i, parseFloat(e.target.value))}
          />
        </div>
      ))}
      <button onClick={handlePredict}>Predict Fraud</button>
      {prediction && <p>Prediction: {prediction}</p>}
      {reasoning && <p>AI Reasoning: {reasoning}</p>}
    </div>
  );
}
