// ConjuExpert AI Worker — Cloudflare Workers
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    let body;
    try { body = await request.json(); } catch {
      return new Response('Invalid JSON', { status: 400 });
    }
    const prompt = body && body.prompt;
    if (!prompt) return new Response('Missing prompt', { status: 400 });

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 700,
        }),
      });
      const data = await res.json();
      if (!res.ok) return new Response(JSON.stringify({ error: data.error }),
        { status: res.status, headers: { ...CORS, 'Content-Type': 'application/json' } });
      const text = data.choices?.[0]?.message?.content || '';
      return new Response(JSON.stringify({ text }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: { message: err.message } }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
  }
};
