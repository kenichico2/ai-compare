export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, apiKey } = req.body;

    if (!prompt || !apiKey) {
        return res.json({ error: 'prompt and apiKey are required' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.json({ error: data.error.message || 'OpenAI API error' });
        }

        const result = data.choices?.[0]?.message?.content || 'No response';
        res.json({ result });
    } catch (error) {
        res.json({ error: error.message });
    }
}
