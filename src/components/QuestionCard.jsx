import McqOptions from './McqOptions.jsx';
import CypherEditor from './CypherEditor.jsx';

function QuestionCard({ question, selectedOption, setSelectedOption, cypherText, setCypherText, onSubmit }) {
  if (!question) return null;

  return (
    <div>
      <p className="subtitle">난이도: {question.difficulty}</p>
      <h2 className="question-text">{question.question}</h2>
      {question.type === 'mcq' ? (
        <McqOptions options={question.options} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      ) : (
        <CypherEditor value={cypherText} onChange={setCypherText} onSubmit={onSubmit} />
      )}
    </div>
  );
}

export default QuestionCard;
