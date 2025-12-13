// Cloudflare Worker for Neo4j Cypher Quest
// - CORS allowlist driven by env.ALLOWED_ORIGINS (comma-separated) with sensible defaults
// - Read-only enforcement on /run and /submit
// - HTTP(S) data API call (no Bolt driver) for Cloudflare compatibility
// - Seed/reset helpers for diagnosing connectivity

const DEFAULT_ALLOWED = new Set([
  'https://namoryx.github.io',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
]);

const BLOCKED = /(CREATE|MERGE|DELETE|DETACH|SET|DROP|CALL|APOC)/i;

function allowedOrigins(env) {
  const raw = env?.ALLOWED_ORIGINS;
  if (!raw) return DEFAULT_ALLOWED;
  return new Set(
    String(raw)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  );
}

function cors(req, env) {
  const origin = req.headers.get('Origin') || '';
  const allowlist = allowedOrigins(env);

  if (!origin) {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };
  }

  const allow = allowlist.has(origin) ? origin : allowlist.values().next().value || '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(req, obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors(req, req.env), 'Content-Type': 'application/json; charset=UTF-8' },
  });
}

function text(req, body, status = 200) {
  return new Response(body, {
    status,
    headers: { ...cors(req, req.env), 'Content-Type': 'text/plain; charset=UTF-8' },
  });
}

function normalizeValue(value) {
  if (value && typeof value === 'object') {
    if (typeof value.low === 'number' && typeof value.high === 'number') {
      // Neo4j integer-like
      return Number(value.low); // high is unused for small ints
    }
    if (Array.isArray(value)) {
      return value.map((v) => normalizeValue(v));
    }
    if ('properties' in value) {
      return value.properties;
    }
    if ('value' in value && Object.keys(value).length === 1) {
      return normalizeValue(value.value);
    }
  }
  return value;
}

function mapLegacyResult(payload) {
  const result = payload?.results?.[0];
  if (!result) return [];
  const columns = result.columns || [];
  const rows = result.data || [];
  return rows.map((entry) => {
    const row = entry.row || entry;
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = normalizeValue(row[idx]);
    });
    return obj;
  });
}

function mapDataApiResult(payload) {
  const fields = payload?.data?.fields || [];
  const records = payload?.data?.records || [];
  if (!fields.length || !records.length) return null;
  const names = fields.map((f) => f.name || f.field || f.key);
  return records.map((record) => {
    const values = record.values || record.data || record.row || [];
    const obj = {};
    names.forEach((name, idx) => {
      const v = values[idx]?.value ?? values[idx];
      obj[name] = normalizeValue(v);
    });
    return obj;
  });
}

function formatNeo4jRecords(payload) {
  const dataApi = mapDataApiResult(payload);
  if (dataApi) return dataApi;
  return mapLegacyResult(payload);
}

async function runNeo4j(env, cypher, params = {}) {
  const missing = ['NEO4J_URI', 'NEO4J_USER', 'NEO4J_PASSWORD'].filter((k) => !env[k]);
  if (missing.length) {
    return { ok: false, error: 'Missing Worker secrets', missing };
  }

  const httpBase = String(env.NEO4J_URI)
    .replace('neo4j+s://', 'https://')
    .replace('neo4j://', 'https://');

  const db = env.NEO4J_DATABASE || 'neo4j';
  const endpoint = `${httpBase}/db/${db}/query/v2`;
  const auth = 'Basic ' + btoa(`${env.NEO4J_USER}:${env.NEO4J_PASSWORD}`);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ statement: cypher, parameters: params }),
  });

  const ct = res.headers.get('content-type') || '';
  const bodyText = await res.text();
  if (!ct.includes('application/json')) {
    return {
      ok: false,
      error: 'Neo4j did not return JSON',
      status: res.status,
      contentType: ct,
      endpoint,
      preview: bodyText.slice(0, 300),
    };
  }

  const payload = JSON.parse(bodyText || '{}');
  if (!res.ok) {
    const err = payload?.errors?.[0]?.message || payload?.error || res.statusText;
    return { ok: false, status: res.status, error: err, endpoint };
  }

  return {
    ok: true,
    status: res.status,
    endpoint,
    records: formatNeo4jRecords(payload),
    raw: payload,
  };
}

async function handleOptions(req) {
  return new Response(null, { status: 204, headers: cors(req, req.env) });
}

async function handleHealth(req, env) {
  return text(req, 'neo4j-runner ok', 200);
}

async function handleSeed(req, env) {
  const seedCypher = `
    MERGE (u1:User {id:'u1'}) SET u1.name='Alice'
    MERGE (u2:User {id:'u2'}) SET u2.name='Bob'
    MERGE (u3:User {id:'u3'}) SET u3.name='Chris'

    MERGE (i1:Item {id:'i1'}) SET i1.name='Graph DB Book', i1.category='book'
    MERGE (i2:Item {id:'i2'}) SET i2.name='Neo4j Mug', i2.category='goods'
    MERGE (i3:Item {id:'i3'}) SET i3.name='Cypher Cheat Sheet', i3.category='doc'
    MERGE (i4:Item {id:'i4'}) SET i4.name='Bouldering Chalk', i4.category='sport'

    WITH 1 as _
    MATCH (u1:User {id:'u1'}), (u2:User {id:'u2'}), (u3:User {id:'u3'})
    MATCH (i1:Item {id:'i1'}), (i2:Item {id:'i2'}), (i3:Item {id:'i3'}), (i4:Item {id:'i4'})

    MERGE (u1)-[:VIEW]->(i1)
    MERGE (u1)-[:CART]->(i2)
    MERGE (u2)-[:VIEW]->(i1)
    MERGE (u2)-[:BUY]->(i1)
    MERGE (u3)-[:VIEW]->(i2)
    MERGE (u3)-[:VIEW]->(i3)
    MERGE (u3)-[:VIEW]->(i4)

    RETURN 1 AS seeded
  `;

  const result = await runNeo4j(env, seedCypher, {});
  const status = result.ok ? 200 : 500;
  return json(req, result, status);
}

async function handleRun(req, env) {
  const body = await req.json().catch(() => ({}));
  let cypher = String(body?.cypher ?? '').trim();
  const params = body?.params ?? {};

  if (!cypher) return json(req, { ok: false, error: 'cypher is required' }, 400);

  cypher = cypher.replace(/\s*\n\s*/g, ' ');
  if (BLOCKED.test(cypher)) {
    return json(req, { ok: false, error: 'Write/Procedure queries are not allowed' }, 400);
  }

  const result = await runNeo4j(env, cypher, params);
  const status = result.ok ? 200 : 500;
  return json(req, result.ok ? { records: result.records } : result, status);
}

async function handleSubmit(req, env) {
  const body = await req.json().catch(() => ({}));
  let cypher = String(body?.cypher ?? '').trim();
  const questId = body?.questId;
  const params = body?.params ?? {};

  if (!cypher) return json(req, { ok: false, error: 'cypher is required' }, 400);
  cypher = cypher.replace(/\s*\n\s*/g, ' ');
  if (BLOCKED.test(cypher)) {
    return json(req, { ok: false, error: 'Write/Procedure queries are not allowed' }, 400);
  }

  const result = await runNeo4j(env, cypher, params);
  const status = result.ok ? 200 : 500;
  return json(req, result.ok ? { questId, records: result.records } : result, status);
}

async function handleReset(req, env) {
  const result = await runNeo4j(env, 'MATCH (n) DETACH DELETE n');
  const status = result.ok ? 200 : 500;
  return json(req, result, status);
}

export default {
  async fetch(req, env) {
    req.env = env; // attach for helpers
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') return handleOptions(req);

    try {
      if (url.pathname === '/health' && req.method === 'GET') return handleHealth(req, env);
      if ((url.pathname === '/' || url.pathname === '/run') && req.method === 'POST') return handleRun(req, env);
      if (url.pathname === '/submit' && req.method === 'POST') return handleSubmit(req, env);
      if (url.pathname === '/seed' && req.method === 'POST') return handleSeed(req, env);
      if (url.pathname === '/reset' && req.method === 'POST') return handleReset(req, env);
      return json(req, { ok: false, error: 'Not Found', path: url.pathname }, 404);
    } catch (e) {
      return json(req, { ok: false, error: 'Worker exception', detail: String(e) }, 500);
    }
  },
};
