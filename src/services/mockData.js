
const MOCK_DATA = {
  // RETURN 1
  'RETURN 1': {
    records: [
      {
        keys: ['one'],
        _fields: [1],
        get: (key) => (key === 'one' ? 1 : null),
      },
    ],
  },
  // nodes-by-label
  'MATCH (n) RETURN labels(n) AS labels, count(*) AS cnt ORDER BY cnt DESC LIMIT 20': {
    records: [
      { keys: ['labels', 'cnt'], _fields: [['User'], 120] },
      { keys: ['labels', 'cnt'], _fields: [['Item'], 80] },
      { keys: ['labels', 'cnt'], _fields: [['Product'], 45] },
    ],
  },
  // relationship-types
  'MATCH ()-[r]->() RETURN type(r) AS relType, count(*) AS cnt ORDER BY cnt DESC LIMIT 20': {
    records: [
      { keys: ['relType', 'cnt'], _fields: ['VIEW', 300] },
      { keys: ['relType', 'cnt'], _fields: ['BOUGHT', 50] },
    ],
  },
  // node-property-sample
  'MATCH (n) RETURN labels(n) AS labels, keys(n) AS props LIMIT 20': {
    records: [
      { keys: ['labels', 'props'], _fields: [['User'], ['userId', 'name', 'age']] },
      { keys: ['labels', 'props'], _fields: [['Item'], ['itemId', 'name', 'price']] },
    ],
  },
  // user-sample
  'MATCH (u:User) RETURN u LIMIT 20': {
    records: Array.from({ length: 5 }, (_, i) => ({
      keys: ['u'],
      _fields: [{ identity: i, labels: ['User'], properties: { userId: `user-${i}`, name: `User ${i}` } }],
    })),
  },
  // item-sample
  'MATCH (i:Item) RETURN i LIMIT 20': {
    records: Array.from({ length: 5 }, (_, i) => ({
      keys: ['i'],
      _fields: [{ identity: i + 100, labels: ['Item'], properties: { itemId: `item-${i}`, name: `Item ${i}`, price: 100 + i } }],
    })),
  },
  // product-sample
  'MATCH (p:Product) RETURN p LIMIT 20': {
    records: Array.from({ length: 5 }, (_, i) => ({
      keys: ['p'],
      _fields: [{ identity: i + 200, labels: ['Product'], properties: { productId: `prod-${i}`, name: `Product ${i}` } }],
    })),
  },
  // user-item-view
  'MATCH (u:User)-[:VIEW]->(i:Item) RETURN u.userId AS userId, i.itemId AS itemId LIMIT 50': {
    records: Array.from({ length: 10 }, (_, i) => ({
      keys: ['userId', 'itemId'],
      _fields: [`user-${i % 3}`, `item-${i}`],
    })),
  },
  // path-sample
  'MATCH p=(a)-[*1..3]->(b) RETURN length(p) AS hops LIMIT 20': {
    records: [
      { keys: ['hops'], _fields: [1] },
      { keys: ['hops'], _fields: [2] },
      { keys: ['hops'], _fields: [1] },
    ],
  },
};

export function getMockData(query) {
  if (!query) return null;
  const normalizedQuery = query.trim().replace(/\s+/g, ' ');

  // Exact match
  if (MOCK_DATA[normalizedQuery]) {
    return MOCK_DATA[normalizedQuery];
  }

  // Partial match heuristics
  if (normalizedQuery.includes('RETURN 1')) {
    return MOCK_DATA['RETURN 1'];
  }

  if (normalizedQuery.includes('User') && normalizedQuery.includes('RETURN u')) {
    return MOCK_DATA['MATCH (u:User) RETURN u LIMIT 20'];
  }

  if (normalizedQuery.includes('Item') && normalizedQuery.includes('RETURN i')) {
    return MOCK_DATA['MATCH (i:Item) RETURN i LIMIT 20'];
  }

  if (normalizedQuery.includes('Product') && normalizedQuery.includes('RETURN p')) {
    return MOCK_DATA['MATCH (p:Product) RETURN p LIMIT 20'];
  }

  if (normalizedQuery.toLowerCase().includes('count(*)')) {
      return MOCK_DATA['MATCH (n) RETURN labels(n) AS labels, count(*) AS cnt ORDER BY cnt DESC LIMIT 20'];
  }

  // Default fallback for generic queries to show *something*
  if (normalizedQuery.toLowerCase().includes('return n')) {
      return {
          records: [
             { keys: ['n'], _fields: [{ identity: 999, labels: ['MockNode'], properties: { message: "This is a mock node because the backend returned empty results." } }] }
          ]
      }
  }

  return null;
}
