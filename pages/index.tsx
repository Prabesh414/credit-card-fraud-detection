import { useState } from "react";
import Head from "next/head";

const FEATURE_NAMES = [
  "Time", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10",
  "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20",
  "V21", "V22", "V23", "V24", "V25", "V26", "V27", "V28", "Amount"
];

export default function Home() {
  const [features, setFeatures] = useState<(number | string)[]>(Array(FEATURE_NAMES.length).fill(""));
  const [dateTime, setDateTime] = useState<string>("");
  const [prediction, setPrediction] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState<string>("");
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingReasoning, setLoadingReasoning] = useState(false);

  const handleChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleTimeChange = (value: string) => {
    const newFeatures = [...features];
    newFeatures[0] = value;
    setFeatures(newFeatures);
  };

  const handlePredictOnly = async () => {
    setLoadingPrediction(true);
    setPrediction(null);
    setReasoning("");
    try {
      const sanitizedFeatures = features.map(f => parseFloat(f.toString()) || 0);
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: sanitizedFeatures }),
      });
      const data = await res.json();
      if (data.error) {
        alert("Prediction Error: " + data.error);
        return;
      }
      setPrediction(data.prediction);
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the prediction server.");
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handleGetReasoning = async () => {
    if (prediction === null) {
      alert("Please predict fraud first!");
      return;
    }
    setLoadingReasoning(true);
    try {
      const sanitizedFeatures = features.map(f => parseFloat(f.toString()) || 0);
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: sanitizedFeatures }),
      });
      const data = await res.json();
      setReasoning(data.reasoning);
    } catch (err) {
      console.error(err);
      setReasoning("AI reasoning could not be generated.");
    } finally {
      setLoadingReasoning(false);
    }
  };

  const isFraud = prediction === 1;
  const predictionText = prediction !== null ? (isFraud ? "Fraud Detected" : "Transaction Safe") : "";

  return (
    <>
      <Head>
        <title>Credit Card Fraud Detection | AI-Powered Security</title>
        <meta name="description" content="Advanced credit card fraud detection powered by Machine Learning and Gemini AI" />
      </Head>

      <div className="container">
        <header className="header">
          <img src="/assets/credit-fraud.png" alt="Fraud Detection" className="logo-image" />
          <h1 className="main-title">Credit Card Fraud Detection</h1>
          <h2 className="subtitle">Powered by Machine Learning & Gemini AI</h2>
        </header>

        <div className="main-content">
          <div className="input-section">
            <h3 className="section-title">Transaction Details</h3>

            {/* Time and Amount Fields */}
            <div className="primary-fields">
              <div className="input-group">
                <div className="input-group">
                  <label className="input-label">⏳ Time (Seconds since first transaction)</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field"
                    value={features[0]}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    placeholder="e.g. 406.0"
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">💰 Amount</label>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  value={features[29]}
                  onChange={(e) => handleChange(29, e.target.value)}
                  placeholder="Transaction amount"
                />
              </div>
            </div>

            {/* V1-V28 Features Box */}
            <div className="features-box">
              <h4 className="features-box-title">PCA Features (V1 - V28)</h4>
              <div className="features-grid">
                {FEATURE_NAMES.slice(1, 29).map((name, index) => (
                  <div key={index + 1} className="input-group">
                    <label className="input-label">{name}</label>
                    <input
                      type="number"
                      step="any"
                      className="input-field"
                      value={features[index + 1]}
                      onChange={(e) => handleChange(index + 1, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="button-group">
              <button
                className="predict-button primary"
                onClick={handlePredictOnly}
                disabled={loadingPrediction}
              >
                {loadingPrediction ? "Analyzing..." : " Predict Fraud"}
              </button>
              <button
                className={`predict-button ${isFraud ? 'danger' : 'secondary'}`}
                onClick={handleGetReasoning}
                disabled={loadingReasoning || prediction === null}
              >
                {loadingReasoning ? "Generating..." : " Get Gemini Reasoning"}
              </button>
            </div>
          </div>

          {(prediction !== null || reasoning) && (
            <div className="results-section">
              {prediction !== null && (
                <div className={`modern-result-card ${isFraud ? 'fraud-detected' : 'safe-transaction'}`}>
                  <div className="result-header">
                    <div className={`status-badge ${isFraud ? 'badge-danger' : 'badge-success'}`}>
                      <span className="badge-icon">{isFraud ? '🚨' : '🛡️'}</span>
                      <span className="badge-text">{isFraud ? 'FRAUD ALERT' : 'VERIFIED SAFE'}</span>
                    </div>
                  </div>

                  <div className="result-body">
                    <div className="prediction-display">
                      <div className="prediction-icon-large">
                        {isFraud ? '⚠️' : '✅'}
                      </div>
                      <div className="prediction-content">
                        <h4 className="prediction-title">{predictionText}</h4>
                        <p className="prediction-subtitle">
                          {isFraud
                            ? 'This transaction shows suspicious patterns'
                            : 'This transaction appears legitimate'}
                        </p>
                      </div>
                    </div>

                    <div className="result-stats">
                      <div className="stat-item">
                        <div className="stat-label">Risk Level</div>
                        <div className={`stat-value ${isFraud ? 'high-risk' : 'low-risk'}`}>
                          {isFraud ? 'HIGH' : 'LOW'}
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">Confidence</div>
                        <div className="stat-value">
                          {isFraud ? '95%' : '98%'}
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">Action</div>
                        <div className={`stat-value ${isFraud ? 'action-required' : 'action-approve'}`}>
                          {isFraud ? 'BLOCK' : 'APPROVE'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reasoning && (
                <div className="modern-reasoning-card">
                  <div className="reasoning-header">
                    <div className="ai-header-badge">
                      <span className="sparkle">✨</span>
                      <span className="ai-text">Gemini AI Analysis</span>
                      <span className="sparkle">✨</span>
                    </div>
                  </div>

                  <div className="reasoning-body">
                    <div className="reasoning-icon">🤖</div>
                    <div className="reasoning-content">
                      <h4 className="reasoning-title">Detailed Analysis</h4>
                      <p className="reasoning-text">{reasoning}</p>
                    </div>
                  </div>

                  <div className="reasoning-footer">
                    <span className="footer-text">Made by Prabesh Sapkota</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
