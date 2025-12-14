import { createChoiceList } from './ChoiceList.js';
import { createCypherEditor } from './CypherEditor.js';

function buildHeader(question, index, total, doc) {
  const header = doc.createElement('div');
  header.className = 'question-header';

  const badge = doc.createElement('span');
  badge.className = 'badge';
  badge.textContent = `${question.domain} · ${question.concept}`;

  const title = doc.createElement('h3');
  title.textContent = `Q${index + 1}/${total} — ${question.type === 'mcq' ? '선택형' : 'Cypher 작성'}`;

  const prompt = doc.createElement('p');
  prompt.className = 'question-prompt';
  prompt.textContent = question.prompt;

  header.appendChild(badge);
  header.appendChild(title);
  header.appendChild(prompt);
  return header;
}

function buildFeedback(doc) {
  const feedback = doc.createElement('div');
  feedback.className = 'question-feedback muted';
  feedback.textContent = '답을 선택하거나 Cypher를 실행해 주세요.';
  return feedback;
}

export function createQuestionPanel(question, index, total, options, doc = document, fetchImpl) {
  const container = doc.createElement('div');
  container.className = 'question-panel';

  const header = buildHeader(question, index, total, doc);
  const feedback = buildFeedback(doc);
  const controls = doc.createElement('div');
  controls.className = 'question-controls';

  const nextButton = doc.createElement('button');
  nextButton.textContent = index === total - 1 ? '완료' : '다음';
  nextButton.className = 'btn secondary next-button';
  nextButton.disabled = true;
  nextButton.addEventListener('click', () => options?.onAdvance?.());

  if (question.type === 'mcq') {
    const choiceList = createChoiceList(question, ({ correct, choice }) => {
      feedback.textContent = choice.feedback;
      feedback.classList.toggle('error', !correct);
      container.classList.remove('shake-wrong', 'flash-correct');
      if (correct) {
        feedback.textContent = `${choice.feedback} 답변을 잠갔습니다.`;
        container.classList.add('flash-correct');
        nextButton.disabled = false;
      } else {
        container.classList.add('shake-wrong');
      }
    }, doc);
    controls.appendChild(choiceList);
  } else {
    const editor = createCypherEditor(
      question,
      (ok) => {
        feedback.textContent = ok
          ? `${question.expectations.rowsDescription} 결과를 확인했습니다.`
          : '읽기 전용 규칙을 확인하고 다시 시도하세요.';
        feedback.classList.toggle('error', !ok);
        if (ok) nextButton.disabled = false;
      },
      doc,
      fetchImpl
    );
    controls.appendChild(editor);
  }

  controls.appendChild(feedback);
  container.appendChild(header);
  container.appendChild(controls);
  container.appendChild(nextButton);

  return container;
}
