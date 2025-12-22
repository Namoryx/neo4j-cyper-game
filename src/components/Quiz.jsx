import { useEffect, useRef, useState } from 'react';
import QuestionCard from './QuestionCard.jsx';
import Feedback from './Feedback.jsx';
import { runCypher } from '../services/api.js';
import { toRows } from '../utils/normalize.js';
import { gradeCypher, gradeMcq } from '../utils/grading.js';

function Quiz({
  questions,
  startingIndex = 0,
  onSpeechChange,
  onMoodChange,
  onImpact,
  onResultsChange,
  onProgressUpdate,
  onIndexPersist,
  onIndexChange,
}) {
  const [index, setIndex] = useState(startingIndex);
  const [selectedOption, setSelectedOption] = useState(null);
  const [cypherText, setCypherText] = useState('');
  const [phase, setPhase] = useState('answering');
  const [isCorrect, setIsCorrect] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [questionStart, setQuestionStart] = useState(Date.now());
  const initializedRef = useRef(false);

  const currentQuestion = questions?.[index];
  const questionType = currentQuestion?.type;

  useEffect(() => {
    if (!onSpeechChange && !onMoodChange) return;

    if (phase === 'finished') {
      onSpeechChange?.('오늘도 레벨업 완료!');
      onMoodChange?.('happy');
      return;
    }

    if (phase === 'feedback') {
      onSpeechChange?.(isCorrect ? '오예! 그래프가 웃고 있어!' : '흠… 그래프는 거짓말 안 해.');
      onMoodChange?.(isCorrect ? 'happy' : 'angry');
      return;
    }

    onSpeechChange?.('문제 풀어봐!');
    onMoodChange?.(questionType === 'cypher' ? 'thinking' : 'ask');
  }, [isCorrect, onMoodChange, onSpeechChange, phase, questionType]);

  useEffect(() => {
    if (!onImpact) return undefined;

    if (phase === 'feedback') {
      const impactType = isCorrect ? 'correct' : 'wrong';
      onImpact(impactType);
      const timer = setTimeout(() => onImpact(null), 600);
      return () => clearTimeout(timer);
    }

    onImpact(null);
    return undefined;
  }, [isCorrect, onImpact, phase]);

  useEffect(() => {
    if (!questions?.length) return;
    if (initializedRef.current) return;
    initializedRef.current = true;
    setIndex(Math.min(startingIndex, questions.length - 1));
  }, [questions, startingIndex]);

  useEffect(() => {
    if (questions?.length === 0) {
      setIndex(0);
    } else if (index >= questions.length) {
      setIndex(0);
    }
  }, [index, questions]);

  useEffect(() => {
    if (!currentQuestion) return;
    setQuestionStart(Date.now());
  }, [currentQuestion?.id]);

  const resetForNextQuestion = (nextIndex) => {
    setIndex(nextIndex);
    setSelectedOption(null);
    setCypherText('');
    setIsCorrect(null);
    setLastError(null);
    setPhase('answering');
    setQuestionStart(Date.now());
    onResultsChange?.([]);
    onIndexChange?.(nextIndex);
  };

  const handleSubmit = async () => {
    setLastError(null);
    if (!currentQuestion) return;

    if (currentQuestion.type === 'mcq') {
      if (!selectedOption) {
        setLastError('보기를 선택해주세요.');
        return;
      }

      const elapsedMs = Date.now() - questionStart;
      const { isCorrect: mcqCorrect } = gradeMcq(currentQuestion, selectedOption);
      setIsCorrect(mcqCorrect);
      setPhase('feedback');
      onResultsChange?.([]);
      onProgressUpdate?.({ questionId: currentQuestion.id, isCorrect: mcqCorrect, elapsedMs });
      return;
    }

    if (!cypherText.trim()) {
      setLastError('Cypher를 입력해주세요.');
      return;
    }

    try {
      setIsRunning(true);
      const response = await runCypher(cypherText, {});
      const rows = toRows(response);
      onResultsChange?.(rows?.slice(0, 10) ?? []);
      const { isCorrect: cypherCorrect } = gradeCypher(currentQuestion, rows);
      const elapsedMs = Date.now() - questionStart;
      setIsCorrect(cypherCorrect);
      setPhase('feedback');
      onProgressUpdate?.({ questionId: currentQuestion.id, isCorrect: cypherCorrect, elapsedMs });
    } catch (error) {
      setLastError(error?.message || '실행 중 오류가 발생했습니다.');
      onResultsChange?.([]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleNext = () => {
    const nextIndex = index + 1;
    if (nextIndex < questions.length) {
      resetForNextQuestion(nextIndex);
      onIndexPersist?.(nextIndex);
      return;
    }

    onIndexPersist?.(questions.length - 1);
    setPhase('finished');
  };

  const handleRestart = () => {
    resetForNextQuestion(0);
    onIndexPersist?.(0);
  };

  if (!questions?.length) {
    return (
      <div className="card quiz-card">
        <p className="subtitle">그래프 문제 세트 · 프리뷰</p>
        <div className="finished-card">
          <h2 className="question-text">조건에 맞는 문제가 없습니다.</h2>
          <p className="subtitle">필터를 수정하거나 스토리 모드로 돌아가 보세요.</p>
        </div>
      </div>
    );
  }

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
          <button type="button" className="primary-button" onClick={handleSubmit} disabled={isRunning}>
            {isRunning ? '실행중...' : '제출'}
          </button>
        </>
      )}
    </div>
  );
}

export default Quiz;
