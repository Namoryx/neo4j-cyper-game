function McqOptions({ options = [], selectedOption, setSelectedOption }) {
  return (
    <div className="options">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`option-button${selectedOption === option ? ' selected' : ''}`}
          onClick={() => setSelectedOption(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default McqOptions;
