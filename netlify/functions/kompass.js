exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  const { situation } = body;
  if (!situation || situation.trim().length < 5) {
    return { statusCode: 400, body: 'Anfrage zu kurz' };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return { statusCode: 500, body: 'API Key fehlt' };
  }

  const systemPrompt = `Du bist Sarah Plainer, österreichische Gesundheits-Mentorin und Ringana-Partnerin.
Du hilfst Frauen die gerade eine Darmkur machen, gesunde und leckere Rezepte zu finden.

Dein Ton: direkt, warm, motivierend, wie eine gute Freundin. Kein Coaching-Sprech.
Antworte auf Deutsch, kurz und praktisch.

Wenn du Rezepte erstellst:
- Nur darmfreundliche Zutaten (wenig Zucker, wenig Weizen, viel Gemüse)
- Einfach umsetzbar, keine stundenlangen Kochprojekte
- Wenn eine Einkaufsliste gewünscht: kompakt und übersichtlich
- Formatiere mit klaren Überschriften pro Rezept

Antworte NUR als reinen Text, kein JSON, kein Markdown außer für Überschriften.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: situation.trim() }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('API error:', err);
      return { statusCode: 502, body: 'API Fehler' };
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ impuls: text })
    };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: 'Server Fehler' };
  }
};
