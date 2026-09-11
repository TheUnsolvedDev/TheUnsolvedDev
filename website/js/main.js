'use strict';
const $ = (s) => document.querySelector(s);
const escapeHTML = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const detailURL = (id) => `algorithm.html?id=${encodeURIComponent(id)}`;
const menu = $('.menu-toggle');
menu.addEventListener('click', () => {const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', open); $('#navigation').classList.toggle('open', open);});
$('#navigation').addEventListener('click', (e) => {if (e.target.closest('a')) {menu.setAttribute('aria-expanded', 'false'); $('#navigation').classList.remove('open');}});
document.addEventListener('keydown', e => {if (e.key === 'Escape') {menu.setAttribute('aria-expanded', 'false'); $('#navigation').classList.remove('open');} if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {e.preventDefault(); $('#search').focus();}});
$('.lab-toggle').addEventListener('click', e => {const on = document.body.classList.toggle('lab-on'); e.currentTarget.setAttribute('aria-pressed', on);});
const stages = [
  ['Start with a question.', 'Make the assumptions explicit. Understand the idea before writing the implementation.'],
  ['Give the idea a representation.', 'Think about shapes, batches, and operations. The cube illustrates a tensor concept; it is not a computed result.'],
  ['Follow the computation.', 'Investigate the implementation and its execution. Hardware performance needs measurements from real experiments.']
];
document.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => {document.querySelectorAll('[data-stage]').forEach(b => {b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', b === button);}); const stage = stages[Number(button.dataset.stage)]; $('#stage-name').textContent = stage[0]; $('#stage-description').textContent = stage[1];}));
for (const [selector, count] of [['.cpu-cores', 8], ['.gpu-cores', 40]]) {for (let i = 0; i < count; i++) {const cell = document.createElement('span'); cell.style.animationDelay = `${i * .06}s`; $(selector).append(cell);}}
const header = $('.site-header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 15), {passive:true});
const observer = new IntersectionObserver(entries => {entries.forEach(entry => {if (entry.isIntersecting) {document.querySelectorAll('#navigation a').forEach(a => {const active = a.hash === `#${entry.target.id}`; a.classList.toggle('active', active); if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');});}});}, {rootMargin:'-15% 0px -55% 0px'});
document.querySelectorAll('section[id]').forEach(section => observer.observe(section));

async function init() {
  try {
    const response = await fetch('data/algorithms.json');
    if (!response.ok) throw new Error('Catalog unavailable');
    const data = await response.json();
    const stats = [['modules','TensorFlow source groups'], ['categories','Source categories'], ['notebooks','Notebooks'], ['documents','Project documents']];
    $('#stats').innerHTML = stats.map(([key,label]) => `<div class="stat"><strong>${data.stats[key]}</strong><span>${label.toUpperCase()}</span></div>`).join('');
    $('#methodology').textContent = data.methodology;
    let category = 'All';
    const categories = ['All', ...new Set(data.algorithms.map(a => a.category))];
    $('#filters').replaceChildren(...categories.map(value => {const button = document.createElement('button'); button.textContent = value; button.setAttribute('aria-pressed', value === category); button.addEventListener('click', () => {category = value; document.querySelectorAll('#filters button').forEach(b => b.setAttribute('aria-pressed', b === button)); render();}); return button;}));
    function render() {
      const query = $('#search').value.toLowerCase().trim();
      const filtered = data.algorithms.filter(a => (category === 'All' || a.category === category) && [a.name,a.description,a.category,a.framework,...a.tags].join(' ').toLowerCase().includes(query));
      $('#result-count').textContent = `${filtered.length} of ${data.algorithms.length} source groups`;
      $('#algorithm-grid').innerHTML = filtered.length ? filtered.map((a,i) => `<article class="card"><div class="card-top"><span>${escapeHTML(a.category)}</span><span>${String(i+1).padStart(2,'0')}</span></div><h3><a href="${detailURL(a.id)}">${escapeHTML(a.name)}</a></h3><p>${escapeHTML(a.description)}</p><div class="tags"><span class="tag">${escapeHTML(a.framework)}</span>${a.tags.map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}</div><p class="small">${escapeHTML(a.status)}</p><a class="text-link" href="${detailURL(a.id)}">Explore implementation →</a></article>`).join('') : `<div class="empty-state"><div class="empty-symbol" aria-hidden="true">[ &nbsp; ∅ &nbsp; ]</div><h3>${data.algorithms.length ? 'No matching implementations' : 'The next entry starts with source code.'}</h3><p>${data.algorithms.length ? 'Try another name, concept, or category.' : 'This checkout contains the researcher’s profile README. No local TensorFlow implementations were found, so the algorithm catalog is currently empty.'}</p>${data.algorithms.length ? '<button class="button secondary" id="reset-search">Reset search and filters</button>' : '<a class="text-link" href="#repository">Inspect the repository map →</a>'}</div>`;
      const reset = $('#reset-search');
      if (reset) reset.addEventListener('click', () => {$('#search').value = ''; $('#filters button').click(); $('#search').focus();});
    }
    $('#search').addEventListener('input', render); render();
    $('#research-grid').innerHTML = data.highlights.map((h,i) => `<article class="card"><div class="card-top"><span>SELECTED PROJECT</span><span>${String(i+1).padStart(2,'0')} / BUILD</span></div><h3>${escapeHTML(h.name)}</h3><p>${escapeHTML(h.description)}</p><div class="tags">${h.tags.map(t=>`<span class="tag">${escapeHTML(t)}</span>`).join('')}</div>${h.details?.length ? `<ul class="project-details">${h.details.map(t=>`<li>${escapeHTML(t)}</li>`).join('')}</ul>` : ''}<a class="text-link" href="${escapeHTML(h.project_url || h.url)}">${h.project_url ? 'Explore the repository' : 'Read the project background'} ↗</a></article>`).join('');
    $('#repo-tree').innerHTML = Object.entries(data.inventory).filter(([,items]) => items.length).map(([type,items]) => `<details open><summary>${escapeHTML(type)} <span class="small">(${items.length})</span></summary>${items.map(item => `<a href="${escapeHTML(item.url)}">↳ ${escapeHTML(item.path)} ↗</a>`).join('')}</details>`).join('');
    $('#learning-links').innerHTML = data.algorithms.map(a=>`<a class="text-link" href="${detailURL(a.id)}">${escapeHTML(a.category)} / ${escapeHTML(a.name)} →</a>`).join('');
    const artifacts = [...data.inventory.images,...data.inventory.data,...data.inventory.notebooks];
    if (artifacts.length) {
      $('.experiment-empty h3').textContent = 'Artifacts in the repository';
      $('.experiment-empty p').textContent = 'Files discovered by extension. Presence does not establish that an artifact is a measured result.';
      $('.experiment-empty .pill').textContent = `${artifacts.length} FILES`;
      $('#artifact-list').innerHTML = artifacts.map(x=>`<p><a class="text-link" href="${escapeHTML(x.url)}">${escapeHTML(x.path)} ↗</a></p>`).join('');
    }
  } catch (error) {
    $('#stats').textContent = 'Repository inventory could not be loaded.';
    $('#result-count').textContent = 'Catalog unavailable';
    $('#algorithm-grid').innerHTML = '<div class="empty-state"><h3>Unable to load the catalog</h3><p>Serve the website over HTTP and check that data/algorithms.json is available.</p><button class="button secondary" id="retry">Retry</button></div>';
    $('#retry').addEventListener('click', () => location.reload());
  }
}
init();
