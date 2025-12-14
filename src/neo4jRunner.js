const RUNNER_URL = 'https://neo4j-runner.neo4j-namoryx.workers.dev/run';

const mutatingPattern = /\b(CREATE|MERGE|DELETE|SET|DROP|REMOVE|CALL\s+\{)/i;

export function isMutatingQuery(statement = '') {
  return mutatingPattern.test(statement);
}

export function normalizeResult(payload = {}) {
  const columns = payload.columns || payload.result?.columns || [];
  const records = payload.records || payload.result?.records || payload.data || [];
  const rows = records.map((record) => {
    if (Array.isArray(record)) return record;
    if (record && typeof record === 'object') {
      if ('row' in record) return record.row;
      if ('_fields' in record) return record._fields;
    }
    return record;
  });
  return { columns, rows };
}

export async function executeReadOnlyCypher(statement, fetchImpl = fetch) {
  if (isMutatingQuery(statement)) {
    return { ok: false, error: '읽기 전용 실습에서는 CREATE, MERGE, DELETE 등의 변경 쿼리를 허용하지 않습니다.' };
  }

  try {
    const response = await fetchImpl(RUNNER_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ statement })
    });

    if (!response.ok) {
      return { ok: false, error: `Runner error: ${response.status}` };
    }

    const payload = await response.json();
    const normalized = normalizeResult(payload);
    return { ok: true, ...normalized };
  } catch (error) {
    return { ok: false, error: error.message || '알 수 없는 오류가 발생했습니다.' };
  }
}
