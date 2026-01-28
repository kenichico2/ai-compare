export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, apiKey } = req.body;

    if (!prompt || !apiKey) {
        return res.json({ error: 'prompt and apiKey are required' });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            return res.json({ error: data.error.message || 'Gemini API error' });
        }

        const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
        res.json({ result });
    } catch (error) {
        res.json({ error: error.message });
    }
}
