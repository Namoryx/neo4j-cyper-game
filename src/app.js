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

let currentQuest = quests[0];
let progress = loadProgress();

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

function main() {
  initDiagnostics();
  initImporter();
  renderQuestList();
  renderQuestDetail();
  wireEvents();
}

main();
