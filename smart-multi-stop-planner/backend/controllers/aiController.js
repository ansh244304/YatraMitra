function localPlan(body) {
  const origin = String(body.origin || '').trim();
  const destination = String(body.destination || '').trim();
  const request = String(body.userRequest || '').trim();
  const preferences = body.preferences || {};

  const stops = (Array.isArray(body.existingStops) ? body.existingStops : [])
    .slice(0, 6)
    .map((stop) => (typeof stop === 'string' ? { name: stop, reason: '' } : stop))
    .filter((stop) => stop && stop.name)
    .map((stop) => ({ name: String(stop.name).trim(), reason: String(stop.reason || '').trim() }));

  return {
    summary: `A trip from ${origin} to ${destination}${request ? ` focused on ${request}` : ''}. Review routes and prices before travelling.`,
    transportMode: preferences.transportMode || 'car',
    routePreference: preferences.routePreference || 'balanced',
    pace: preferences.pace || 'balanced',
    stopDurationMinutes: 60,
    suggestedStops: stops,
    interests: Array.isArray(preferences.interests) ? preferences.interests : [],
    notes: ['This plan was generated locally. Check live routes, fares and opening hours before you travel.'],
    followUpQuestions: [],
  };
}

function buildPrompt(body) {
  return [
    'You are a helpful trip planner. Reply with JSON only, no markdown.',
    'Use this exact shape:',
    '{"summary":"short summary","transportMode":"car","routePreference":"balanced","pace":"balanced","stopDurationMinutes":60,"suggestedStops":[{"name":"place","reason":"why"}],"interests":[],"notes":[],"followUpQuestions":[]}',
    'Suggest at most 6 stops. Do not invent live prices or timetables.',
    `Start: ${body.origin}`,
    `Finish: ${body.destination}`,
    `Traveller request: ${body.userRequest}`,
    `Current stops: ${JSON.stringify(body.existingStops || [])}`,
    `Preferences: ${JSON.stringify(body.preferences || {})}`,
  ].join('\n');
}

function parseJson(text) {
  const value = String(text || '').trim();
  const block = value.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = block ? block[1] : value;
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');
  return JSON.parse(start >= 0 && end > start ? source.slice(start, end + 1) : source);
}

async function askGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(15000),
    }
  );
  if (!response.ok) throw new Error('Gemini request failed.');
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function askOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('OpenAI request failed.');
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function mergePlan(raw, body) {
  const base = localPlan(body);
  if (!raw || typeof raw !== 'object') return base;
  return {
    ...base,
    ...raw,
    summary: String(raw.summary || base.summary),
    suggestedStops: Array.isArray(raw.suggestedStops) ? raw.suggestedStops.slice(0, 6) : base.suggestedStops,
    interests: Array.isArray(raw.interests) ? raw.interests : base.interests,
    notes: Array.isArray(raw.notes) ? raw.notes : base.notes,
    followUpQuestions: Array.isArray(raw.followUpQuestions) ? raw.followUpQuestions : [],
  };
}

export async function plan(req, res) {
  try {
    const body = req.body || {};
    if (!body.origin || !body.destination) {
      return res.status(400).json({ error: 'Start and destination are required.' });
    }
    if (!body.userRequest || !String(body.userRequest).trim()) {
      return res.status(400).json({ error: 'Please describe the trip you want.' });
    }

    const prompt = buildPrompt(body);
    const wanted = String(process.env.AI_PROVIDER || 'auto').toLowerCase();
    const providers = wanted === 'openai' ? [askOpenAI, askGemini] : [askGemini, askOpenAI];

    for (const ask of providers) {
      try {
        const text = await ask(prompt);
        if (text) {
          return res.json({ plan: mergePlan(parseJson(text), body), provider: ask === askGemini ? 'gemini' : 'openai' });
        }
      } catch {
        continue;
      }
    }

    return res.json({ plan: localPlan(body), provider: 'local' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not create a plan.' });
  }
}
