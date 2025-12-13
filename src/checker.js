import { apiFetch, RUN_URL, SUBMIT_URL } from './config.js';
import { addLog } from './diagnostics.js';

const feedbackTemplates = {
  syntax: '쿼리 실행 중 오류가 발생했습니다. 에러 메시지를 확인하세요.',
  constraint: '허용되지 않은 연산이 포함되어 있습니다. allowedOps를 다시 확인하세요.',
  mismatch: '결과가 목표와 다릅니다. 반환 컬럼과 조건을 다시 확인하세요.',
};

function containsForbiddenOps(cypher, allowedOps) {
  const upper = cypher.toUpperCase();
  const uniqueOps = new Set(allowedOps.map((s) => s.toUpperCase()));
  const hardForbidden = ['LOAD CSV', 'CALL DBMS', 'APOC.'];
  if (hardForbidden.some((op) => upper.includes(op))) {
    return '보안상 차단된 연산이 포함되어 있습니다 (LOAD CSV / dbms / apoc).';
  }
  const tokens = ['MATCH', 'MERGE', 'CREATE', 'DELETE', 'DETACH', 'REMOVE', 'SET', 'CALL', 'WITH', 'RETURN', 'ORDER BY', 'LIMIT', 'WHERE', 'UNWIND', 'OPTIONAL MATCH'];
  const used = tokens.filter((t) => upper.includes(t));
  const disallowed = used.filter((t) => !uniqueOps.has(t));
  if (disallowed.length > 0) {
    return `${disallowed.join(', ')}는 이 퀘스트에서 허용되지 않습니다.`;
  }
  return '';
}

function normalizeRecords(records) {
  return (records || []).map((row) => {
    const normalized = {};
    Object.entries(row).forEach(([key, value]) => {
      normalized[key] = Array.isArray(value)
        ? value.map((v) => (typeof v === 'object' && v.low !== undefined ? Number(v) : v))
        : typeof value === 'object' && value?.low !== undefined
        ? Number(value)
        : value;
    });
    return normalized;
  });
}

async function runQuery(cypher) {
  const payload = { cypher };
  const { records } = await apiFetch(RUN_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const normalized = normalizeRecords(records);
  addLog(`RUN ${RUN_URL} 호출 완료 (${normalized.length}건)`);
  return normalized;
}

async function submitSolution(quest, cypher) {
  const forbidden = containsForbiddenOps(cypher, quest.allowedOps);
  if (forbidden) {
    return { ok: false, message: `${feedbackTemplates.constraint} ${forbidden}`, kind: 'constraint' };
  }
  try {
    const serverResult = await apiFetch(SUBMIT_URL, {
      method: 'POST',
      body: JSON.stringify({ cypher, questId: quest.id }),
    });
    const records = normalizeRecords(serverResult.records);
    const validation = quest.validator(records);
    const ok = validation.ok === true;
    if (ok) {
      addLog(`퀘스트 ${quest.id} 성공 제출`);
      return { ok: true, message: validation.message || '정답입니다!', records };
    }
    return { ok: false, message: validation.message || feedbackTemplates.mismatch, records, kind: 'mismatch' };
  } catch (error) {
    const message = `${feedbackTemplates.syntax}\n${error.message}`;
    addLog(message, 'error');
    return { ok: false, message, kind: 'syntax' };
  }
}

export { runQuery, submitSolution };
