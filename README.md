# Fact Check Your Friends (FCYF)

A tiny, no‑nonsense web app for fast, sourced fact checks you can read aloud at the bar.

## What it does
- You type or speak a quick claim/question.
- Server searches the web (Tavily) and sends top results (titles, URLs, snippets, dates) to an LLM (OpenAI Responses API).
- LLM returns a **short answer**, **confidence**, **citations**, a one‑sentence **speak** string, and optional **notes/next searches**.
- The browser can read the answer out loud using the Web Speech API.

## Quick start

```bash
# 1) Create an .env file
cp .env.example .env
# 2) Fill in values in .env (OPENAI_API_KEY is required; TAVILY_API_KEY optional but recommended)
# 3) Install + run (Node 18+ recommended)
npm install
npm run dev
# Visit http://localhost:5173
```

## Environment variables

- `OPENAI_API_KEY` (required): Your OpenAI API key.
- `OPENAI_MODEL` (optional): Defaults to `gpt-4.1-mini`.
- `TAVILY_API_KEY` (optional but recommended): Enables high‑quality web search & snippets.
- `PORT` (optional): Defaults to `3030`.
- `VITE_API_BASE` (optional): Frontend override for API base URL.

> Without `TAVILY_API_KEY`, the app will fall back to a basic Wikipedia search. It still works, but citations will be weaker.

## Design choices
- **Fast**: minimal UI, minimal round‑trips.
- **Grounded**: always includes 2–4 sources where possible.
- **Ear‑friendly**: short answer + a one‑sentence `speak` string for TTS.
- **Honest**: if not enough sources, it tells you.

## Deploy
Any Node host works. For static hosts (Netlify/Vercel), deploy the server as an API function and serve `/public`. Keep `OPENAI_API_KEY` and `TAVILY_API_KEY` as secrets.

## License
MIT
