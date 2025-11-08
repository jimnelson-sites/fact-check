import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors());

// Serve the static frontend
app.use(express.static(path.join(__dirname, 'public')));

// ==== Config ====
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';
const PORT = process.env.PORT || 3030;

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in environment');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ---- Helpers ----
async function tavilySearch(query) {
  if (!TAVILY_API_KEY) return null;
  const body = {
    api_key: TAVILY_API_KEY,
    query,
    search_depth: "basic",
    include_answer: false,
    include_images: false,
    include_domains: [],
    max_results: 6
  };
  const resp = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(()=>'');
    throw new Error(`Tavily error: ${resp.status} ${txt}`);
  }
  const data = await resp.json();
  // Normalize to {title,url,snippet,date}
  const items = (data.results || []).map(r => ({
    title: r.title || r.url,
    url: r.url,
    snippet: r.content || r.snippet || '',
    date: r.published_date || r.date || ''
  }));
  return items;
}

async function wikiFallback(query) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  const resp = await fetch(url);
  if (!resp.ok) return [];
  const data = await resp.json();
  if (!data.content_urls || !data.title) return [];
  return [{
    title: data.title,
    url: (data.content_urls.desktop && data.content_urls.desktop.page) || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
    snippet: data.extract || '',
    date: data.timestamp || ''
  }];
}

// ---- LLM call with structured JSON schema ----
const schema = {
  name: "FCYFSchema",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      answer: { type: "string", description: "≤45 words, directly answers the claim." },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      sources: {
        type: "array",
        minItems: 0,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            url: { type: "string" },
            date: { type: "string" }
          },
          required: ["title", "url"]
        }
      },
      speak: { type: "string", description: "One-sentence summary for TTS." },
      notes: { type: "string" },
      next_searches: {
        type: "array",
        items: { type: "string" }
      }
    },
    required: ["answer", "confidence", "sources", "speak"]
  }
};

async function summarizeWithLLM(query, results, spice = 'off', skeptic = false) {
  const now = new Date().toISOString().slice(0,10);
  const sys = `You are FCYF: a fast, no-nonsense fact checker for casual conversation.\nPrimary job: given a short claim or question, verify it quickly with the provided web sources.\nKeep answers short and clear. Friendly, PG-rated bar-stool tone.\nTone control: spice levels — off: straight; light: playful word or two; extra: playful but respectful, never mean.`;

  const user = `Claim: ${query}

Today: ${now}

You are given pre-fetched web results (already vetted for relevance). Cross‑check them and return the structured JSON.
Rules:
- Use 2–4 sources when available (pick the most direct/reputable with recent dates).
- If sources conflict or are weak, say so in notes and lower confidence.
- If not enough to confirm, answer: "Not enough solid sources to confirm." and add 1–2 next_searches.

Web results:
${results.map((r,i)=>`[${i+1}] ${r.title}\nURL: ${r.url}\nDate: ${r.date}\nSnippet: ${r.snippet}\n`).join('\n')}`;

  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: [
      { role: "system", content: sys },
      { role: "user", content: user }
    ],
    response_format: { type: "json_schema", json_schema: schema }
  });

  // Extract text
  const out = response.output?.[0]?.content?.[0]?.text || response.output_text || "";
  try {
    return JSON.parse(out);
  } catch {
    // Best effort fallback
    return {
      answer: out.slice(0, 140),
      confidence: 0.5,
      sources: results.slice(0,2).map(r=>({ title: r.title, url: r.url, date: r.date||""})),
      speak: out.split('. ').slice(0,1).join('. ')
    };
  }
}

// ---- API ----
app.post('/api/answer', async (req, res) => {
  try {
    const { query, spice = 'off', skeptic = false } = req.body || {};
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Missing "query" string' });
    }
    // Search
    let results = await tavilySearch(query);
    if (!results || results.length === 0) {
      results = await wikiFallback(query);
    }
    // Summarize
    const json = await summarizeWithLLM(query, results || [], spice, skeptic);
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`FCYF listening on http://localhost:${PORT}`);
});
