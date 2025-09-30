// api/generate-ideas.js
// Vercel serverless function — تستقبل POST من المتصفح وتتكلم مع OpenRouter باستخدام المتغير البيئي OPENROUTER_API_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description, lang } = req.body || {};

    if (!description) {
      return res.status(400).json({ error: 'description is required' });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'Server missing API key' });
    }

    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: description }]
      })
    });

    const data = await apiResponse.json();
    // ردّ الـ API زي ما هو للمتصفح (تقدر تعدّل الصيغة لو عايز)
    return res.status(apiResponse.status).json(data);

  } catch (err) {
    console.error('Server function error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
