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
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/pages/api/predict.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// pages/api/predict.ts
__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const GEMINI_API_KEY = process.env.GEMINI_KEY;
async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();
    const { features } = req.body;
    if (!features || features.length !== 30) {
        return res.status(400).json({
            error: "Features must be a 30-element array"
        });
    }
    try {
        const predictPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "models", "predict.py");
        const pythonPath = "python"; // or full path to Python if needed
        const py = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["spawn"])(pythonPath, [
            predictPath,
            JSON.stringify(features)
        ]);
        let output = "";
        let errorOutput = "";
        py.stdout.on("data", (data)=>output += data.toString());
        py.stderr.on("data", (data)=>errorOutput += data.toString());
        py.on("close", async ()=>{
            if (errorOutput) console.error("PYTHON ERROR:", errorOutput);
            try {
                const result = JSON.parse(output);
                // Call Gemini API for reasoning
                const prompt = `
A credit card transaction has the following features:
${JSON.stringify(features)}

The ML model predicted: ${result.prediction === 1 ? "Fraud" : "Not Fraud"}

Explain simply why this transaction might be considered fraudulent or not.
`;
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
                const geminiData = await geminiRes.json();
                const reasoning = geminiData?.candidates?.[0]?.content?.[0]?.text || "";
                res.status(200).json({
                    prediction: result.prediction,
                    reasoning
                });
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                res.status(500).json({
                    error: errorMessage
                });
            }
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        res.status(500).json({
            error: errorMessage
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a864a367._.js.map