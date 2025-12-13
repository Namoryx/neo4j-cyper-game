import neo4j from 'neo4j-driver';

let cachedDriver;

function getCorsHeaders(origin, env) {
  const allowedList = (env?.ALLOWED_ORIGINS || '*')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const allowed = allowedList.includes('*') ? '*' : allowedList.includes(origin) ? origin : allowedList[0] || '*';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(body, status = 200, origin = '*', env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin, env),
    },
  });
}

function handleOptions(request, env) {
  return new Response(null, { status: 204, headers: getCorsHeaders(request.headers.get('Origin'), env) });
}

function isWriteQuery(query) {
  const upper = query.toUpperCase();
  const forbiddenKeywords = ['CREATE ', 'MERGE ', 'DELETE ', 'DETACH ', 'REMOVE ', 'SET ', 'DROP ', 'LOAD CSV', 'CALL DBMS'];
  return forbiddenKeywords.some((kw) => upper.includes(kw));
}

function isDangerous(query) {
  const upper = query.toUpperCase();
  const banned = ['APOC.', 'DBMS', 'ADMIN'];
  return banned.some((kw) => upper.includes(kw));
}

function ensureLimit(query) {
  const upper = query.toUpperCase();
  if (upper.includes(' LIMIT ')) {
    return query;
  }
  return `${query}\nLIMIT 50`;
}

async function getDriver(env) {
  if (!cachedDriver) {
    cachedDriver = neo4j.driver(env.NEO4J_URI, neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD));
  }
  return cachedDriver;
}

function serialize(records) {
  return records.map((record) => {
    const obj = record.toObject();
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (neo4j.isInt(value)) {
        obj[key] = value.toNumber();
      }
      if (Array.isArray(value)) {
        obj[key] = value.map((v) => (neo4j.isInt(v) ? v.toNumber() : v.properties || v));
      }
      if (value && value.properties) {
        obj[key] = value.properties;
      }
    });
    return obj;
  });
}

async function runReadQuery(env, cypher) {
  if (isWriteQuery(cypher)) {
    throw new Error('READ 전용 엔드포인트에서 쓰기 쿼리는 허용되지 않습니다.');
  }
  if (isDangerous(cypher)) {
    throw new Error('보안상 차단된 쿼리입니다.');
  }
  const driver = await getDriver(env);
  const session = driver.session();
  const enforced = ensureLimit(cypher);
  const result = await session.run(enforced);
  await session.close();
  return serialize(result.records);
}

async function seedData(env) {
  const driver = await getDriver(env);
  const session = driver.session();
  const tx = session.beginTransaction();
  try {
    await tx.run(
      `
      MERGE (seoul:City {name: 'Seoul'})
      MERGE (busan:City {name: 'Busan'})
      MERGE (daejeon:City {name: 'Daejeon'})

      MERGE (neo:Company {name: 'NeoEnergy', industry: 'Energy', hq: 'Seoul'})
      MERGE (cloud:Company {name: 'CloudAtlas', industry: 'Cloud', hq: 'Busan'})
      MERGE (harbor:Company {name: 'HarborTech', industry: 'Logistics', hq: 'Busan'})

      MERGE (bluebird:Project {name: 'Bluebird', status: 'active'})
      MERGE (harborProj:Project {name: 'Harbor Revamp', status: 'planning'})
      MERGE (skyflow:Project {name: 'SkyFlow', status: 'research'})

      MERGE (jisu:Person {name: '지수', role: 'Engineer'})
      MERGE (minho:Person {name: '민호', role: 'Analyst'})
      MERGE (ara:Person {name: '아라', role: 'Manager'})
      MERGE (haneul:Person {name: '하늘', role: 'DevRel'})
      MERGE (dabin:Person {name: '다빈', role: 'Data Scientist'})

      MERGE (jisu)-[:LivesIn]->(seoul)
      MERGE (minho)-[:LivesIn]->(busan)
      MERGE (ara)-[:LivesIn]->(daejeon)
      MERGE (haneul)-[:LivesIn]->(seoul)
      MERGE (dabin)-[:LivesIn]->(busan)

      MERGE (jisu)-[:WorksAt]->(neo)
      MERGE (minho)-[:WorksAt]->(harbor)
      MERGE (ara)-[:WorksAt]->(neo)
      MERGE (haneul)-[:WorksAt]->(cloud)
      MERGE (dabin)-[:WorksAt]->(cloud)

      MERGE (jisu)-[:CONTRIBUTES_TO]->(bluebird)
      MERGE (dabin)-[:CONTRIBUTES_TO]->(bluebird)
      MERGE (minho)-[:CONTRIBUTES_TO]->(harborProj)
      MERGE (ara)-[:CONTRIBUTES_TO]->(harborProj)
      MERGE (ara)-[:CONTRIBUTES_TO]->(bluebird)
      MERGE (haneul)-[:CONTRIBUTES_TO]->(skyflow)

      MERGE (jisu)-[:KNOWS]->(haneul)
      MERGE (jisu)-[:KNOWS]->(ara)
      MERGE (minho)-[:KNOWS]->(dabin)
      MERGE (haneul)-[:KNOWS]->(minho)

      MERGE (seoul)-[:ROUTE {mode: 'train', distance: 320}]->(busan)
      MERGE (seoul)-[:ROUTE {mode: 'express', distance: 150}]->(daejeon)
      MERGE (daejeon)-[:ROUTE {mode: 'express', distance: 200}]->(busan)
    `
    );
    await tx.commit();
    await session.close();
    return { inserted: '샘플 데이터 준비 완료' };
  } catch (error) {
    await tx.rollback();
    await session.close();
    throw error;
  }
}

async function handleRun(request, env) {
  const body = await request.json();
  const cypher = body.cypher || '';
  const records = await runReadQuery(env, cypher);
  return jsonResponse({ records }, 200, request.headers.get('Origin'), env);
}

async function handleSubmit(request, env) {
  const body = await request.json();
  const cypher = body.cypher || '';
  const records = await runReadQuery(env, cypher);
  return jsonResponse({ questId: body.questId, records }, 200, request.headers.get('Origin'), env);
}

async function handleHealth(request, env) {
  try {
    await runReadQuery(env, 'RETURN 1 AS ok');
    return jsonResponse({ ok: true, message: 'neo4j-runner ok' }, 200, request.headers.get('Origin'), env);
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message }, 500, request.headers.get('Origin'), env);
  }
}

async function handleSeed(request, env) {
  const inserted = await seedData(env);
  return jsonResponse(inserted, 200, request.headers.get('Origin'), env);
}

async function handleReset(request, env) {
  const driver = await getDriver(env);
  const session = driver.session();
  await session.run('MATCH (n) DETACH DELETE n');
  await session.close();
  return jsonResponse({ reset: true }, 200, request.headers.get('Origin'), env);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }
    try {
      if (pathname === '/health') return await handleHealth(request, env);
      if (pathname === '/run' && request.method === 'POST') return await handleRun(request, env);
      if (pathname === '/submit' && request.method === 'POST') return await handleSubmit(request, env);
      if (pathname === '/seed' && request.method === 'POST') return await handleSeed(request, env);
      if (pathname === '/reset' && request.method === 'POST') return await handleReset(request, env);
      return jsonResponse({ error: 'Not found' }, 404, request.headers.get('Origin'), env);
    } catch (error) {
      return jsonResponse({ error: error.message }, 500, request.headers.get('Origin'), env);
    }
  },
};
