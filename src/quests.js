const quests = [
  {
    id: 'q1',
    chapter: '스토어 시작',
    title: '고객 목록 불러오기',
    story:
      '쇼핑 그래프의 출발점은 고객입니다. 비어 있다면 상단 "내장 CSV로 DB 채우기" 버튼이나 직접 CSV 업로드로 User와 Product를 먼저 넣어주세요.',
    goal: '모든 User 이름을 오름차순으로 반환하세요.',
    constraint: 'User 노드만 MATCH 하고 name 컬럼만 반환하세요.',
    hint: 'MATCH (u:User) RETURN u.name AS name ORDER BY name',
    allowedOps: ['MATCH', 'RETURN', 'ORDER BY'],
    validator: (records) => {
      const names = records.map((r) => r.name).sort();
      const expected = ['Alice', 'Bob', 'Chris', 'Diana'];
      const ok = JSON.stringify(names) === JSON.stringify(expected);
      return { ok, message: ok ? '고객 목록이 맞습니다.' : `다음 이름을 반환해야 합니다: ${expected.join(', ')}` };
    },
  },
  {
    id: 'q2',
    chapter: '스토어 시작',
    title: '상품 카탈로그 읽기',
    story:
      'Product 노드에는 name과 category 속성이 있습니다. 데이터가 없다면 상단 버튼으로 시드하거나 CSV를 업로드해 주세요.',
    goal: '모든 Product의 이름과 category를 이름순으로 반환하세요.',
    constraint: 'Product 노드만 MATCH 하고 두 컬럼만 반환하세요.',
    hint: 'MATCH (p:Product) RETURN p.name AS product, p.category AS category ORDER BY product',
    allowedOps: ['MATCH', 'RETURN', 'ORDER BY'],
    validator: (records) => {
      const normalized = records
        .map((r) => ({ product: r.product, category: r.category }))
        .sort((a, b) => a.product.localeCompare(b.product));
      const expected = [
        { product: 'Bouldering Chalk', category: 'sport' },
        { product: 'Cypher Cheat Sheet', category: 'doc' },
        { product: 'Data Modeling Guide', category: 'doc' },
        { product: 'Graph DB Book', category: 'book' },
        { product: 'Neo4j Mug', category: 'goods' },
      ];
      const ok = JSON.stringify(normalized) === JSON.stringify(expected);
      return { ok, message: ok ? '카탈로그가 일치합니다.' : 'Product 목록 또는 정렬을 다시 확인하세요.' };
    },
  },
  {
    id: 'q3',
    chapter: '행동 요약',
    title: '사용자별 행동 집계',
    story:
      'VIEWED / ADDED_TO_CART / PURCHASED 관계를 합쳐 고객별 활동량을 봅니다. 데이터가 비면 진단 패널에서 시드하세요.',
    goal: '각 User의 조회(view), 장바구니(cart), 구매(purchase) 횟수를 모두 반환하세요.',
    constraint: '집계 후 WITH를 사용해 count를 이름과 함께 RETURN 하세요.',
    hint: 'OPTIONAL MATCH로 세 관계를 각각 COUNT 한 뒤 COALESCE로 0을 채워 반환하세요.',
    allowedOps: ['MATCH', 'OPTIONAL MATCH', 'WITH', 'RETURN', 'COUNT'],
    validator: (records) => {
      const normalized = records
        .map((r) => ({
          user: r.user,
          views: Number(r.views),
          carts: Number(r.carts),
          purchases: Number(r.purchases),
        }))
        .sort((a, b) => a.user.localeCompare(b.user));
      const expected = [
        { user: 'Alice', views: 1, carts: 1, purchases: 0 },
        { user: 'Bob', views: 1, carts: 0, purchases: 1 },
        { user: 'Chris', views: 1, carts: 0, purchases: 0 },
        { user: 'Diana', views: 1, carts: 1, purchases: 0 },
      ];
      const ok = JSON.stringify(normalized) === JSON.stringify(expected);
      return {
        ok,
        message: ok
          ? '사용자별 행동 요약이 정확합니다.'
          : '각 사용자에 대한 view/cart/purchase 집계를 다시 확인하세요.',
      };
    },
  },
  {
    id: 'q4',
    chapter: '행동 요약',
    title: '상품별 이벤트 카운트',
    story: 'Product가 얼마나 관심받는지 VIEWED/ADDED_TO_CART/PURCHASED 횟수를 합산해봅니다.',
    goal: '모든 Product의 viewCount, cartCount, buyCount를 함께 반환하세요.',
    constraint: '상품 단위로 GROUP BY 하고 정렬은 자유입니다.',
    hint: 'OPTIONAL MATCH (p)<-[r:VIEWED|ADDED_TO_CART|PURCHASED]-() 로 연결 후 COUNT를 나눠서 계산하세요.',
    allowedOps: ['MATCH', 'OPTIONAL MATCH', 'WITH', 'RETURN', 'COUNT'],
    validator: (records) => {
      const normalized = records
        .map((r) => ({
          product: r.product,
          viewCount: Number(r.viewCount),
          cartCount: Number(r.cartCount),
          buyCount: Number(r.buyCount),
        }))
        .sort((a, b) => a.product.localeCompare(b.product));
      const expected = [
        { product: 'Bouldering Chalk', viewCount: 1, cartCount: 0, buyCount: 0 },
        { product: 'Cypher Cheat Sheet', viewCount: 1, cartCount: 0, buyCount: 0 },
        { product: 'Data Modeling Guide', viewCount: 1, cartCount: 0, buyCount: 0 },
        { product: 'Graph DB Book', viewCount: 1, cartCount: 0, buyCount: 1 },
        { product: 'Neo4j Mug', viewCount: 0, cartCount: 2, buyCount: 0 },
      ];
      const ok = JSON.stringify(normalized) === JSON.stringify(expected);
      return { ok, message: ok ? '상품별 이벤트 수가 맞습니다.' : '집계가 기대값과 다릅니다.' };
    },
  },
  {
    id: 'q5',
    chapter: '추천 준비',
    title: '이미 본/담은 상품 제외',
    story: '고객에게 새 상품을 추천하려면 먼저 본 적이 있거나 구매/장바구니에 있는 상품을 제외해야 합니다.',
    goal: 'Alice가 아직 보지 않았고 구매/장바구니에도 없는 Product 이름을 모두 반환하세요.',
    constraint: 'NOT EXISTS 패턴을 활용해 모든 상호작용 관계를 배제하세요.',
    hint: 'MATCH (p:Product) WHERE NOT EXISTS((:User {name:"Alice"})-[:VIEWED|:ADDED_TO_CART|:PURCHASED]->(p)) RETURN p.name',
    allowedOps: ['MATCH', 'WHERE', 'RETURN'],
    validator: (records) => {
      const names = records.map((r) => r.product || r.name).sort();
      const expected = ['Bouldering Chalk', 'Cypher Cheat Sheet', 'Data Modeling Guide'];
      const ok = JSON.stringify(names) === JSON.stringify(expected);
      return { ok, message: ok ? '새로 추천할 후보만 남았습니다.' : 'Alice가 본/담은/구매한 상품을 모두 제외해야 합니다.' };
    },
  },
  {
    id: 'q6',
    chapter: '추천 준비',
    title: '구매 이력 필터링',
    story:
      '구매한 상품을 또 보여주지 않기 위해 Bob의 PURCHASED 이력이 아닌 상품만 필터링합니다. 데이터가 없으면 UI에서 시드를 채우세요.',
    goal: 'Bob이 구매하지 않은 Product 이름을 모두 반환하세요.',
    constraint: 'Bob과 PURCHASED를 제외하는 조건을 사용하세요.',
    hint: 'MATCH (p:Product) WHERE NOT EXISTS((:User {name:"Bob"})-[:PURCHASED]->(p)) RETURN p.name',
    allowedOps: ['MATCH', 'WHERE', 'RETURN'],
    validator: (records) => {
      const names = records.map((r) => r.product || r.name).sort();
      const expected = ['Bouldering Chalk', 'Cypher Cheat Sheet', 'Data Modeling Guide', 'Neo4j Mug'];
      const ok = JSON.stringify(names) === JSON.stringify(expected);
      return { ok, message: ok ? '구매 제외 필터가 잘 작동합니다.' : 'Bob이 이미 구매한 Graph DB Book을 빼고 반환하세요.' };
    },
  },
  {
    id: 'q7',
    chapter: '추천',
    title: '상품 기반 추천',
    story: '같은 상품을 본/장바구니/구매한 사람들의 다른 관심 상품을 추천합니다.',
    goal: 'Graph DB Book을 본/구매한 사용자들이 함께 본 다른 Product 이름을 인기도 순으로 반환하세요.',
    constraint: '원본 상품(Graph DB Book)은 제외하고 COUNT를 활용하세요.',
    hint: 'MATCH (target:Product {name:"Graph DB Book"})<-[:VIEWED|:ADDED_TO_CART|:PURCHASED]-(u:User)-[:VIEWED|:ADDED_TO_CART|:PURCHASED]->(p) WHERE p <> target RETURN p.name, COUNT(*) AS score ORDER BY score DESC',
    allowedOps: ['MATCH', 'WHERE', 'WITH', 'RETURN', 'COUNT', 'ORDER BY'],
    validator: (records) => {
      const normalized = records
        .map((r) => ({ product: r.product || r.name, score: Number(r.score) }))
        .sort((a, b) => b.score - a.score || a.product.localeCompare(b.product));
      const expected = [
        { product: 'Cypher Cheat Sheet', score: 1 },
        { product: 'Neo4j Mug', score: 1 },
      ];
      const ok = JSON.stringify(normalized) === JSON.stringify(expected);
      return {
        ok,
        message: ok ? '아이템 기반 추천이 정확합니다.' : 'Graph DB Book을 조회/구매한 사용자의 다른 행동을 집계하세요.',
      };
    },
  },
  {
    id: 'q8',
    chapter: '추천',
    title: '사용자 기반 추천',
    story: '비슷한 관심사를 가진 사용자 행동을 활용해 Diana에게 새 상품을 추천합니다.',
    goal: 'Diana와 같은 상품을 본/담은 사용자가 추가로 본 Product 중 Diana가 아직 보지 않은 상품을 반환하세요.',
    constraint: '자기 자신과 이미 본/담은 상품은 제외하고 COUNT로 정렬하세요.',
    hint: 'MATCH (me:User {name:"Diana"})-[:VIEWED|:ADDED_TO_CART|:PURCHASED]->(shared)<-[:VIEWED|:ADDED_TO_CART|:PURCHASED]-(other:User) WHERE other <> me MATCH (other)-[:VIEWED|:ADDED_TO_CART|:PURCHASED]->(p) WHERE NOT EXISTS((me)-[:VIEWED|:ADDED_TO_CART|:PURCHASED]->(p)) RETURN p.name, COUNT(*) AS score ORDER BY score DESC',
    allowedOps: ['MATCH', 'WHERE', 'RETURN', 'COUNT', 'ORDER BY'],
    validator: (records) => {
      const normalized = records
        .map((r) => ({ product: r.product || r.name, score: Number(r.score) }))
        .sort((a, b) => b.score - a.score || a.product.localeCompare(b.product));
      const expected = [{ product: 'Graph DB Book', score: 1 }];
      const ok = JSON.stringify(normalized) === JSON.stringify(expected);
      return { ok, message: ok ? '유사 사용자 추천이 맞습니다.' : '겹치는 상품을 기준으로 다른 사용자의 추가 행동을 추천하세요.' };
    },
  },
  {
    id: 'q9',
    chapter: '추천',
    title: '장바구니 교차 판매',
    story: 'ADDED_TO_CART 대상과 함께 많이 조회된 상품을 찾아 교차 판매 후보를 만듭니다.',
    goal: '장바구니에 Neo4j Mug을 담은 사용자가 함께 본 다른 Product와 빈도를 반환하세요.',
    constraint: '장바구니에 담긴 상품 자체는 제외하고 COUNT 기준 내림차순 정렬하세요.',
    hint: 'MATCH (:Product {name:"Neo4j Mug"})<-[:ADDED_TO_CART]-(u:User)-[:VIEWED|:PURCHASED]->(p) WHERE p.name <> "Neo4j Mug" RETURN p.name, COUNT(*) AS together ORDER BY together DESC',
    allowedOps: ['MATCH', 'WHERE', 'RETURN', 'COUNT', 'ORDER BY'],
    validator: (records) => {
      const normalized = records
        .map((r) => ({ product: r.product || r.name, together: Number(r.together) }))
        .sort((a, b) => b.together - a.together || a.product.localeCompare(b.product));
      const expected = [
        { product: 'Data Modeling Guide', together: 1 },
        { product: 'Graph DB Book', together: 1 },
      ];
      const ok = JSON.stringify(normalized) === JSON.stringify(expected);
      return { ok, message: ok ? '교차 판매 후보가 맞습니다.' : '장바구니 사용자들의 다른 행동을 세어보세요.' };
    },
  },
  {
    id: 'q10',
    chapter: '점수화',
    title: '행동 가중치 점수 계산',
    story: 'VIEWED=1, ADDED_TO_CART=5, PURCHASED=10 점수를 부여해 상품별 인기도 점수를 계산합니다.',
    goal: '모든 Product의 점수를 계산해 높은 순으로 반환하세요.',
    constraint: '각 관계 타입을 COUNT 후 가중합(score)을 계산하고 ORDER BY DESC 하세요.',
    hint: 'WITH COUNT를 이용해 viewScore + cartScore + buyScore 를 계산하고 score로 정렬하세요.',
    allowedOps: ['MATCH', 'OPTIONAL MATCH', 'WITH', 'RETURN', 'COUNT', 'ORDER BY'],
    validator: (records) => {
      const normalized = records
        .map((r) => ({ product: r.product || r.name, score: Number(r.score) }))
        .sort((a, b) => b.score - a.score || a.product.localeCompare(b.product));
      const expected = [
        { product: 'Graph DB Book', score: 11 },
        { product: 'Neo4j Mug', score: 10 },
        { product: 'Bouldering Chalk', score: 1 },
        { product: 'Cypher Cheat Sheet', score: 1 },
        { product: 'Data Modeling Guide', score: 1 },
      ];
      const ok = JSON.stringify(normalized) === JSON.stringify(expected);
      return { ok, message: ok ? '가중치 점수가 정확합니다.' : 'VIEWED=1, CART=5, PURCHASED=10 가중치를 적용했는지 확인하세요.' };
    },
  },
];

export { quests };
