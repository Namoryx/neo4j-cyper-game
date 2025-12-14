import { useEffect, useState } from 'react';
import questions from '../data/questions.json';
import QuestionCard from './QuestionCard.jsx';
import Feedback from './Feedback.jsx';

function Quiz({ onSpeechChange }) {
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [cypherText, setCypherText] = useState('');
  const [phase, setPhase] = useState('answering');
  const [isCorrect, setIsCorrect] = useState(null);
  const [lastError, setLastError] = useState(null);

  const currentQuestion = questions[index];

  useEffect(() => {
    if (!onSpeechChange) return;

    if (phase === 'finished') {
      onSpeechChange('오늘도 레벨업 완료!');
      return;
    }

    if (phase === 'feedback') {
      onSpeechChange(isCorrect ? '오예! 그래프가 웃고 있어!' : '흠… 그래프는 거짓말 안 해.');
      return;
    }

    onSpeechChange('문제 풀어봐!');
  }, [isCorrect, onSpeechChange, phase]);

  const resetForNextQuestion = (nextIndex) => {
    setIndex(nextIndex);
    setSelectedOption(null);
    setCypherText('');
    setIsCorrect(null);
    setLastError(null);
    setPhase('answering');
  };

  const handleSubmit = () => {
    setLastError(null);
    if (!currentQuestion) return;

    if (currentQuestion.type === 'mcq') {
      if (!selectedOption) {
        setLastError('보기를 선택해주세요.');
        return;
      }

      const correct = selectedOption === currentQuestion.answer;
      setIsCorrect(correct);
      setPhase('feedback');
      return;
    }

    if (!cypherText.trim()) {
      setLastError('Cypher를 입력해주세요.');
      return;
    }

    setIsCorrect(false);
    setPhase('feedback');
  };

  const handleNext = () => {
    const nextIndex = index + 1;
    if (nextIndex < questions.length) {
      resetForNextQuestion(nextIndex);
      return;
    }

    setPhase('finished');
  };

  const handleRestart = () => {
    resetForNextQuestion(0);
  };

  if (!currentQuestion) return null;

  return (
    <div className="card quiz-card">
      <p className="subtitle">그래프 문제 세트 · 프리뷰</p>

      {phase === 'finished' ? (
        <div className="finished-card">
          <h2 className="question-text">모든 문제를 풀었습니다!</h2>
          <p className="subtitle">퀴즈를 다시 시작해 더 연습해보세요.</p>
          <button type="button" className="primary-button" onClick={handleRestart}>
            다시 시작
          </button>
        </div>
      ) : phase === 'feedback' ? (
        <Feedback isCorrect={isCorrect} question={currentQuestion} onNext={handleNext} />
      ) : (
        <>
          <QuestionCard
            question={currentQuestion}
            selectedOption={selectedOption}
            setSelectedOption={(value) => {
              setSelectedOption(value);
              setLastError(null);
            }}
            cypherText={cypherText}
            setCypherText={(value) => {
              setCypherText(value);
              setLastError(null);
            }}
            onSubmit={handleSubmit}
          />
          {lastError ? <p className="error-text">{lastError}</p> : null}
          <button type="button" className="primary-button" onClick={handleSubmit}>
            제출
          </button>
        </>
      )}
    </div>
  );
}

export default Quiz;
