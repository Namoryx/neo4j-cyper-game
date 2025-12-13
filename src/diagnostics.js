import { apiFetch, HEALTH_URL, RUN_URL, SEED_URL } from './config.js';

const logEntries = [];
let diagnosticsPanel;

function setConnectionState(state, note) {
  const badge = document.querySelector('#connection-status');
  if (!badge) return;

  const fallback = {
    pending: '확인 중...',
    ok: '연결됨',
    error: '문제 발생',
  };

  badge.dataset.state = state;
  badge.textContent = `연결 상태: ${note || fallback[state] || ''}`;
}

function setDiagnosticsOpen(open, auto = false) {
  if (!diagnosticsPanel) {
    diagnosticsPanel = document.querySelector('#diagnostics-panel');
  }
  if (!diagnosticsPanel) return;

  if (open) {
    diagnosticsPanel.dataset.autoOpened = auto ? 'true' : diagnosticsPanel.dataset.autoOpened;
    diagnosticsPanel.open = true;
  } else if (diagnosticsPanel.dataset.autoOpened === 'true') {
    diagnosticsPanel.open = false;
    diagnosticsPanel.dataset.autoOpened = '';
  }
}

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
  setConnectionState('pending', '헬스체크 중');
  try {
    const result = await apiFetch(HEALTH_URL, { method: 'GET' });
    addLog(`헬스체크 성공: ${JSON.stringify(result)}`);
    updateChecklistItem('health', true, result.message || '200 OK');
    setConnectionState('ok', result.message || '정상 응답');
    setDiagnosticsOpen(false, true);
  } catch (error) {
    addLog(error.message, 'error');
    updateChecklistItem('health', false, '오류');
    setConnectionState('error', '헬스체크 실패');
    setDiagnosticsOpen(true, true);
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
    setConnectionState('ok', '테스트 성공');
    setDiagnosticsOpen(false, true);
  } catch (error) {
    addLog(error.message, 'error');
    updateChecklistItem('return1', false, '오류');
    setConnectionState('error', 'RETURN 1 실패');
    setDiagnosticsOpen(true, true);
  }
}

async function runSeed() {
  updateChecklistItem('seed', false, '시드 중...');
  try {
    const result = await apiFetch(SEED_URL, { method: 'POST' });
    addLog(`시드 완료: ${result.inserted || '완료'}`);
    updateChecklistItem('seed', true, '시드 성공');
    setConnectionState('ok', '시드 완료');
    setDiagnosticsOpen(false, true);
  } catch (error) {
    addLog(error.message, 'error');
    updateChecklistItem('seed', false, '오류');
    setConnectionState('error', '시드 실패');
    setDiagnosticsOpen(true, true);
  }
}

export function initDiagnostics() {
  document.querySelector('#btn-health').addEventListener('click', runHealthCheck);
  document.querySelector('#btn-return1').addEventListener('click', runReturnOne);
  document.querySelector('#btn-seed').addEventListener('click', runSeed);
  diagnosticsPanel = document.querySelector('#diagnostics-panel');
  runHealthCheck();
}

export { addLog };
