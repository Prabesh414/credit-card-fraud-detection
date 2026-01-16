module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/pages/api/predict.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
;
const GEMINI_API_KEY = process.env.GEMINI_KEY;
async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();
    try {
        const { features } = req.body; // should be array of 30 numbers
        if (!Array.isArray(features) || features.length !== 30) {
            return res.status(400).json({
                error: "Features must be an array of 30 numbers"
            });
        }
        // -----------------------------
        // Run Python ML prediction
        // -----------------------------
        const pyOutput = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`python models/predict.py '${JSON.stringify(features)}'`, {
            encoding: "utf-8"
        });
        const pyResult = JSON.parse(pyOutput); // { prediction: 0 or 1 }
        // -----------------------------
        // Gemini API call
        // -----------------------------
        const prompt = `A credit card transaction has features: ${JSON.stringify(features)}. The ML model predicted: ${pyResult.prediction === 1 ? "Fraud" : "Not Fraud"}. Explain why.`;
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta2/models/gemini-1:generateMessage?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: {
                    messages: [
                        {
                            author: "user",
                            content: prompt
                        }
                    ]
                },
                temperature: 0.6,
                max_output_tokens: 180
            })
        });
        const geminiData = await geminiRes.json(); // read once
        console.log("Gemini response:", geminiData);
        const reasoning = geminiData?.candidates?.[0]?.content?.[0]?.text || JSON.stringify(geminiData); // show raw if something is wrong
        // -----------------------------
        // Send response
        // -----------------------------
        res.status(200).json({
            prediction: pyResult.prediction,
            reasoning
        });
    } catch (err) {
        console.error("API error:", err);
        res.status(500).json({
            error: err.message || String(err)
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__21eee827._.js.map