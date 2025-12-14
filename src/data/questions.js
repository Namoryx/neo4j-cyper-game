export const questions = [
  {
    id: 'mcq-pattern-basics',
    type: 'mcq',
    domain: 'Graph modeling',
    concept: 'Node and relationship patterns',
    prompt: 'Quokka는 친구 관계를 살피고 싶습니다. 모든 친구 관계를 탐색하기 위한 MATCH 절로 옳은 것은 무엇인가요?',
    choices: [
      {
        id: 'match-friends',
        text: "MATCH (p:Person)-[:FRIEND_OF]->(friend) RETURN p.name, friend.name",
        correct: true,
        feedback: '패턴에 레이블과 관계 유형을 모두 지정해 필요한 두 노드의 이름을 반환합니다.'
      },
      {
        id: 'match-wrong',
        text: "MATCH (:Person {name: 'Quokka'})<-[:FRIEND_OF]-(:Person) RETURN count(*)",
        correct: false,
        feedback: '이 패턴은 특정 노드만 찾습니다. 모든 친구 관계를 확인하려면 제약을 제거해야 합니다.'
      },
      {
        id: 'optional',
        text: 'OPTIONAL MATCH (p:Person)-[:FRIEND_OF]->(:City) RETURN p',
        correct: false,
        feedback: '관계의 방향과 대상이 잘못되었습니다. 친구 간 관계를 대상으로 해야 합니다.'
      }
    ],
    explanation: '모든 친구 관계를 둘러볼 때는 레이블과 관계 유형을 지정한 MATCH를 사용해 양쪽 노드를 반환하는 것이 좋습니다.'
  },
  {
    id: 'mcq-filtering',
    type: 'mcq',
    domain: 'Pattern filtering',
    concept: 'WHERE와 조건 결합',
    prompt: 'Quokka는 이름이 Q로 시작하는 친구만 찾으려고 합니다. 조건을 결합하는 방식으로 올바른 쿼리는 무엇인가요?',
    choices: [
      {
        id: 'where-starts',
        text: "MATCH (p:Person)-[:FRIEND_OF]->(friend) WHERE friend.name STARTS WITH 'Q' RETURN friend",
        correct: true,
        feedback: 'WHERE 절에서 STARTS WITH를 사용하면 접두사로 필터링할 수 있습니다.'
      },
      {
        id: 'where-contains',
        text: "MATCH (p:Person)-[:FRIEND_OF]->(friend) WHERE friend.name CONTAINS 'Q' SET friend.tag = 'lead' RETURN friend",
        correct: false,
        feedback: '이 쿼리는 SET을 사용해 데이터를 변경하려고 하므로 학습용 읽기 전용 흐름에 맞지 않습니다.'
      },
      {
        id: 'no-where',
        text: 'MATCH (p:Person)-[:FRIEND_OF]->(friend) RETURN friend ORDER BY friend.name',
        correct: false,
        feedback: '정렬만 하고 조건을 지정하지 않아 접두사 필터링이 되지 않습니다.'
      }
    ],
    explanation: 'STARTS WITH 조건을 WHERE 절에 추가하면 접두사를 기준으로 친구 목록을 좁힐 수 있습니다.'
  },
  {
    id: 'cypher-paths',
    type: 'cypher',
    domain: 'Query execution',
    concept: 'Path expansion',
    prompt:
      'Quokka는 친구의 친구까지 따라가며 사람 이름과 연결된 도시를 확인하고 싶습니다. 읽기 전용 MATCH 쿼리를 작성해 주세요.',
    starter: "MATCH (p:Person {name: 'Quokka'})-[:FRIEND_OF*1..2]->(friend)\nOPTIONAL MATCH (friend)-[:LIVES_IN]->(city)\nRETURN friend.name AS name, city.name AS city",
    expectations: {
      columns: ['name', 'city'],
      rowsDescription: '이름과 도시를 반환하는 행이 존재해야 합니다.'
    }
  }
];
