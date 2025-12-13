import { IMPORT_URL } from './config.js';
import { addLog } from './diagnostics.js';

const BUNDLED = {
  users: 'data/users.csv',
  items: 'data/items.csv',
  events: 'data/events.csv',
};

async function postImport(formData, label) {
  try {
    const res = await fetch(IMPORT_URL, {
      method: 'POST',
      body: formData,
    });

    const txt = await res.text();
    let data;
    try {
      data = txt ? JSON.parse(txt) : {};
    } catch (err) {
      throw new Error(`응답을 JSON으로 파싱하지 못했습니다: ${err.message}. 본문: ${txt}`);
    }

    if (!res.ok || !data.ok) {
      const msg = data?.error || res.statusText;
      throw new Error(`${label} 실패: HTTP ${res.status}. ${msg}`);
    }

    addLog(`${label} 성공: users ${data.counts?.users || 0}, items ${data.counts?.items || 0}, events ${data.counts?.events || 0}`);
  } catch (error) {
    addLog(`${label} 오류: ${error.message}`, 'error');
  }
}

async function fetchBundledCsv(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`내장 CSV 로드 실패 (${path}): HTTP ${res.status}`);
  }
  return await res.text();
}

async function handleBundledImport() {
  const fd = new FormData();
  try {
    const users = await fetchBundledCsv(BUNDLED.users);
    const items = await fetchBundledCsv(BUNDLED.items);
    const events = await fetchBundledCsv(BUNDLED.events);

    fd.append('users', new Blob([users], { type: 'text/csv' }), 'users.csv');
    fd.append('items', new Blob([items], { type: 'text/csv' }), 'items.csv');
    fd.append('events', new Blob([events], { type: 'text/csv' }), 'events.csv');

    await postImport(fd, '내장 CSV 업로드');
  } catch (error) {
    addLog(`내장 CSV 준비 중 오류: ${error.message}`, 'error');
  }
}

function getFileIfSelected(input) {
  const file = input?.files?.[0];
  return file || null;
}

async function handleUserUpload() {
  const usersInput = document.querySelector('#file-users');
  const itemsInput = document.querySelector('#file-items');
  const eventsInput = document.querySelector('#file-events');

  const files = {
    users: getFileIfSelected(usersInput),
    items: getFileIfSelected(itemsInput),
    events: getFileIfSelected(eventsInput),
  };

  if (!files.users && !files.items && !files.events) {
    addLog('업로드할 CSV를 선택하세요.', 'error');
    return;
  }

  const fd = new FormData();
  if (files.users) fd.append('users', files.users, files.users.name || 'users.csv');
  if (files.items) fd.append('items', files.items, files.items.name || 'items.csv');
  if (files.events) fd.append('events', files.events, files.events.name || 'events.csv');

  await postImport(fd, '사용자 CSV 업로드');
}

export function initImporter() {
  const bundledBtn = document.querySelector('#btn-load-bundled');
  const uploadBtn = document.querySelector('#btn-upload-files');

  bundledBtn?.addEventListener('click', handleBundledImport);
  uploadBtn?.addEventListener('click', handleUserUpload);
}
