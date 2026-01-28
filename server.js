const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Gemini API proxy
app.post('/api/gemini', async (req, res) => {
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
});

// ChatGPT (OpenAI) API proxy
app.post('/api/chatgpt', async (req, res) => {
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
});

// Claude (Anthropic) API proxy
app.post('/api/claude', async (req, res) => {
    const { prompt, apiKey } = req.body;

    if (!prompt || !apiKey) {
        return res.json({ error: 'prompt and apiKey are required' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.json({ error: data.error.message || 'Anthropic API error' });
        }

        const result = data.content?.[0]?.text || 'No response';
        res.json({ result });
    } catch (error) {
        res.json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`AI Compare server running at http://localhost:${PORT}`);
});
