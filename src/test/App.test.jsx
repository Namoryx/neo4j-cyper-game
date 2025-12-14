import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

const FIRST_QUESTION_TEXT = '다음 MATCH 패턴에서 방향성이 의미하는 것은 무엇인가요?';
const FIRST_ANSWER = '왼쪽 노드에서 오른쪽 노드로 향하는 관계';

describe('App scaffold', () => {
  it('renders the main title', () => {
    render(<App />);
    expect(screen.getByText('쿼카와 함께하는 Cypher 게임')).toBeInTheDocument();
  });

  it('shows quokka character with speech bubble', () => {
    render(<App />);
    expect(screen.getByTestId('quokka')).toBeInTheDocument();
    expect(screen.getByTestId('speech')).toHaveTextContent('문제 풀어봐!');
  });

  it('displays the first question from questions.json', () => {
    render(<App />);
    expect(screen.getByText(FIRST_QUESTION_TEXT)).toBeInTheDocument();
  });

  it('renders mcq options for the first question', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: FIRST_ANSWER })).toBeInTheDocument();
  });

  it('submits the first mcq answer and shows feedback', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: FIRST_ANSWER }));
    await userEvent.click(screen.getByRole('button', { name: '제출' }));

    expect(await screen.findByText(/정답|오답/)).toBeInTheDocument();
  });

  it('moves to next question after feedback', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: FIRST_ANSWER }));
    await userEvent.click(screen.getByRole('button', { name: '제출' }));

    await userEvent.click(await screen.findByRole('button', { name: '다음' }));
    expect(
      screen.getByText('Neo4j에서 특정 레이블의 노드가 존재하는지 가장 빠르게 확인하려면 어떤 인덱스를 사용하나요?')
    ).toBeInTheDocument();
  });
});
