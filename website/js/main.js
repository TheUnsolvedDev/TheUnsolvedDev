'use strict';
const $ = (s) => document.querySelector(s);
const escapeHTML = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const menu = $('.menu-toggle');
menu.addEventListener('click', () => {const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', open); $('#navigation').classList.toggle('open', open);});
$('#navigation').addEventListener('click', (e) => {if (e.target.closest('a')) {menu.setAttribute('aria-expanded', 'false'); $('#navigation').classList.remove('open');}});
document.addEventListener('keydown', e => {if (e.key === 'Escape') {menu.setAttribute('aria-expanded', 'false'); $('#navigation').classList.remove('open');} if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {e.preventDefault(); $('#search').focus();}});
$('.lab-toggle').addEventListener('click', e => {const on = document.body.classList.toggle('lab-on'); e.currentTarget.setAttribute('aria-pressed', on);});
const stages = [
  ['Data enters as a representation.', 'Shapes, batches, and features make the mathematical idea executable.'],
  ['Layers transform the signal.', 'Weights and nonlinearities build a representation that can be optimized.'],
  ['A prediction becomes evidence.', 'The output is compared with a target, producing the loss that drives an update.']
];
document.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => {document.querySelectorAll('[data-stage]').forEach(b => {b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', b === button);}); const stage = stages[Number(button.dataset.stage)]; $('#stage-name').textContent = stage[0]; $('#stage-description').textContent = stage[1];}));
for (const [selector, count] of [['.cpu-cores', 8], ['.gpu-cores', 40]]) {for (let i = 0; i < count; i++) {const cell = document.createElement('span'); cell.style.animationDelay = `${i * .06}s`; $(selector).append(cell);}}
const header = $('.site-header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 15), {passive:true});
const observer = new IntersectionObserver(entries => {entries.forEach(entry => {if (entry.isIntersecting) {document.querySelectorAll('#navigation a').forEach(a => {const active = a.hash === `#${entry.target.id}`; a.classList.toggle('active', active); if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');});}});}, {rootMargin:'-15% 0px -55% 0px'});
document.querySelectorAll('section[id]').forEach(section => observer.observe(section));

const qGrid = $('#q-grid');
if (qGrid) {
  const cols = 5, rows = 3, start = 10, goal = 4, walls = new Set([6, 8]);
  const actions = [[-1, 0, '↑'], [1, 0, '↓'], [0, -1, '←'], [0, 1, '→']];
  const q = Array.from({length: rows * cols}, () => [0, 0, 0, 0]);
  let episode = 0, successes = 0, current = start, lastState = start;
  const cells = Array.from({length: rows * cols}, (_, i) => {const cell = document.createElement('span'); cell.textContent = i === goal ? 'G' : walls.has(i) ? 'X' : ''; cell.className = i === goal ? 'goal' : walls.has(i) ? 'wall' : ''; qGrid.append(cell); return cell;});
  function valid(s, action) { const r = Math.floor(s / cols), c = s % cols, nr = r + action[0], nc = c + action[1], ns = nr * cols + nc; return nr >= 0 && nr < rows && nc >= 0 && nc < cols && !walls.has(ns) ? ns : s; }
  function drawQ() { cells.forEach((cell, i) => { cell.classList.toggle('agent', i === current); if (!cell.classList.contains('wall') && i !== goal) { const best = Math.max(...q[i]); cell.dataset.policy = best > .05 ? actions[q[i].indexOf(best)][2] : '·'; cell.style.background = best > 0 ? `linear-gradient(135deg, #173943 ${Math.min(80, best * 9)}%, #121a28)` : ''; } }); const table = $('#q-table'); table.innerHTML = `<span>Q-values for state ${lastState}</span>` + actions.map((a, i) => `<div><b>${a[2]}</b><i style="width:${Math.min(100, Math.abs(q[lastState][i]) * 8)}%"></i><em>${q[lastState][i].toFixed(2)}</em></div>`).join(''); }
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function trainEpisode(animate) { let state = start, steps = 0, reward = 0; current = state; drawQ(); while (steps++ < 80) { const epsilon = Math.max(.08, .8 - episode * .015), ai = Math.random() < epsilon ? Math.floor(Math.random() * 4) : q[state].indexOf(Math.max(...q[state])); const next = valid(state, actions[ai]); const done = next === goal, r = done ? 10 : next === state ? -1 : -.04, target = r + (done ? 0 : .9 * Math.max(...q[next])); q[state][ai] += .25 * (target - q[state][ai]); state = next; reward += r; current = state; lastState = state; drawQ(); if (animate) await pause(75); if (done) { successes++; break; } } episode++; current = state; $('#rl-episode').textContent = episode; $('#rl-steps').textContent = steps; $('#rl-reward').textContent = reward.toFixed(2); $('#rl-success').textContent = `${Math.round(successes / episode * 100)}%`; $('#rl-status').textContent = state === goal ? 'Goal reached: the final move earned +10.' : 'Episode ended: every transition updated the table.'; drawQ(); }
  let training = false; async function train(count) { if (training) return; training = true; document.querySelectorAll('[data-lab^="train"]').forEach(b => b.disabled = true); for (let i = 0; i < count; i++) await trainEpisode(count <= 10); training = false; document.querySelectorAll('[data-lab^="train"]').forEach(b => b.disabled = false); }
  $('[data-lab="train1"]').addEventListener('click', () => train(1)); $('[data-lab="train10"]').addEventListener('click', () => train(10)); $('[data-lab="train100"]').addEventListener('click', () => train(100)); $('[data-lab="reset-rl"]').addEventListener('click', () => {if (training) return; q.forEach(row => row.fill(0)); episode = successes = 0; current = lastState = start; ['rl-episode','rl-success'].forEach(id => {$('#' + id).textContent = id === 'rl-success' ? '0%' : '0';}); $('#rl-steps').textContent = $('#rl-reward').textContent = '—'; $('#rl-status').textContent = 'Untrained agent: actions are exploratory.'; drawQ();}); drawQ();
}
const network = $('#mini-network');
if (network) {
  const weights = [0.73, -0.42, 0.18, 0.61, -0.27, 0.84];
  const layers = [['inputs', 3], ['hidden', 4], ['outputs', 2]];
  layers.forEach(([name, count]) => {const layer = network.querySelector(`.${name}`); for (let i = 0; i < count; i++) {const node = document.createElement('button'); node.className = 'mini-node'; node.textContent = name === 'inputs' ? 'x' : name === 'hidden' ? 'σ' : 'ŷ'; node.dataset.value = (Math.random()).toFixed(2); node.addEventListener('click', () => {$('#activation-readout').textContent = `Activation: ${node.dataset.value} · ${name} neuron`;}); layer.append(node);}});
  const edgeBox = $('#network-edges'); const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('aria-hidden', 'true'); edgeBox.append(svg); const nodeGroups = [network.querySelectorAll('.inputs .mini-node'), network.querySelectorAll('.hidden .mini-node'), network.querySelectorAll('.outputs .mini-node')]; const edgeButtons = [];
  function connect(from, to, offset) { from.forEach((a, ai) => to.forEach((b, bi) => {const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); const weight = weights[(offset + ai * to.length + bi) % weights.length]; line.dataset.weight = weight; line.classList.add(weight >= 0 ? 'positive' : 'negative'); line.addEventListener('click', () => $('#activation-readout').textContent = `Weight: ${weight > 0 ? '+' : ''}${weight.toFixed(2)} · ${weight >= 0 ? 'supports' : 'inhibits'} this signal`); svg.append(line); edgeButtons.push(line); })); }
  connect(nodeGroups[0], nodeGroups[1], 0); connect(nodeGroups[1], nodeGroups[2], 2); function positionEdges() { const box = network.getBoundingClientRect(); const all = [nodeGroups[0], nodeGroups[1], nodeGroups[2]]; let index = 0; [[0,1],[1,2]].forEach(([a,b]) => all[a].forEach(from => all[b].forEach(to => {const f = from.getBoundingClientRect(), t = to.getBoundingClientRect(), line = edgeButtons[index++]; line.setAttribute('x1', f.left + f.width / 2 - box.left); line.setAttribute('y1', f.top + f.height / 2 - box.top); line.setAttribute('x2', t.left + t.width / 2 - box.left); line.setAttribute('y2', t.top + t.height / 2 - box.top);}))); } positionEdges(); window.addEventListener('resize', positionEdges);
  $('[data-lab="network"]').addEventListener('click', async () => { const input = [0.8, 0.35, 0.6]; const hidden = Array.from(nodeGroups[1], (_, i) => Math.max(0, Math.tanh(input[i % 3] * weights[i]))); const output = [hidden[0] * .7 + hidden[1] * -.3, hidden[2] * .5 + hidden[3] * .8]; const values = [...input, ...hidden, ...output.map(v => Math.max(0, v))]; [...nodeGroups[0], ...nodeGroups[1], ...nodeGroups[2]].forEach((node, i) => {node.dataset.value = values[i].toFixed(2); node.classList.remove('active');}); edgeButtons.forEach(line => line.classList.remove('flowing')); for (const group of nodeGroups) { group.forEach(node => node.classList.add('active')); $('#activation-readout').textContent = `Activation: ${Array.from(group).map(n => n.dataset.value).join(' · ')}`; edgeButtons.forEach(line => line.classList.add('flowing')); await pause(450); group.forEach(node => node.classList.remove('active')); } edgeButtons.forEach(line => line.classList.remove('flowing')); $('#network-status').textContent = 'Forward pass complete: weighted sums became hidden features, then outputs.'; });
}

async function init() {
  try {
    const response = await fetch('data/algorithms.json');
    if (!response.ok) throw new Error('Catalog unavailable');
    const data = await response.json();
    const externalResponse = await fetch('data/tensorflowai.json');
    if (!externalResponse.ok) throw new Error('TensorflowAI catalog unavailable');
    const external = await externalResponse.json();
    const entries = external.entries;
    const repositoryURL = external.repository;
    const stats = [['modules',entries.length,'CURATED IMPLEMENTATION FAMILIES'], ['categories',new Set(entries.map(a => a.category)).size,'TECHNICAL THREADS'], ['python','488+','CV SOURCE FILES'], ['notebooks','SEPARATE REPO','SOURCE LINKS']];
    $('#stats').innerHTML = stats.map(([key,value,label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
    $('#methodology').textContent = 'This is a curated map of the TensorflowAI, ReinforcementLearning, and JaxStormer repositories. Entries link to their original README and directory when available; descriptions distinguish source-backed work from README-backed repository maps. The portfolio does not copy implementation code or infer results.';
    let category = 'All';
    const categories = ['All', ...new Set(entries.map(a => a.category))];
    $('#filters').replaceChildren(...categories.map(value => {const button = document.createElement('button'); button.textContent = value; button.setAttribute('aria-pressed', value === category); button.addEventListener('click', () => {category = value; document.querySelectorAll('#filters button').forEach(b => b.setAttribute('aria-pressed', b === button)); render();}); return button;}));
    const repositoryLink = (entry, kind) => {
      const repo = entry.repository || repositoryURL;
      const path = entry.path ? encodeURIComponent(kind === 'tree' ? entry.path : entry.readme).replace(/%2F/g, '/') : '';
      return path ? `${repo}/${kind}/main/${path}` : `${repo}/blob/main/${encodeURIComponent(entry.readme).replace(/%2F/g, '/')}`;
    };
    function render() {
      const query = $('#search').value.toLowerCase().trim();
      const filtered = entries.filter(a => (category === 'All' || a.category === category) && [a.name,a.description,a.category,a.framework,...a.tags].join(' ').toLowerCase().includes(query));
      $('#result-count').textContent = `${filtered.length} of ${entries.length} implementation families`;
      $('#algorithm-grid').innerHTML = filtered.length ? filtered.map((a,i) => {
        const trace = a.path ? `<p>${escapeHTML(a.path)}</p><a class="text-link" href="${repositoryLink(a, 'tree')}">Open source directory ↗</a><br>` : '';
        return `<article class="card"><div class="card-top"><span>${escapeHTML(a.category)}</span><span>${String(i+1).padStart(2,'0')}</span></div><h3>${escapeHTML(a.name)}</h3><p>${escapeHTML(a.description)}</p><div class="tags"><span class="tag">${escapeHTML(a.framework)}</span>${a.tags.map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}</div><p class="small">${escapeHTML(a.status)}</p><details class="project-detail"><summary>Trace the work →</summary>${trace}<a class="text-link" href="${repositoryLink(a, 'blob')}">Read documentation ↗</a></details></article>`;
      }).join('') : `<div class="empty-state"><div class="empty-symbol" aria-hidden="true">[ &nbsp; ∅ &nbsp; ]</div><h3>No matching implementation families</h3><p>Try another name, concept, or category.</p><button class="button secondary" id="reset-search">Reset search and filters</button></div>`;
      const reset = $('#reset-search');
      if (reset) reset.addEventListener('click', () => {$('#search').value = ''; $('#filters button').click(); $('#search').focus();});
    }
    $('#search').addEventListener('input', render); render();
    $('#research-grid').innerHTML = data.highlights.map((h,i) => `<article class="card"><div class="card-top"><span>SELECTED PROJECT</span><span>${String(i+1).padStart(2,'0')} / BUILD</span></div><h3>${escapeHTML(h.name)}</h3><p>${escapeHTML(h.description)}</p><div class="tags">${h.tags.map(t=>`<span class="tag">${escapeHTML(t)}</span>`).join('')}</div>${h.details?.length ? `<ul class="project-details">${h.details.map(t=>`<li>${escapeHTML(t)}</li>`).join('')}</ul>` : ''}<a class="text-link" href="${escapeHTML(h.project_url || h.url)}">${h.project_url ? 'Explore the repository' : 'Read the project background'} ↗</a></article>`).join('');
    $('#repo-tree').innerHTML = Object.entries(data.inventory).filter(([,items]) => items.length).map(([type,items]) => `<details open><summary>${escapeHTML(type)} <span class="small">(${items.length})</span></summary>${items.map(item => `<a href="${escapeHTML(item.url)}">↳ ${escapeHTML(item.path)} ↗</a>`).join('')}</details>`).join('');
    $('#learning-links').innerHTML = entries.slice(0,6).map(a=>`<a class="text-link" href="#explorer" data-focus-entry="${escapeHTML(a.id)}">${escapeHTML(a.category)} / ${escapeHTML(a.name)} →</a>`).join('');
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
