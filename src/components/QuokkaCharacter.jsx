function QuokkaCharacter({ speech, mood = 'ask' }) {
  return (
    <div className={`card quokka quokka--${mood}`} data-testid="quokka">
      <img src="./assets/quokka.svg" alt="Quokka mascot" />
      <div className="speech" data-testid="speech">
        {speech}
      </div>
    </div>
  );
}

export default QuokkaCharacter;
