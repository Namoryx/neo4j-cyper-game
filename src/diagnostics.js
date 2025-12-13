import { apiFetch, HEALTH_URL, RUN_URL, SEED_URL } from './config.js';

const logEntries = [];

function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const entry = `[${timestamp}] ${message}`;
  logEntries.unshift({ message: entry, type });
  renderLog();
}

function renderLog() {
  const logBox = document.querySelector('#diagnostic-log');
  if (!logBox) return;
  logBox.innerHTML = '';
  logEntries.slice(0, 30).forEach(({ message, type }) => {
    const div = document.createElement('div');
    div.textContent = message;
    div.className = `log-${type}`;
    logBox.appendChild(div);
  });
}

function updateChecklistItem(id, ok, note = '') {
  const row = document.querySelector(`[data-check="${id}"]`);
  if (!row) return;
  row.querySelector('.status').textContent = ok ? '✅' : '⚠️';
  row.querySelector('.note').textContent = note;
}

async function runHealthCheck() {
  updateChecklistItem('health', false, '확인 중...');
  try {
    const result = await apiFetch(HEALTH_URL, { method: 'GET' });
    addLog(`헬스체크 성공: ${JSON.stringify(result)}`);
    updateChecklistItem('health', true, result.message || '200 OK');
  } catch (error) {
    addLog(error.message, 'error');
    updateChecklistItem('health', false, '오류');
  }
}

async function runReturnOne() {
  updateChecklistItem('return1', false, '실행 중...');
  try {
    const result = await apiFetch(RUN_URL, {
      method: 'POST',
      body: JSON.stringify({ cypher: 'RETURN 1 AS ok' }),
    });
    const value = result.records?.[0]?.ok ?? JSON.stringify(result.records?.[0]);
    addLog(`RETURN 1 결과: ${value}`);
    updateChecklistItem('return1', true, `결과 ${value}`);
  } catch (error) {
    addLog(error.message, 'error');
    updateChecklistItem('return1', false, '오류');
  }
}

async function runSeed() {
  updateChecklistItem('seed', false, '시드 중...');
  try {
    const result = await apiFetch(SEED_URL, { method: 'POST' });
    addLog(`시드 완료: ${result.inserted || '완료'}`);
    updateChecklistItem('seed', true, '시드 성공');
  } catch (error) {
    addLog(error.message, 'error');
    updateChecklistItem('seed', false, '오류');
  }
}

export function initDiagnostics() {
  document.querySelector('#btn-health').addEventListener('click', runHealthCheck);
  document.querySelector('#btn-return1').addEventListener('click', runReturnOne);
  document.querySelector('#btn-seed').addEventListener('click', runSeed);
  runHealthCheck();
}

export { addLog };
