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
  const systemPrompt = `Du bist Sarah Plainer, österreichische Unternehmerin und Ringana-Partnerin, die Frauen bei ihrer Darmkur begleitet.
Du bekommst eine Anfrage für darmfreundliche Rezepte, mit Angaben zu Ernährungsweise, Unverträglichkeiten und Vorlieben.
Dein Ton: direkt, warm, ehrlich, wie eine gute Freundin. Kein Coaching-Sprech, keine Floskeln. Du sagst "du", nicht "Sie". Verwende NIEMALS Gedankenstriche (– oder —), nutze stattdessen Punkte oder Kommas.
Erstelle die angefragten Rezepte. Jedes Rezept mit: Name, kurze Zutatenliste, kurze Zubereitung in maximal 3 Schritten. Die Rezepte sollen darmfreundlich sein: wenig Zucker, wenig Weizen, viel Gemüse, leicht verdaulich.
Falls eine Einkaufsliste angefragt wurde, füg sie kompakt am Ende hinzu.
Antworte NUR als valides JSON in diesem Format, ohne Markdown, ohne Erklärungen davor oder danach:
{"text": "Der komplette Rezepttext hier, mit Zeilenumbrüchen als \\n"}`;

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
        messages: [{ role: 'user', content: situation }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: 500, body: 'Claude API Fehler: ' + errText };
    }

    const data = await response.json();
    const rawText = data.content && data.content[0] && data.content[0].text ? data.content[0].text : '';

    let result;
    try {
      result = JSON.parse(rawText);
    } catch {
      result = { text: rawText };
    }

    // Sicherheitsnetz: Gedankenstriche zuverlässig entfernen, egal was die KI liefert
    function removeDashes(str) {
      if (typeof str !== 'string') return str;
      return str
        .replace(/\s*[\u2013\u2014]\s*/g, ', ')
        .replace(/,\s*,/g, ',')
        .replace(/,\s*\./g, '.');
    }
    if (result.text) result.text = removeDashes(result.text);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (err) {
    return { statusCode: 500, body: 'Serverfehler: ' + err.message };
  }
};
