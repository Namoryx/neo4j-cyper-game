import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { createQuestionPanel } from '../src/components/QuestionPanel.js';
import { questions } from '../src/data/questions.js';

const mcqQuestion = questions.find((q) => q.type === 'mcq');
const cypherQuestion = questions.find((q) => q.type === 'cypher');

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('MCQ feedback', () => {
  it('marks correct choices and enables navigation', () => {
    const dom = new JSDOM('<div id="quizHost"></div>');
    const panel = createQuestionPanel(mcqQuestion, 0, questions.length, { onAdvance: () => {} }, dom.window.document);
    const choices = panel.querySelectorAll('.choice');

    choices[0].dispatchEvent(new dom.window.Event('click', { bubbles: true }));

    expect(panel.classList.contains('flash-correct')).toBe(true);
    expect(panel.querySelector('.next-button').disabled).toBe(false);
    expect(panel.querySelector('.question-feedback').textContent).toContain('잠갔습니다');
  });

  it('shows shake animation for incorrect answers', () => {
    const dom = new JSDOM('<div id="quizHost"></div>');
    const panel = createQuestionPanel(mcqQuestion, 0, questions.length, { onAdvance: () => {} }, dom.window.document);
    const choices = panel.querySelectorAll('.choice');

    choices[1].dispatchEvent(new dom.window.Event('click', { bubbles: true }));

    expect(panel.classList.contains('shake-wrong')).toBe(true);
    expect(panel.querySelector('.next-button').disabled).toBe(true);
  });
});

describe('Cypher execution', () => {
  it('normalizes successful cypher responses and enables next', async () => {
    const dom = new JSDOM('<div id="quizHost"></div>', { url: 'http://localhost' });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ columns: ['name', 'city'], records: [{ row: ['Quokka', 'Perth'] }] })
    });
    const panel = createQuestionPanel(
      cypherQuestion,
      2,
      questions.length,
      { onAdvance: () => {} },
      dom.window.document,
      fetchMock
    );

    panel.querySelector('.run-cypher').dispatchEvent(new dom.window.Event('click', { bubbles: true }));
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(panel.querySelector('.question-feedback').textContent).toContain('결과를 확인했습니다');
    expect(panel.querySelector('.next-button').disabled).toBe(false);
  });

  it('blocks mutating cypher queries before reaching the runner', async () => {
    const dom = new JSDOM('<div id="quizHost"></div>', { url: 'http://localhost' });
    const fetchMock = vi.fn();
    const panel = createQuestionPanel(
      cypherQuestion,
      2,
      questions.length,
      { onAdvance: () => {} },
      dom.window.document,
      fetchMock
    );

    panel.querySelector('.cypher-input').value = 'CREATE (n) RETURN n';
    panel.querySelector('.run-cypher').dispatchEvent(new dom.window.Event('click', { bubbles: true }));
    await flush();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(panel.querySelector('.result-line').textContent).toContain('읽기 전용');
    expect(panel.querySelector('.next-button').disabled).toBe(true);
  });
});
