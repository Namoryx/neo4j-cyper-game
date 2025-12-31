import { getMockData } from './mockData.js';

const DEFAULT_WORKER_URL = 'https://neo4j-runner.neo4j-namoryx.workers.dev/run';

function readEnv(key) {
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
    return import.meta.env[key];
  }

  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }

  return undefined;
}

function encodeBasicAuth(username, password) {
  if (typeof btoa === 'function') {
    return btoa(`${username}:${password}`);
  }

  return Buffer.from(`${username}:${password}`).toString('base64');
}

async function fetchWithConfig({ url, headers, body, timeoutMs = 5000 }) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: controller?.signal
    });

    let json;
    try {
      json = await res.json();
    } catch (error) {
      // ignore JSON parse error here; the caller will decide how to handle
    }

    if (!res.ok) {
      const message = json?.error?.message || json?.message || json?.error || 'Request failed';
      throw new Error(message);
    }

    return json;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function buildDirectConfig(query, params) {
  const endpoint =
    readEnv('VITE_NEO4J_ENDPOINT') || readEnv('NEO4J_ENDPOINT');
  const username =
    readEnv('VITE_NEO4J_USERNAME') || readEnv('NEO4J_USERNAME');
  const password =
    readEnv('VITE_NEO4J_PASSWORD') || readEnv('NEO4J_PASSWORD');
  const database =
    readEnv('VITE_NEO4J_DATABASE') || readEnv('NEO4J_DATABASE') || 'neo4j';

  if (!endpoint || !username || !password) {
    return null;
  }

  return {
    url: endpoint,
    headers: {
      Authorization: `Basic ${encodeBasicAuth(username, password)}`
    },
    body: {
      query,
      parameters: params,
      database
    }
  };
}

function buildWorkerConfigs(query, params) {
  const workerUrl = readEnv('VITE_NEO4J_WORKER_URL') || DEFAULT_WORKER_URL;
  const candidates = new Set();

  candidates.add(workerUrl);

  // Try both the provided path and a sibling with/without the trailing "/run"
  if (workerUrl.endsWith('/run')) {
    candidates.add(workerUrl.slice(0, -4));
  } else {
    const normalized = workerUrl.endsWith('/') ? workerUrl.slice(0, -1) : workerUrl;
    candidates.add(`${normalized}/run`);
  }

  return Array.from(candidates).map((url) => ({
    url,
    headers: {},
    body: { cypher: query, params }
  }));
}

function getMockFallback(query) {
  const mock = getMockData(query);
  if (mock) {
    console.warn('Falling back to mock data.');
    return { ...mock, _mocked: true };
  }
  return null;
}

function normalizeResponse(json, query) {
  if (!json?.records || json.records.length === 0) {
    const mock = getMockData(query);
    if (mock) {
      console.warn('Backend returned empty records, using mock data.');
      return { ...mock, _mocked: true };
    }
  }

  return json;
}

export async function runCypher(query, params = {}) {
  if (!query) {
    throw new Error('Cypher가 비어 있습니다.');
  }

  const directConfig = buildDirectConfig(query, params);
  const workerConfigs = buildWorkerConfigs(query, params);

  try {
    if (directConfig) {
      try {
        const json = await fetchWithConfig({ ...directConfig, timeoutMs: 5000 });
        return normalizeResponse(json, query);
      } catch (error) {
        console.warn('Direct Neo4j call failed, falling back to worker.', error.message);
      }
    }

    for (const workerConfig of workerConfigs) {
      try {
        const json = await fetchWithConfig({ ...workerConfig, timeoutMs: 2500 });
        return normalizeResponse(json, query);
      } catch (workerError) {
        console.warn(
          `Worker call failed at ${workerConfig.url}, trying next candidate if available.`,
          workerError.message
        );
      }
    }
    throw new Error('All worker endpoints failed.');
  } catch (error) {
    const mock = getMockFallback(query);
    if (mock) {
      return mock;
    }
    throw error;
  }
}
