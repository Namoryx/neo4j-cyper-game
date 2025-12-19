function QuokkaCharacter({ speech, mood = 'ask' }) {
  const imageSrc = `${import.meta.env.BASE_URL}assets/quokka.svg`;

  return (
    <div className={`card quokka quokka--${mood}`} data-testid="quokka">
      <img src={imageSrc} alt="Quokka mascot" />
      <div className="speech" data-testid="speech">
        {speech}
      </div>
    </div>
  );
}

export default QuokkaCharacter;
