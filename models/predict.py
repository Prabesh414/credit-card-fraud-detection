# models/predict.py
import joblib
import sys
import json
import pandas as pd

# Load model and scaler
rf = joblib.load("models/random_forest.pkl")
scaler = joblib.load("models/scaler.pkl")

FEATURE_NAMES = [
    "Time",
    "V1","V2","V3","V4","V5","V6","V7","V8","V9","V10",
    "V11","V12","V13","V14","V15","V16","V17","V18","V19","V20",
    "V21","V22","V23","V24","V25","V26","V27","V28",
    "Amount"
]

try:
    features = json.loads(sys.argv[1])
    df = pd.DataFrame([features], columns=FEATURE_NAMES)
    scaled = scaler.transform(df)
    prediction = rf.predict(scaled)
    print(json.dumps({"prediction": int(prediction[0])}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
