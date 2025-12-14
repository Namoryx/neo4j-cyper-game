function Feedback({ isCorrect, question, onNext }) {
  const title = isCorrect ? '정답!' : '오답!';
  const message = isCorrect
    ? question?.explanation
    : `힌트: ${question?.hint?.[0] ?? '힌트를 찾을 수 없어요.'}`;

  return (
    <div className="card feedback-card">
      <p className="subtitle">피드백</p>
      <h2 className="question-text">{title}</h2>
      <p className="feedback-body">{message}</p>
      {!isCorrect ? (
        <p className="feedback-body muted">{question?.explanation}</p>
      ) : null}
      <button type="button" className="primary-button" onClick={onNext}>
        다음
      </button>
    </div>
  );
}

export default Feedback;
