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

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// pages/api/predict.ts
__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$google$2f$generative$2d$ai__$5b$external$5d$__$2840$google$2f$generative$2d$ai$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$29$__ = __turbopack_context__.i("[externals]/@google/generative-ai [external] (@google/generative-ai, esm_import, [project]/node_modules/@google/generative-ai)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$google$2f$generative$2d$ai__$5b$external$5d$__$2840$google$2f$generative$2d$ai$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$google$2f$generative$2d$ai__$5b$external$5d$__$2840$google$2f$generative$2d$ai$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not configured");
}
const genAI = new __TURBOPACK__imported__module__$5b$externals$5d2f40$google$2f$generative$2d$ai__$5b$external$5d$__$2840$google$2f$generative$2d$ai$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$29$__["GoogleGenerativeAI"](GEMINI_API_KEY);
async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();
    const { features } = req.body;
    console.log("API Received Features:", features);
    try {
        // -------------------
        // Call Python ML model
        // -------------------
        const py = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["spawnSync"])("python", [
            "models/predict.py",
            JSON.stringify(features)
        ], {
            encoding: "utf-8"
        });
        console.log("Python stdout:", py.stdout);
        console.log("Python stderr:", py.stderr);
        const pyResult = JSON.parse(py.stdout || '{"error":"Python error"}');
        if (pyResult.error) {
            return res.status(500).json({
                error: pyResult.error
            });
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
            model: "gemini-2.0-flash-exp"
        });
        // Generate content
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ]
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
    } catch (err) {
        console.error("API error:", err);
        res.status(500).json({
            error: err.message || String(err)
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__21eee827._.js.map