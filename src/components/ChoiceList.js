export function gradeChoice(question, choiceId) {
  const choice = question.choices.find((item) => item.id === choiceId);
  return Boolean(choice?.correct);
}

export function createChoiceList(question, onResult, doc = document) {
  const list = doc.createElement('div');
  list.className = 'choice-list';

  question.choices.forEach((choice) => {
    const button = doc.createElement('button');
    button.className = 'choice';
    button.type = 'button';
    button.textContent = choice.text;
    button.addEventListener('click', () => {
      const correct = gradeChoice(question, choice.id);
      onResult({ correct, choice });
    });
    list.appendChild(button);
  });

  return list;
}
