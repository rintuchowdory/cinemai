export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userMessage } = req.body;
  if (!userMessage) return res.status(400).json({ error: 'userMessage is required' });
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: 'You are CinemAI, an expert movie recommendation assistant. You give enthusiastic, concise movie recommendations. Always mention 3-5 specific movies with a short reason for each. Format your response cleanly with movie titles in bold using **Title** syntax. Keep it under 200 words.' },
          { role: 'user', content: userMessage }
        ],
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error });
    res.status(200).json({
      content: [{ text: data.choices[0].message.content }]
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
