'use strict';
const main = document.querySelector('#main');
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function load() {
  const id = new URLSearchParams(location.search).get('id');
  try {
    const response = await fetch('data/tensorflowai.json');
    if (!response.ok) throw new Error('The TensorflowAI catalog could not be loaded.');
    const data = await response.json();
    const a = data.entries.find(entry => entry.id === id);
    if (!a) { main.innerHTML = '<p class="eyebrow">IMPLEMENTATION MAP</p><h1>No project selected.</h1><p class="hero-description">Choose a project family from the laboratory map.</p><a class="button primary" href="index.html#explorer">Open the work map →</a>'; return; }
    document.title = `${a.name} — TheUnsolvedDev`;
    const source = `https://github.com/TheUnsolvedDev/TensorflowAI/tree/main/${a.path}`;
    const readme = `https://github.com/TheUnsolvedDev/TensorflowAI/blob/main/${a.readme}`;
    main.innerHTML = `<a class="text-link" href="index.html#explorer">← Work map</a><p class="eyebrow" style="margin-top:30px">${esc(a.category)}</p><h1>${esc(a.name)}</h1><div class="tags"><span class="tag">${esc(a.framework)}</span><span class="tag">${esc(a.status)}</span></div><p class="hero-description">${esc(a.description)}</p><section class="detail-section"><h2>Implementation map</h2><div class="detail-flow"><span>Question</span><i>→</i><strong>Architecture / algorithm</strong><i>→</i><span>TensorFlow implementation</span><i>→</i><span>Experiment</span></div><p>This page is a guided index into the external source repository. It describes the implementation family at the level supported by its documentation and keeps runtime results separate from source presence.</p><div class="tags">${a.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div></section><section class="detail-section"><h2>Read the source</h2><p>The implementation remains in TensorflowAI so its original files, history, configuration, and local runtime assumptions stay together.</p><a class="button primary" href="${esc(source)}">Open source directory ↗</a> <a class="button secondary" href="${esc(readme)}">Read documentation ↗</a><p class="small mono" style="margin-top:20px">${esc(a.path)}</p></section>`;
  } catch (error) { main.innerHTML = `<h1>Unable to open this entry.</h1><p>${esc(error.message)}</p><a class="button secondary" href="index.html#explorer">Return to work map</a>`; }
}
load();
