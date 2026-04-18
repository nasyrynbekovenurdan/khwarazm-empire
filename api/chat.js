export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Securely retrieve the key from Vercel's environment variables
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing Vercel environment variable: GROQ_API_KEY' });
  }

  try {
    const payload = req.body;

    // Make the backend request to Groq securely
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Groq server error: ${errorText}` });
    }

    const data = await response.json();
    
    // Return the successful completion back to the frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error("Vercel Serverless Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
