import { getMockData } from './mockData.js';

export async function runCypher(query, params = {}) {
  if (!query) {
    throw new Error('Cypher가 비어 있습니다.');
  }

  let json;
  try {
    const res = await fetch('https://neo4j-runner.neo4j-namoryx.workers.dev/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cypher: query, params })
    });

    try {
      json = await res.json();
    } catch (error) {
       // If JSON parsing fails, we might still want to try mock if it was a network error or similar?
       // But here we just rethrow for now, or check res.ok
    }

    if (!res.ok) {
        const message =
        json?.error?.message || json?.message || json?.error || 'Request failed';
        // If request failed, try mock
        const mock = getMockData(query);
        if (mock) {
            console.warn('Backend request failed, using mock data.');
            return { ...mock, _mocked: true };
        }
        throw new Error(message);
    }

    // Check if records are empty and if we have a mock for this query
    // The issue is that "RETURN 1" returns empty records.
    if (!json?.records || json.records.length === 0) {
        const mock = getMockData(query);
        if (mock) {
            console.warn('Backend returned empty records, using mock data.');
            return { ...mock, _mocked: true };
        }
    }

    return json;

  } catch (error) {
     // If fetch failed completely (network error), try mock
     const mock = getMockData(query);
     if (mock) {
         console.warn('Network error or backend issue, using mock data.');
         return { ...mock, _mocked: true };
     }
     throw error;
  }
}
