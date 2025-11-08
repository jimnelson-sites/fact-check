const apiBase = import.meta?.env?.VITE_API_BASE || '';

const qEl = document.getElementById('q');
const goEl = document.getElementById('go');
const resEl = document.getElementById('result');

async function fetchAnswer(query, spice='off', skeptic=false){
  const resp = await fetch(`${apiBase}/api/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, spice, skeptic })
  });
  if (!resp.ok) throw new Error(await resp.text());
  return await resp.json();
}

function renderResult(data){
  const { answer, confidence, sources=[], speak, notes, next_searches=[] } = data;
  resEl.classList.remove('hidden');
  resEl.innerHTML = `
    <div class="answer">${escapeHtml(answer || '')}</div>
    <div class="meta">
      <div class="conf">Confidence: ${(confidence*100).toFixed(0)}%</div>
      <div class="controls">
        <button id="tts">🔊 Read aloud</button>
        <button id="copy">📋 Copy</button>
      </div>
    </div>
    <div class="srcs">
      ${sources.map(s=>`<a class="src" target="_blank" rel="noopener" href="${s.url}">${escapeHtml(s.title || s.url)}</a>`).join('')}
    </div>
    ${notes ? `<div class="notes">Notes: ${escapeHtml(notes)}</div>` : ''}
    ${next_searches?.length ? `<div class="next">Try: ${next_searches.map(n=>`<code>${escapeHtml(n)}</code>`).join(' ')}</div>` : ''}
  `;
  document.getElementById('tts').onclick = ()=> {
    try {
      const u = new SpeechSynthesisUtterance(speak || answer || 'No answer.');
      u.rate = 1.05; u.pitch = 1.0;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch (e) { console.error(e); }
  };
  document.getElementById('copy').onclick = async ()=> {
    try { await navigator.clipboard.writeText(answer); } catch {}
  };
}

function renderError(msg){
  resEl.classList.remove('hidden');
  resEl.innerHTML = `<div class="error">⚠️ ${escapeHtml(msg)}</div>`;
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

async function run(skeptic=false){
  const query = qEl.value.trim();
  if (!query) return;
  goEl.disabled = true; goEl.textContent = 'Checking…';
  renderError('Working…');
  try {
    const spice = document.getElementById('spice')?.value || 'off';
    const data = await fetchAnswer(query, spice, skeptic);
    renderResult(data);
  } catch (e){
    renderError(e.message || 'Something went wrong.');
  } finally {
    goEl.disabled = false; goEl.textContent = 'Check';
  }
}

goEl.addEventListener('click', run);
const bsEl = document.getElementById('bs');
const spiceEl = document.getElementById('spice');
bsEl.addEventListener('click', ()=> run(true));
qEl.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') run();
});
