export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Retrieve and clean the API key (handle potential quotes or whitespace from environment)
  let apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Service configuration incomplete' });
  }

  // Remove whitespace and any accidental quotes
  apiKey = apiKey.trim().replace(/^["']|["']$/g, '');

  try {
    const payload = req.body;

    // Standard high-compatibility API headers
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "Groq-Node-SDK/1.0.0", // Using a more standard SDK-like agent
      "Accept": "application/json"
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // In case of error, still return JSON
      const status = response.status;
      return res.status(status).json({ error: `Upstream error (${status})` });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Internal connection error' });
  }
}
