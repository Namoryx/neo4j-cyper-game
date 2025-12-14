import { questions } from './data/questions.js';
import { createQuestionPanel } from './components/QuestionPanel.js';

function renderQuiz(doc = document, fetchImpl) {
  const host = doc.getElementById('quizHost');
  if (!host) return;

  let index = 0;

  const mountQuestion = () => {
    host.innerHTML = '';
    const panel = createQuestionPanel(
      questions[index],
      index,
      questions.length,
      {
        onAdvance: () => {
          index = (index + 1) % questions.length;
          mountQuestion();
        }
      },
      doc,
      fetchImpl
    );
    host.appendChild(panel);
    const tracker = doc.getElementById('quizProgress');
    if (tracker) {
      tracker.textContent = `지금 ${index + 1}/${questions.length} 문제를 풀고 있습니다.`;
    }
  };

  mountQuestion();
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => renderQuiz());
}

export { renderQuiz };
