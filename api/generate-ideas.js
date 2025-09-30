// api/generate-ideas.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { description, lang } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          { role: "system", content: "You are a marketing assistant." },
          { role: "user", content: `Give me 3 marketing ideas in ${lang} for: ${description}` },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    // رجّع أفكار بسيطة للواجهة
    const ideas = data.choices?.[0]?.message?.content
      ?.split("\n")
      .filter(line => line.trim())
      .map(line => ({ title: line, description: line }));

    res.status(200).json(ideas || []);
  } catch (error) {
    console.error("Function error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
