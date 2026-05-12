import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    // Generic error to avoid revealing environment setup details
    return res.status(500).json({ error: 'Service configuration incomplete' });
  }

  try {
    const payload = req.body;

    // Advanced headers to mimic a real browser session
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Architecture";v="99"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site"
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Return generic status code without leaking error body which might contain sensitive info
      return res.status(response.status).json({ error: 'Upstream service error' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    // Log only generic info, never the error object itself if it could contain headers/keys
    console.error("API Error: Operation failed"); 
    return res.status(500).json({ error: 'Internal server error' });
  }
}
