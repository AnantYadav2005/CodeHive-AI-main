'use strict';

const OLLAMA_URL = "http://localhost:11434/api/generate";

const EXAMPLE_CODE = `def find_duplicates(arr):
    duplicates = []
    for i in range(len(arr)):
        for j in range(i, len(arr)):
            if arr[i] == arr[j]:
                duplicates.append(arr[i])
    return duplicates

numbers = [1, 2, 3, 2, 4, 3, 5]
print(find_duplicates(numbers))`;


let isRunning = false;

const $ = id => document.getElementById(id);

const DOM = {
  codeInput: $('code-input'),
  langSelect: $('lang-select'),
  lineNumbers: $('line-numbers'),
  charCount: $('char-count'),
  btnAnalyze: $('btn-analyze'),
  btnText: document.querySelector('#btn-analyze .btn-text'),
  btnSpinner: document.querySelector('#btn-analyze .btn-spinner'),

  btnClear: $('btn-clear'),
  btnExample: $('btn-example'),

  btnRetry: $('btn-retry'),
  btnCopyOpt: $('btn-copy-opt'),
  outputSection: $('output-section'),
  progressWrap: $('progress-wrap'),
  progressFill: $('progress-fill'),
  progressLabel: $('progress-label'),
  resultsWrapper: $('results-wrapper'),
  errorState: $('error-state'),
  errorMsg: $('error-msg'),

  explainEli5: $('explain-eli5'),
  explainTech: $('explain-technical'),
  explainSteps: $('explain-steps'),

  bugsList: $('bugs-list'),
  edgeCasesBlock: $('edge-cases-block'),
  edgeCasesList: $('edge-cases-list'),

  complexOrig: $('complexity-original'),
  complexImprov: $('complexity-improved'),
  optLangLabel: $('opt-lang-label'),
  optimizedCode: $('optimized-code'),
  optNotes: $('opt-notes'),

  docSections: $('doc-sections'),

  scoreReadNum: $('score-num-readability'),
  scorePerfNum: $('score-num-performance'),
  scoreMaintNum: $('score-num-maintainability'),
  ringRead: $('ring-readability'),
  ringPerf: $('ring-performance'),
  ringMaint: $('ring-maintainability'),
  reviewSummary: $('review-summary'),
  confidenceBadge: $('confidence-badge'),
};

function init() {

  DOM.codeInput.addEventListener('input', onCodeInput);
  DOM.codeInput.addEventListener('scroll', syncScroll);
  DOM.codeInput.addEventListener('keydown', handleTab);
  DOM.langSelect.addEventListener('change', updateAnalyzeBtn);

  DOM.btnAnalyze.addEventListener('click', runAgents);
  DOM.btnClear.addEventListener('click', clearAll);
  DOM.btnExample.addEventListener('click', loadExample);
  DOM.btnRetry.addEventListener('click', runAgents);
  DOM.btnCopyOpt.addEventListener('click', copyOptimizedCode);

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  updateCharCount();
  updateAnalyzeBtn();
}

function onCodeInput() {
  updateLineNumbers();
  updateCharCount();
  updateAnalyzeBtn();
}

function updateLineNumbers() {
  const lines = DOM.codeInput.value.split('\n').length;
  DOM.lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
}

function updateCharCount() {
  const code = DOM.codeInput.value;
  const lines = code ? code.split('\n').length : 0;
  const chars = code.length;
  DOM.charCount.textContent = `${lines} line${lines !== 1 ? 's' : ''} · ${chars} character${chars !== 1 ? 's' : ''}`;
}

function syncScroll() {
  DOM.lineNumbers.scrollTop = DOM.codeInput.scrollTop;
}

function handleTab(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = DOM.codeInput.selectionStart;
    const end = DOM.codeInput.selectionEnd;
    const val = DOM.codeInput.value;
    DOM.codeInput.value = val.substring(0, start) + '  ' + val.substring(end);
    DOM.codeInput.selectionStart = DOM.codeInput.selectionEnd = start + 2;
    onCodeInput();
  }
}

function updateAnalyzeBtn() {
  const hasCode = DOM.codeInput.value.trim().length > 0;
  DOM.btnAnalyze.disabled = !(hasCode) || isRunning;
}

function clearAll() {
  DOM.codeInput.value = '';
  onCodeInput();
  DOM.outputSection.hidden = true;
  resetAgentNodes();
}

function loadExample() {
  DOM.codeInput.value = EXAMPLE_CODE;
  DOM.langSelect.value = 'python';
  onCodeInput();
}


async function animatePipeline(doneSignal) {
  const names = ['Code Analyzer', 'Bug Detector', 'Optimizer', 'Doc Generator', 'Reviewer'];
  resetAgentNodes();
  for (let i = 0; i < 5; i++) {
    if (doneSignal.done) break;
    setAgentStatus(i, 'active', 'Processing...');
    setProgress(10 + i * 16, `${names[i]} is working...`);
    await sleep(900);
    if (!doneSignal.done) setAgentStatus(i, 'done', 'Done ✓');
  }
}

async function runAgents() {
  const code = DOM.codeInput.value.trim();
  const lang = DOM.langSelect.value;
  if (!code || isRunning) return;

  isRunning = true;
  DOM.btnAnalyze.disabled = true;
  DOM.btnText.textContent = 'Analyzing...';
  DOM.btnSpinner.hidden = false;

  DOM.outputSection.hidden = false;
  DOM.resultsWrapper.hidden = true;
  DOM.errorState.hidden = true;
  DOM.progressWrap.hidden = false;

  setProgress(5, 'Initializing agents...');
  setTimeout(() => DOM.outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

  const signal = { done: false };

  try {
//     const prompt = `
// You are CodeHive AI.

// Analyze the following ${lang} code.

// Return ONLY valid JSON.

// {
//   "eli5": "Explain code to a beginner",
//   "technical": "Detailed technical explanation",
//   "steps": [
//     "step1",
//     "step2"
//   ],
//   "bugs": [
//     {
//       "id": 1,
//       "type": "Logic Error",
//       "issue": "description",
//       "fix": "solution"
//     }
//   ],
//   "edgeCases": [
//     "edge case 1"
//   ],
//   "originalComplexity": "O(n²)",
//   "improvedComplexity": "O(n)",
//   "optimizedCode": "optimized code here",
//   "notes": "optimization notes",
//   "docstring": "documentation",
//   "inlineCommentedCode": "commented code",
//   "apiDoc": "api docs",
//   "scores": {
//     "readability": 8,
//     "performance": 8,
//     "maintainability": 8
//   },
//   "improvements": [
//     "improvement1"
//   ],
//   "confidence": "High",
//   "summary": "overall review"
// }

// Code:
// ${code}

// Return ONLY JSON.
// Do not use markdown.
// Do not use backticks.
// `;
    const prompt = `
You are DevMind AI — a multi-agent system with 5 expert agents: Analyzer, Bug Detector, Optimizer, Documentation Generator, and Reviewer.

Analyze this ${lang} code and Return JSON in this format:

{
  "eli5": "...",
  "technical": "...",
  "steps": ["..."],
  "bugs": [],
  "edgeCases": [],
  "originalComplexity": "...",
  "improvedComplexity": "...",
  "optimizedCode": "...",
  "notes": "...",
  "docstring": "...",
  "inlineCommentedCode": "...",
  "apiDoc": "...",
  "scores": { "readability": 7, "performance": 7, "maintainability": 7 },
  "improvements": ["..."],
  "confidence": "High",
  "summary": "..."
}

Code:
${code}

IMPORTANT:
- Return JSON only
- No explanation outside JSON
`;

    const [, raw] = await Promise.all([
      animatePipeline(signal),
      callOllamaWithRetry(prompt)
    ]);

    console.log("RAW RESPONSE:", raw);
    signal.done = true;

    for (let i = 0; i < 5; i++) setAgentStatus(i, 'done', 'Done ✓');
    setProgress(100, 'All agents completed! ✅');
    await sleep(350);

    const result = parseJSON(raw);
    renderResults([result, result, result, result, result], lang);

    DOM.progressWrap.hidden = true;
    DOM.resultsWrapper.hidden = false;
    switchTab('explanation');
    DOM.resultsWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    signal.done = true;
    console.error('[DevMind AI]', err);
    DOM.progressWrap.hidden = true;
    DOM.errorState.hidden = false;
    DOM.errorMsg.textContent = err.message || 'Unknown error. Check console for details.';
    resetAgentNodes();
  } finally {
    isRunning = false;
    DOM.btnText.textContent = 'Run All Agents';
    DOM.btnSpinner.hidden = true;
    updateAnalyzeBtn();
  }
}


async function callOllama(prompt) {
  const resp = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    // body: JSON.stringify({
    //   model: "llama3",
    //   prompt: prompt,
    //   stream: false,
    body: JSON.stringify({
  // model: "qwen3:8b",
  model: "llama3",
  prompt: prompt,
  stream: false,
  format: "json"
})
    
  });

  if (!resp.ok) {
    throw new Error("Ollama API error — is Ollama running?");
  }

  // const data = await resp.json();
  // return data.response;
  const data = await resp.json();

console.log("OLLAMA RAW RESPONSE:");
console.log(data.response);

return data.response;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callOllamaWithRetry(prompt, attempt = 1, maxAttempts = 3) {
  try {
    return await callOllama(prompt);
  } catch (err) {
    if (attempt < maxAttempts) {
      console.warn("Retrying...");
      await delay(2000);
      return callOllamaWithRetry(prompt, attempt + 1, maxAttempts);
    }
    throw err;
  }
}


function parseJSON(raw) {
  if (!raw) return {};
  let cleaned = raw
    .replace(/^```[a-z]*\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try { return JSON.parse(cleaned); } catch { }
  try {
    const repaired = cleaned
      .replace(/(?<=[:\s,\[{])\s*"((?:[^"\\]|\\.)*)"/gs, (m, inner) =>
        JSON.stringify(inner)
      );
    return JSON.parse(repaired);
  } catch {  }

  const bracket = cleaned.indexOf('{');
  if (bracket !== -1) {
    try { return JSON.parse(cleaned.slice(bracket)); } catch { }
  }

  console.warn('[DevMind] JSON parse failed, raw response:', raw);
  return { _raw: raw };
}

function renderResults([r0, r1, r2, r3, r4], lang) {
  renderExplanation(r0);
  renderBugs(r1);
  renderOptimizer(r2, lang);
  renderDocs(r3);
  renderReview(r4);
}

function renderExplanation(data) {
  DOM.explainEli5.className = 'explain-body md-inline';
  DOM.explainTech.className = 'explain-body md-inline';
  DOM.explainEli5.innerHTML = escapeAndFormat(data?.eli5 || 'No explanation available.');
  DOM.explainTech.innerHTML = escapeAndFormat(data?.technical || 'No technical explanation available.');

  DOM.explainSteps.innerHTML = '';
  const steps = data?.steps || [];
  if (steps.length) {
    steps.forEach(s => {
      const li = document.createElement('li');
      li.className = 'md-inline';
      li.innerHTML = escapeAndFormat(s);
      DOM.explainSteps.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No steps available.';
    DOM.explainSteps.appendChild(li);
  }
}

function renderBugs(data) {
  DOM.bugsList.innerHTML = '';
  const bugs = data?.bugs || [];

  if (bugs.length === 0) {
    DOM.bugsList.innerHTML = `
      <div class="no-bugs">
        <div class="no-bugs-icon">✅</div>
        <div>No bugs detected! Your code looks clean.</div>
      </div>`;
  } else {
    bugs.forEach((bug, idx) => {
      const typeClass = (bug.type || '').toLowerCase().replace(/\s+/g, '');
      const item = document.createElement('div');
      item.className = 'bug-item';
      item.innerHTML = `
        <div class="bug-header">
          <span class="bug-num">BUG #${bug.id || idx + 1}</span>
          <span class="bug-type-badge ${typeClass}">${esc(bug.type || 'Unknown')}</span>
        </div>
        <div class="bug-section-label">Issue</div>
        <div class="bug-text md-inline">${escapeAndFormat(bug.issue || 'No description.')}</div>
        <div class="bug-section-label">Suggested Fix</div>
        <pre class="bug-fix">${esc(bug.fix || 'No fix provided.')}</pre>
      `;
      DOM.bugsList.appendChild(item);
    });
  }

  const edges = data?.edgeCases || [];
  if (edges.length) {
    DOM.edgeCasesBlock.hidden = false;
    DOM.edgeCasesList.innerHTML = '';
    edges.forEach(e => {
      const li = document.createElement('li');
      li.className = 'md-inline';
      li.innerHTML = escapeAndFormat(e);
      DOM.edgeCasesList.appendChild(li);
    });
  } else {
    DOM.edgeCasesBlock.hidden = true;
  }
}

function renderOptimizer(data, lang) {
  DOM.complexOrig.textContent = data?.originalComplexity || '—';
  DOM.complexImprov.textContent = data?.improvedComplexity || '—';
  DOM.optLangLabel.textContent = lang
    ? `Optimized ${lang.charAt(0).toUpperCase() + lang.slice(1)} Code`
    : 'Optimized Code';
  DOM.optimizedCode.textContent = data?.optimizedCode || '// No optimized code provided.';
  DOM.optNotes.innerHTML = data?.notes
    ? `<em>${escapeAndFormat(data.notes)}</em>`
    : '';
}

function renderDocs(data) {
  DOM.docSections.innerHTML = '';

  const sections = [
    { title: 'Docstring', key: 'docstring', isCode: true },
    { title: 'Inline Commented Code', key: 'inlineCommentedCode', isCode: true },
    { title: 'API Documentation', key: 'apiDoc', isCode: false },
  ];

  sections.forEach(sec => {
    const content = data?.[sec.key];
    if (!content || content === 'N/A') return;

    const block = document.createElement('div');
    block.className = 'doc-block';
    block.innerHTML = `
      <div class="doc-block-title">${esc(sec.title)}</div>
      <div class="doc-block-content">
        ${sec.isCode
        ? `<pre class="doc-code">${esc(content)}</pre>`
        : `<div class="md-inline">${escapeAndFormat(content)}</div>`
      }
      </div>
    `;
    DOM.docSections.appendChild(block);
  });

  if (DOM.docSections.children.length === 0) {
    DOM.docSections.innerHTML = `
      <div style="color:var(--text-muted);font-size:14px;padding:16px 0;">
        No documentation generated.
      </div>`;
  }
}

function renderReview(data) {
  try {
    const scores = data?.scores || {};

    const read = clamp(Number(scores.readability), 1, 10);
    const perf = clamp(Number(scores.performance), 1, 10);
    const maint = clamp(Number(scores.maintainability), 1, 10);

    const CIRC = 201;
    setRing(DOM.ringRead, read, CIRC);
    setRing(DOM.ringPerf, perf, CIRC);
    setRing(DOM.ringMaint, maint, CIRC);

    DOM.scoreReadNum.textContent = read >= 1 ? `${read}/10` : '—';
    DOM.scorePerfNum.textContent = perf >= 1 ? `${perf}/10` : '—';
    DOM.scoreMaintNum.textContent = maint >= 1 ? `${maint}/10` : '—';

    const improvements = Array.isArray(data?.improvements) ? data.improvements : [];
    let summaryHTML = '';

    if (improvements.length) {
      summaryHTML += '<div class="review-key-improvements">';
      improvements.forEach(imp => {
        if (!imp) return;
        summaryHTML += `<div class="review-item">
          <div class="review-item-dot"></div>
          <div class="md-inline">${escapeAndFormat(String(imp))}</div>
        </div>`;
      });
      summaryHTML += '</div>';
    }

    if (data?.summary) {
      summaryHTML += `<div class="md-inline" style="font-size:14px;color:var(--text-muted);
        line-height:1.75;margin-top:14px;">${escapeAndFormat(String(data.summary))}</div>`;
    }

    DOM.reviewSummary.innerHTML = summaryHTML ||
      '<span style="color:var(--text-faint)">Review data unavailable — re-run to retry.</span>';

    const rawConf = String(data?.confidence || 'Medium');
    const confClass = rawConf.toLowerCase().replace(/[^a-z]/g, '') || 'medium';
    DOM.confidenceBadge.className = `confidence-badge ${confClass}`;
    DOM.confidenceBadge.textContent = `Confidence: ${rawConf}`;

  } catch (err) {
    console.error('[DevMind] renderReview error:', err);
    DOM.reviewSummary.innerHTML =
      `<span style="color:var(--red-light)">⚠️ Reviewer render error: ${esc(err.message)}</span>`;
  }
}

function setRing(el, score, circ) {
  if (!el) return;
  const offset = circ - (score / 10) * circ;
  requestAnimationFrame(() => {
    setTimeout(() => { el.style.strokeDashoffset = offset; }, 100);
  });
}

function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    const isActive = b.dataset.tab === name;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', String(isActive));
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === `tab-${name}`);
  });
}

function copyOptimizedCode() {
  const text = DOM.optimizedCode.textContent;
  navigator.clipboard.writeText(text).then(() => {
    DOM.btnCopyOpt.classList.add('copied');
    DOM.btnCopyOpt.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Copied!`;
    setTimeout(() => {
      DOM.btnCopyOpt.classList.remove('copied');
      DOM.btnCopyOpt.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
        Copy`;
    }, 2000);
  });
}

function setProgress(pct, label) {
  DOM.progressFill.style.width = `${pct}%`;
  DOM.progressLabel.textContent = label;
}

function setAgentStatus(idx, state, text) {
  const node = $(`agent-${idx}`);
  const status = $(`status-${idx}`);
  if (!node || !status) return;
  node.classList.remove('active', 'done');
  if (state === 'active') node.classList.add('active');
  if (state === 'done') node.classList.add('done');
  status.textContent = text;
}

function resetAgentNodes() {
  for (let i = 0; i < 5; i++) setAgentStatus(i, '', 'Standby');
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAndFormat(str) {
  return esc(str)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}

function clamp(val, min, max) {
  const n = Number(val);
  if (isNaN(n)) return 0;
  return Math.min(Math.max(n, min), max);
}
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  const primary = [124, 58, 237];
  const secondary = [6, 182, 212];
  const textColor = [40, 40, 40];

  doc.setFillColor(...primary);
  doc.rect(0, 0, 210, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("CodeHive AI Report", 10, 16);

  doc.setFontSize(10);
  doc.text("Multi-Agent Code Intelligence", 10, 22);

  y = 35;

  function addSection(title, content) {
    doc.setTextColor(...primary);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, 10, y);

    y += 6;

    doc.setDrawColor(...secondary);
    doc.line(10, y, 200, y);

    y += 6;

    doc.setTextColor(...textColor);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);

    const lines = doc.splitTextToSize(content || "No data available", 180);
    doc.text(lines, 10, y);

    y += lines.length * 6 + 10;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  const eli5 = DOM.explainEli5.innerText;
  const tech = DOM.explainTech.innerText;

  const bugs = [...DOM.bugsList.querySelectorAll('.bug-item')]
    .map(b => b.innerText)
    .join('\n\n');

  const optimizedCode = DOM.optimizedCode.innerText;
  const docs = DOM.docSections.innerText;
  const review = DOM.reviewSummary.innerText;

  addSection("Explanation (ELI5)", eli5);
  addSection("Technical Explanation", tech);
  addSection("Bugs & Issues", bugs || "No bugs found");
  addSection("Optimized Code", optimizedCode);
  addSection("Documentation", docs || "No documentation generated");
  addSection("Final Review", review);

  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(10);
  doc.setTextColor(120);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, 180, 290);
  }

  doc.save("CodeHive-AI-Report.pdf");
}

const btnDownload = document.getElementById('btn-download');

btnDownload.addEventListener('click', async () => {
  const text = btnDownload.querySelector('.text');
  const icon = btnDownload.querySelector('.icon');
  const loader = btnDownload.querySelector('.loader');

  try {
    btnDownload.disabled = true;
    text.textContent = "Generating PDF...";
    icon.style.display = "none";
    loader.classList.add('show');

    await downloadPDF();

    text.textContent = "Downloaded!";
    
    setTimeout(() => {
      text.textContent = "Download Report";
      icon.style.display = "inline";
      loader.classList.remove('show');
      btnDownload.disabled = false;
    }, 1500);

  } catch (err) {
    console.error(err);

    text.textContent = "Failed ❌";

    setTimeout(() => {
      text.textContent = "Download Report";
      icon.style.display = "inline";
      loader.hidden = true;
      btnDownload.disabled = false;
    }, 1500);
  }
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
document.addEventListener('DOMContentLoaded', init);