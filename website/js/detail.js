'use strict';
const main = document.querySelector('#main');
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function highlight(code) {
  // A lightweight display lexer. Escapes every token, including comments and strings.
  const pattern = /#[^\n]*|"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\b(?:def|class|return|import|from|as|if|else|elif|for|while|with|in|True|False|None|try|except|raise|yield|lambda|pass|assert|and|or|not)\b|\b\d+(?:\.\d+)?\b/g;
  let end = 0, html = '';
  for (const match of code.matchAll(pattern)) {
    html += esc(code.slice(end, match.index));
    const token = match[0];
    const kind = token.startsWith('#') ? 'comment' : /^["']/.test(token) ? 'string' : /^\d/.test(token) ? 'number' : 'keyword';
    html += token.split('\n').map(part=>`<span class="token-${kind}">${esc(part)}</span>`).join('\n');
    end = match.index + token.length;
  }
  html += esc(code.slice(end));
  return html.split('\n').map(line=>`<span class="code-line">${line}</span>`).join('');
}
async function load() {
  const id = new URLSearchParams(location.search).get('id');
  try {
    const indexResponse = await fetch('data/algorithms.json');
    if (!indexResponse.ok) throw new Error('The catalog could not be loaded.');
    const index = await indexResponse.json();
    if (!id || !index.algorithms.some(a=>a.id === id)) {
      main.innerHTML = '<p class="eyebrow">ALGORITHM EXPLORER</p><h1>No implementation selected.</h1><p class="hero-description">This page displays source-backed entries from the catalog. Choose an available implementation from the explorer.</p><a class="button primary" href="index.html#explorer">Open explorer →</a>';
      return;
    }
    const response = await fetch(`data/${encodeURIComponent(id)}.json`);
    if (!response.ok) throw new Error('The implementation could not be loaded.');
    const a = await response.json();
    document.title = `${a.name} — TheUnsolvedDev`;
    main.innerHTML = `<a class="text-link" href="index.html#explorer">← Explorer</a><p class="eyebrow" style="margin-top:30px">${esc(a.category)}</p><h1>${esc(a.name)}</h1><div class="tags"><span class="tag">${esc(a.framework)}</span><span class="tag">${esc(a.status)}</span></div><p>${esc(a.description)}</p><p class="small mono">${esc(a.path)} · ${a.sources.length} source files</p><section class="detail-section"><h2>Idea & documentation</h2><p>The original documentation is authoritative. Equations, intuition, and complexity are shown only when documented in the source.</p>${a.readmes.length ? a.readmes.map(r=>`<details><summary>${esc(r.path)}</summary><p><a href="${esc(r.url)}">Original documentation ↗</a></p><pre class="source-doc">${esc(r.text)}</pre></details>`).join('') : '<p>No local README accompanies this source group. Refer to docstrings in the source viewer below.</p>'}</section><section class="detail-section"><h2>TensorFlow operations</h2><p>These are literal matches in the source, not claims of device compatibility or measured acceleration.</p><div class="tags">${a.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('') || '<span>No recognized operation markers.</span>'}</div><p>Inspect the functions below to trace tensor inputs, transformations, and outputs. An equation-to-code explanation needs implementation-specific review.</p></section><section class="detail-section"><h2>Read the implementation</h2><div class="file-tabs" aria-label="Choose source file"></div><div class="source-toolbar"><a id="source-link" class="text-link">View on GitHub ↗</a><div><button id="copy">Copy source</button> <span id="copy-status" class="small" role="status"></span></div></div><pre class="source-code" tabindex="0" aria-label="Source code with line numbers"><code id="code"></code></pre></section><section class="detail-section"><h2>Execution & experiments</h2><p>No runtime validation, complexity claim, or performance result is inferred from imports. Consult the original documentation for execution requirements and experiment configuration.</p></section>`;
    let selected = a.sources[0];
    const tabs = main.querySelector('.file-tabs');
    function select(source, button) {selected = source; main.querySelector('#code').innerHTML = highlight(source.code); main.querySelector('#source-link').href = source.url; tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed', b === button)); main.querySelector('#copy-status').textContent = '';}
    a.sources.forEach((source,i)=>{const button = document.createElement('button'); button.textContent = source.path; tabs.append(button); button.addEventListener('click',()=>select(source,button)); if (!i) select(source,button);});
    main.querySelector('#copy').addEventListener('click',async()=>{try {await navigator.clipboard.writeText(selected.code); main.querySelector('#copy-status').textContent = 'Copied';} catch {main.querySelector('#copy-status').textContent = 'Clipboard unavailable. Select the code to copy manually.';}});
  } catch (error) {main.innerHTML = `<h1>Unable to open this entry.</h1><p>${esc(error.message)}</p><a class="button secondary" href="index.html#explorer">Return to explorer</a>`;}
}
load();
