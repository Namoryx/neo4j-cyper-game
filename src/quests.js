const quests = [
  {
    id: 'q1',
    chapter: '도입',
    title: '연결된 사람들 살펴보기',
    story: '신입 데이터 큐레이터가 된 당신! 먼저 데이터베이스에 어떤 사람들이 있는지 확인하세요.',
    goal: '모든 사람 이름을 오름차순으로 반환하세요.',
    constraint: '이름만 반환하고 정렬을 적용하세요.',
    hint: 'MATCH (p:Person) ... ORDER BY ... RETURN ... 패턴을 떠올려 보세요.',
    allowedOps: ['MATCH', 'RETURN', 'ORDER BY'],
    validator: (records) => {
      const names = records.map((r) => r.name);
      const expected = ['다빈', '민호', '아라', '지수', '하늘'];
      const ok = JSON.stringify(names) === JSON.stringify(expected);
      return { ok, message: ok ? '정답입니다!' : `이름 목록이 예상과 다릅니다: ${names.join(', ')}` };
    },
  },
  {
    id: 'q2',
    chapter: '도입',
    title: '서울 거주자 찾기',
    story: '본사에 가까운 사람을 찾고 싶습니다.',
    goal: '서울에 사는 사람들의 이름을 반환하세요.',
    constraint: 'WHERE 조건으로 도시를 제한하세요.',
    hint: '도시 노드를 MATCH 하고 LivesIn 관계를 이어보세요.',
    allowedOps: ['MATCH', 'WHERE', 'RETURN'],
    validator: (records) => {
      const names = records.map((r) => r.name).sort();
      const expected = ['지수', '하늘'];
      const ok = JSON.stringify(names) === JSON.stringify(expected);
      return { ok, message: ok ? '두 명 모두 찾았습니다.' : '서울 거주자 목록이 다릅니다.' };
    },
  },
  {
    id: 'q3',
    chapter: '기초 집계',
    title: '도시별 인원 수 집계',
    story: '도시별 지원 규모를 확인해야 합니다.',
    goal: '도시별 Person 수를 세고 많은 순으로 정렬하세요.',
    constraint: '집계 후 ORDER BY DESC 사용',
    hint: 'COUNT와 ORDER BY DESC, LIMIT 없이 모두 보여주세요.',
    allowedOps: ['MATCH', 'RETURN', 'WITH', 'COUNT', 'ORDER BY'],
    validator: (records) => {
      const expected = [
        { city: 'Busan', count: 2 },
        { city: 'Seoul', count: 2 },
        { city: 'Daejeon', count: 1 },
      ];
      const normalized = records.map((r) => ({ city: r.city, count: Number(r.count) }));
      const ok = JSON.stringify(normalized) === JSON.stringify(expected);
      return { ok, message: ok ? '정확한 집계입니다.' : '도시별 집계가 예상과 다릅니다.' };
    },
  },
  {
    id: 'q4',
    chapter: '팀 탐색',
    title: '동료 찾기',
    story: '지수와 같은 회사에 있는 동료를 찾습니다.',
    goal: '지수와 같은 회사에서 일하지만 지수가 아닌 사람의 이름을 반환하세요.',
    constraint: '회사 노드 기준으로 조인하세요.',
    hint: '지수의 회사를 찾은 뒤 같은 회사를 공유하는 다른 사람을 MATCH 합니다.',
    allowedOps: ['MATCH', 'WHERE', 'RETURN'],
    validator: (records) => {
      const names = records.map((r) => r.name).sort();
      const ok = JSON.stringify(names) === JSON.stringify(['아라']);
      return { ok, message: ok ? '동료를 정확히 찾았습니다.' : '지수와 같은 회사 동료를 반환해야 합니다.' };
    },
  },
  {
    id: 'q5',
    chapter: '프로젝트',
    title: '주력 프로젝트 파악',
    story: '투입 인원이 2명 이상인 프로젝트를 찾습니다.',
    goal: '참여 인원이 2명 이상인 프로젝트 이름을 인원수와 함께 반환하세요.',
    constraint: '집계 후 조건을 WITH 또는 HAVING 스타일 WHERE로 제한하세요.',
    hint: 'WITH p, proj ... COUNT(p) AS total WHERE total >= 2 RETURN proj.name, total',
    allowedOps: ['MATCH', 'WITH', 'WHERE', 'RETURN', 'COUNT'],
    validator: (records) => {
      const normalized = records.map((r) => ({ name: r.project, total: Number(r.total) })).sort((a, b) => a.name.localeCompare(b.name));
      const expected = [
        { name: 'Bluebird', total: 2 },
        { name: 'Harbor Revamp', total: 2 },
      ];
      const ok = JSON.stringify(normalized) === JSON.stringify(expected);
      return { ok, message: ok ? '두 프로젝트를 모두 찾았습니다.' : '참여자 2명 이상의 프로젝트를 반환해야 합니다.' };
    },
  },
  {
    id: 'q6',
    chapter: '경로 탐색',
    title: '최단 이동 거리',
    story: '서울에서 부산까지 가장 짧은 경로를 찾습니다.',
    goal: '서울에서 부산까지의 최소 이동거리(거리 합)를 distance로 반환하세요.',
    constraint: 'ROUTE 관계의 distance를 합산하고 LIMIT 1로 결과를 하나만 보여주세요.',
    hint: 'ORDER BY totalDistance ASC LIMIT 1 패턴을 사용하세요.',
    allowedOps: ['MATCH', 'WHERE', 'RETURN', 'ORDER BY', 'LIMIT', 'WITH'],
    validator: (records) => {
      const distance = Number(records?.[0]?.distance ?? records?.[0]?.totalDistance);
      const ok = distance === 320;
      return { ok, message: ok ? '최단 거리를 찾았습니다.' : 'distance 값이 320이어야 합니다.' };
    },
  },
  {
    id: 'q7',
    chapter: '연결 관계',
    title: '부산 거주자와 연결된 사람',
    story: '부산 거주자와 네트워크로 연결된 사람을 찾습니다.',
    goal: '부산에 사는 사람을 알고 있는 사람의 이름을 반환하세요.',
    constraint: '지식 관계를 따라가며 DISTINCT를 사용하세요.',
    hint: 'MATCH (p:Person)-[:KNOWS]->(friend)-[:LivesIn]->(:City {name:"Busan"})',
    allowedOps: ['MATCH', 'RETURN', 'WHERE', 'DISTINCT'],
    validator: (records) => {
      const names = records.map((r) => r.name).sort();
      const ok = JSON.stringify(names) === JSON.stringify(['하늘']);
      return { ok, message: ok ? '연결된 사람을 찾았습니다.' : '부산 거주자를 알고 있는 사람을 반환하세요.' };
    },
  },
  {
    id: 'q8',
    chapter: '조직 분석',
    title: '회사별 인원수',
    story: '어떤 회사가 가장 큰지 파악합니다.',
    goal: '회사별 직원 수를 구하고 많은 순으로 정렬하세요.',
    constraint: 'COUNT와 ORDER BY DESC 사용',
    hint: 'MATCH (p)-[:WorksAt]->(c) WITH c, COUNT(p) AS total RETURN c.name AS company, total ORDER BY total DESC',
    allowedOps: ['MATCH', 'WITH', 'RETURN', 'COUNT', 'ORDER BY'],
    validator: (records) => {
      const normalized = records.map((r) => ({ company: r.company, total: Number(r.total) }));
      const expected = [
        { company: 'CloudAtlas', total: 2 },
        { company: 'NeoEnergy', total: 2 },
        { company: 'HarborTech', total: 1 },
      ];
      const ok = JSON.stringify(normalized) === JSON.stringify(expected);
      return { ok, message: ok ? '회사 규모를 정확히 계산했습니다.' : '집계나 정렬을 다시 확인하세요.' };
    },
  },
  {
    id: 'q9',
    chapter: '심화',
    title: '다중 프로젝트 기여자',
    story: '여러 프로젝트를 도는 멀티 플레이어를 찾습니다.',
    goal: '두 개 이상의 프로젝트에 기여한 사람 이름을 반환하세요.',
    constraint: '집계 후 조건 WHERE count >= 2',
    hint: 'MATCH (p)-[:CONTRIBUTES_TO]->(proj) WITH p, COUNT(proj) AS total WHERE total >= 2 RETURN p.name',
    allowedOps: ['MATCH', 'WITH', 'WHERE', 'RETURN', 'COUNT'],
    validator: (records) => {
      const names = records.map((r) => r.name).sort();
      const ok = JSON.stringify(names) === JSON.stringify(['아라']);
      return { ok, message: ok ? '바쁜 기여자를 찾았습니다.' : '두 개 이상 프로젝트에 기여한 사람을 반환하세요.' };
    },
  },
  {
    id: 'q10',
    chapter: '그래프 읽기',
    title: '가까운 도시 쌍',
    story: '빠르게 이동 가능한 도시 연결을 파악합니다.',
    goal: '거리가 220 이하인 ROUTE의 도시 쌍과 거리를 반환하세요.',
    constraint: '양방향 중복 제거를 위해 ID 비교 또는 DISTINCT 사용',
    hint: 'WHERE r.distance <= 220 AND id(a) < id(b) 형태를 사용해보세요.',
    allowedOps: ['MATCH', 'WHERE', 'RETURN', 'DISTINCT'],
    validator: (records) => {
      const pairs = records
        .map((r) => [r.from || r.cityA, r.to || r.cityB].sort().join('-'))
        .sort();
      const ok = JSON.stringify(pairs) === JSON.stringify(['Busan-Daejeon', 'Daejeon-Seoul']);
      return { ok, message: ok ? '가까운 도시를 정확히 찾았습니다.' : '거리가 220 이하인 경로를 반환하세요.' };
    },
  },
  {
    id: 'q11',
    chapter: '네트워크',
    title: '핵심 연결자 찾기',
    story: '네트워크 중심 인물을 찾아야 합니다.',
    goal: 'KNOWS 차수(outgoing 기준)가 가장 높은 사람과 차수를 반환하세요.',
    constraint: 'ORDER BY 차수 DESC LIMIT 1',
    hint: 'WITH p, COUNT(friend) AS degree ORDER BY degree DESC LIMIT 1',
    allowedOps: ['MATCH', 'WITH', 'RETURN', 'ORDER BY', 'LIMIT', 'COUNT'],
    validator: (records) => {
      const name = records?.[0]?.name;
      const degree = Number(records?.[0]?.degree);
      const ok = name === '지수' && degree === 2;
      return { ok, message: ok ? '핵심 연결자를 찾았습니다.' : '가장 많은 KNOWS 관계를 가진 사람을 반환하세요.' };
    },
  },
  {
    id: 'q12',
    chapter: '비즈니스 규칙',
    title: '본사 연계 근무자',
    story: '본사 위치와 같은 도시에서 일하는 직원을 파악합니다.',
    goal: '회사 본사(HQ)와 같은 도시에 사는 직원 이름을 반환하세요.',
    constraint: 'LivesIn 도시와 회사의 hq 속성을 비교하세요.',
    hint: 'MATCH (p)-[:WorksAt]->(c) MATCH (p)-[:LivesIn]->(city) WHERE city.name = c.hq RETURN p.name',
    allowedOps: ['MATCH', 'WHERE', 'RETURN'],
    validator: (records) => {
      const names = records.map((r) => r.name).sort();
      const ok = JSON.stringify(names) === JSON.stringify(['다빈', '민호', '지수']);
      return { ok, message: ok ? '본사 연계 인원을 찾았습니다.' : '회사 본사가 위치한 도시를 기준으로 필터링하세요.' };
    },
  },
];

export { quests };
