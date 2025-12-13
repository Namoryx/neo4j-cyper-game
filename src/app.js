import { quests } from './quests.js';
import { runQuery, submitSolution } from './checker.js';
import { loadProgress, saveProgress } from './storage.js';
import { initDiagnostics } from './diagnostics.js';
import { initImporter } from './importer.js';

const questList = document.querySelector('#quest-list');
const questTitle = document.querySelector('#quest-title');
const questStory = document.querySelector('#quest-story');
const questGoal = document.querySelector('#quest-goal');
const questConstraint = document.querySelector('#quest-constraint');
const questHint = document.querySelector('#quest-hint');
const allowedOpsBox = document.querySelector('#quest-allowed');
const textarea = document.querySelector('#cypher-input');
const resultBox = document.querySelector('#result');
const feedbackBox = document.querySelector('#feedback');
const chapterBadge = document.querySelector('#chapter-badge');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');
const nodesCountLabel = document.querySelector('#count-nodes');
const relsCountLabel = document.querySelector('#count-rels');
const listCategories = document.querySelector('#list-categories');
const listViewed = document.querySelector('#list-viewed');
const listPurchased = document.querySelector('#list-purchased');
const previewUsers = document.querySelector('#preview-users');
const previewProducts = document.querySelector('#preview-products');
const quickButtonsBox = document.querySelector('#quick-query-buttons');
const explorerResultBox = document.querySelector('#explorer-result');
const explorerLogBox = document.querySelector('#explorer-log');
const toggleLogBtn = document.querySelector('#btn-toggle-log');
const refreshExplorerBtn = document.querySelector('#btn-refresh-explorer');

let currentQuest = quests[0];
let progress = loadProgress();

function logExplorer(message, level = 'info') {
  if (!explorerLogBox) return;
  const line = document.createElement('div');
  line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  line.className = `log-${level}`;
  explorerLogBox.appendChild(line);
  explorerLogBox.scrollTop = explorerLogBox.scrollHeight;
}

function renderQuestList() {
  questList.innerHTML = '';
  quests.forEach((quest) => {
    const li = document.createElement('li');
    li.textContent = `${quest.chapter} · ${quest.title}`;
    li.dataset.id = quest.id;
    if (progress[quest.id]) {
      li.classList.add('done');
      li.title = '완료됨';
    }
    if (quest.id === currentQuest.id) {
      li.classList.add('active');
    }
    li.addEventListener('click', () => selectQuest(quest.id));
    questList.appendChild(li);
  });
}

function renderQuestDetail() {
  questTitle.textContent = currentQuest.title;
  questStory.textContent = currentQuest.story;
  questGoal.textContent = currentQuest.goal;
  questConstraint.textContent = currentQuest.constraint;
  questHint.textContent = currentQuest.hint;
  chapterBadge.textContent = currentQuest.chapter;
  allowedOpsBox.innerHTML = '';
  currentQuest.allowedOps.forEach((op) => {
    const span = document.createElement('span');
    span.className = 'pill';
    span.textContent = op;
    allowedOpsBox.appendChild(span);
  });
  textarea.value = progress[currentQuest.id]?.lastQuery || '';
  feedbackBox.textContent = '';
  resultBox.innerHTML = '';
}

function selectQuest(id) {
  currentQuest = quests.find((q) => q.id === id) || quests[0];
  renderQuestList();
  renderQuestDetail();
}

function renderTable(records) {
  if (!records || records.length === 0) {
    resultBox.textContent = '결과가 없습니다.';
    return;
  }
  const table = document.createElement('table');
  const header = document.createElement('tr');
  Object.keys(records[0]).forEach((key) => {
    const th = document.createElement('th');
    th.textContent = key;
    header.appendChild(th);
  });
  table.appendChild(header);
  records.forEach((row) => {
    const tr = document.createElement('tr');
    Object.keys(row).forEach((key) => {
      const td = document.createElement('td');
      td.textContent = Array.isArray(row[key]) ? row[key].join(', ') : row[key];
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  resultBox.innerHTML = '';
  resultBox.appendChild(table);
}

function renderTableTo(container, records, emptyText = '데이터가 없습니다.') {
  if (!container) return;
  if (!records || records.length === 0) {
    container.textContent = emptyText;
    return;
  }
  const table = document.createElement('table');
  const header = document.createElement('tr');
  Object.keys(records[0]).forEach((key) => {
    const th = document.createElement('th');
    th.textContent = key;
    header.appendChild(th);
  });
  table.appendChild(header);
  records.forEach((row) => {
    const tr = document.createElement('tr');
    Object.keys(row).forEach((key) => {
      const td = document.createElement('td');
      td.textContent = Array.isArray(row[key]) ? row[key].join(', ') : row[key];
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  container.innerHTML = '';
  container.appendChild(table);
}

function renderList(listEl, items) {
  if (!listEl) return;
  listEl.innerHTML = '';
  if (!items || items.length === 0) {
    const li = document.createElement('li');
    li.textContent = '데이터 없음';
    listEl.appendChild(li);
    return;
  }
  items.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    listEl.appendChild(li);
  });
}

async function onRun() {
  const cypher = textarea.value.trim();
  if (!cypher) {
    feedbackBox.textContent = '쿼리를 입력하세요.';
    return;
  }
  feedbackBox.textContent = '실행 중...';
  try {
    const records = await runQuery(cypher);
    renderTable(records);
    feedbackBox.textContent = `실행 완료 (${records.length}건)`;
    progress = { ...progress, [currentQuest.id]: { ...(progress[currentQuest.id] || {}), lastQuery: cypher } };
    saveProgress(progress);
  } catch (error) {
    feedbackBox.textContent = error.message;
  }
}

async function onSubmit() {
  const cypher = textarea.value.trim();
  if (!cypher) {
    feedbackBox.textContent = '쿼리를 입력하세요.';
    return;
  }
  feedbackBox.textContent = '채점 중...';
  const result = await submitSolution(currentQuest, cypher);
  feedbackBox.textContent = result.message;
  if (result.ok) {
    progress[currentQuest.id] = { lastQuery: cypher, solvedAt: new Date().toISOString() };
    saveProgress(progress);
    renderQuestList();
  }
  if (result.records) {
    renderTable(result.records);
  }
}

function wireEvents() {
  document.querySelector('#btn-run').addEventListener('click', onRun);
  document.querySelector('#btn-submit').addEventListener('click', onSubmit);
}

function switchTab(targetId) {
  tabButtons.forEach((btn) => {
    const active = btn.dataset.target === targetId;
    btn.classList.toggle('active', active);
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === targetId);
  });
}

function initTabs() {
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });
}

async function loadCounts() {
  try {
    const records = await runQuery(
      'CALL { MATCH (n) RETURN count(n) AS nodes } CALL { MATCH ()-[r]->() RETURN count(r) AS rels } RETURN nodes, rels'
    );
    const { nodes = '-', rels = '-' } = records[0] || {};
    nodesCountLabel.textContent = nodes;
    relsCountLabel.textContent = rels;
    logExplorer('노드/관계 개요 조회 완료', 'success');
  } catch (error) {
    nodesCountLabel.textContent = '-';
    relsCountLabel.textContent = '-';
    logExplorer(`그래프 개요 실패: ${error.message}`, 'error');
  }
}

async function loadCategories() {
  try {
    const rows = await runQuery(
      'MATCH (i:Item) RETURN i.category AS category, count(*) AS items ORDER BY items DESC LIMIT 5'
    );
    const items = rows.map((r) => `${r.category}: ${r.items}`);
    renderList(listCategories, items);
    logExplorer('상위 카테고리 불러옴', 'success');
  } catch (error) {
    renderList(listCategories, []);
    logExplorer(`카테고리 조회 실패: ${error.message}`, 'error');
  }
}

async function loadViewed() {
  try {
    const rows = await runQuery(
      'MATCH (:User)-[v:VIEW]->(i:Item) RETURN i.name AS product, count(v) AS views ORDER BY views DESC LIMIT 5'
    );
    const items = rows.map((r) => `${r.product}: ${r.views}`);
    renderList(listViewed, items);
    logExplorer('조회수 Top 5 로드', 'success');
  } catch (error) {
    renderList(listViewed, []);
    logExplorer(`조회수 조회 실패: ${error.message}`, 'error');
  }
}

async function loadPurchased() {
  try {
    const rows = await runQuery(
      'MATCH (:User)-[b:BUY]->(i:Item) RETURN i.name AS product, count(b) AS purchases ORDER BY purchases DESC LIMIT 5'
    );
    const items = rows.map((r) => `${r.product}: ${r.purchases}`);
    renderList(listPurchased, items);
    logExplorer('구매 Top 5 로드', 'success');
  } catch (error) {
    renderList(listPurchased, []);
    logExplorer(`구매 내역 조회 실패: ${error.message}`, 'error');
  }
}

async function loadPreviews() {
  try {
    const users = await runQuery('MATCH (u:User) RETURN u.id AS id, u.name AS name ORDER BY id LIMIT 5');
    renderTableTo(previewUsers, users, 'User 노드가 없습니다.');
    logExplorer('User 미리보기 로드', 'success');
  } catch (error) {
    previewUsers.textContent = error.message;
    logExplorer(`User 미리보기 실패: ${error.message}`, 'error');
  }

  try {
    const products = await runQuery(
      'MATCH (i:Item) RETURN i.id AS id, i.name AS name, i.category AS category ORDER BY id LIMIT 5'
    );
    renderTableTo(previewProducts, products, 'Item 노드가 없습니다.');
    logExplorer('Product 미리보기 로드', 'success');
  } catch (error) {
    previewProducts.textContent = error.message;
    logExplorer(`Product 미리보기 실패: ${error.message}`, 'error');
  }
}

async function loadExplorer() {
  await Promise.all([loadCounts(), loadCategories(), loadViewed(), loadPurchased(), loadPreviews()]);
}

const quickQueries = [
  {
    label: '유저별 조회/구매 요약 실행',
    mode: 'run',
    query:
      'MATCH (u:User)\nOPTIONAL MATCH (u)-[v:VIEW]->(:Item)\nWITH u, count(v) AS views\nOPTIONAL MATCH (u)-[b:BUY]->(:Item)\nRETURN u.name AS user, views, count(b) AS purchases\nORDER BY views DESC',
  },
  {
    label: '최근 본 상품 쿼리 에디터',
    mode: 'prefill',
    query:
      'MATCH (u:User)-[r:VIEW]->(i:Item)\nRETURN u.name AS user, i.name AS item, r.ts AS viewedAt\nORDER BY viewedAt DESC\nLIMIT 10',
  },
  {
    label: '카테고리별 구매 집계 실행',
    mode: 'run',
    query:
      'MATCH (:User)-[b:BUY]->(i:Item)\nRETURN i.category AS category, count(b) AS purchases\nORDER BY purchases DESC',
  },
  {
    label: '뷰 & 장바구니 흐름 에디터',
    mode: 'prefill',
    query:
      'MATCH (u:User)-[r]->(i:Item)\nWHERE type(r) IN ["VIEW", "CART"]\nRETURN u.name AS user, type(r) AS action, i.name AS item, r.ts AS ts\nORDER BY ts DESC\nLIMIT 15',
  },
];

function buildQuickButtons() {
  if (!quickButtonsBox) return;
  quickButtonsBox.innerHTML = '';
  quickQueries.forEach((qq) => {
    const btn = document.createElement('button');
    btn.textContent = qq.label;
    btn.addEventListener('click', async () => {
      if (qq.mode === 'prefill') {
        textarea.value = qq.query;
        switchTab('tab-quests');
        textarea.focus();
        logExplorer(`${qq.label} - 에디터에 프리필`, 'info');
      } else {
        explorerResultBox.textContent = '실행 중...';
        try {
          const rows = await runQuery(qq.query);
          renderTableTo(explorerResultBox, rows, '결과가 없습니다.');
          logExplorer(`${qq.label} - /run 실행 완료`, 'success');
        } catch (error) {
          explorerResultBox.textContent = error.message;
          logExplorer(`${qq.label} 실패: ${error.message}`, 'error');
        }
      }
    });
    quickButtonsBox.appendChild(btn);
  });
}

function initExplorerControls() {
  toggleLogBtn?.addEventListener('click', () => {
    explorerLogBox?.classList.toggle('collapsed');
  });
  refreshExplorerBtn?.addEventListener('click', () => {
    logExplorer('요약 새로고침 요청', 'info');
    loadExplorer();
  });
}

function main() {
  initTabs();
  initDiagnostics();
  initImporter();
  renderQuestList();
  renderQuestDetail();
  wireEvents();
  initTabs();
  buildQuickButtons();
  initExplorerControls();
  loadExplorer();
}

main();
