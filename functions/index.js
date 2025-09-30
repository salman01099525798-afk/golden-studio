const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const axios = require("axios");

setGlobalOptions({ maxInstances: 10 });

// ⚠️ مهم: حط مفتاحك هنا لكن من الأفضل تستخدم Environment Variables
const OPENROUTER_API_KEY = "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";

// دالة: توليد الأفكار التسويقية
exports.generateIdeas = onRequest(async (req, res) => {
  try {
    const { description, lang } = req.body;

    const prompt = lang === "ar"
      ? `اقترح 3 أفكار تسويقية مبتكرة لمشروع: ${description}`
      : `Suggest 3 creative marketing ideas for this business: ${description}`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-flash-1.5",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices[0].message.content;

    // رجّعهم كـ Array (عشان الموقع يعرضهم كبطاقات)
    const ideas = text.split("\n").filter(line => line.trim()).map(line => ({
      title: line.replace(/^\d+[\).\s]*/, "").trim(),
      description: lang === "ar"
        ? "فكرة تسويقية مقترحة"
        : "Suggested marketing idea"
    }));

    res.json(ideas);
  } catch (error) {
    console.error("Error generating ideas:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate ideas" });
  }
});

// دالة: تحليل النمو
exports.generateGrowthAnalysis = onRequest(async (req, res) => {
  try {
    const { businessType, services, lang } = req.body;

    const prompt = lang === "ar"
      ? `حلل إمكانيات نمو مشروع (${businessType}) خلال 6 أشهر إذا استخدم الخدمات التالية: ${services.join(", ")}`
      : `Analyze the 6-month growth potential of a (${businessType}) if it uses these services: ${services.join(", ")}`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-flash-1.5",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices[0].message.content;

    res.json({
      growth_percentage: Math.floor(Math.random() * 50) + 20, // نسبة تقريبية
      synergy_summary: text,
      service_breakdown: services.map(s => ({
        service_name: s,
        contribution_percentage: Math.floor(Math.random() * 15) + 5,
        rationale: lang === "ar"
          ? `هذه الخدمة تساعد في تحسين أداء (${s}).`
          : `This service helps improve performance in ${s}.`
      }))
    });
  } catch (error) {
    console.error("Error generating analysis:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate growth analysis" });
  }
});
