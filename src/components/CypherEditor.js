import { executeReadOnlyCypher } from '../neo4jRunner.js';

export function createCypherEditor(question, onResult, doc = document, fetchImpl) {
  const container = doc.createElement('div');
  container.className = 'cypher-editor';

  const textarea = doc.createElement('textarea');
  textarea.className = 'cypher-input';
  textarea.value = question.starter || '';

  const runButton = doc.createElement('button');
  runButton.className = 'btn run-cypher';
  runButton.type = 'button';
  runButton.textContent = '쿼리 실행';

  const status = doc.createElement('div');
  status.className = 'result-line muted';
  status.textContent = '쿼리를 실행해 결과를 확인하세요.';

  runButton.addEventListener('click', async () => {
    status.textContent = '실행 중...';
    container.classList.remove('flash-correct', 'shake-wrong');

    const response = await executeReadOnlyCypher(textarea.value, fetchImpl);
    if (response.ok) {
      const rowCount = response.rows?.length ?? 0;
      status.textContent = `${rowCount}행을 반환했습니다.`;
      status.classList.remove('error');
      container.classList.add('flash-correct');
      onResult(true, response);
    } else {
      status.textContent = response.error;
      status.classList.add('error');
      container.classList.add('shake-wrong');
      onResult(false, response);
    }
  });

  container.appendChild(textarea);
  container.appendChild(runButton);
  container.appendChild(status);
  return container;
}
