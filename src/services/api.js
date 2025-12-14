export async function runCypher(query, params = {}) {
  const res = await fetch('https://neo4j-runner.neo4j-namoryx.workers.dev/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, params })
  });

  let json;
  try {
    json = await res.json();
  } catch (error) {
    throw new Error('응답을 해석하는 데 실패했습니다.');
  }

  if (!res.ok) {
    const message =
      json?.error?.message || json?.message || json?.error || 'Request failed';
    throw new Error(message);
  }

  return json;
}
