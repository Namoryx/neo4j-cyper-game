import { extractValues } from './extractors.js';

export function gradeMcq(question, selectedOption) {
  const isCorrect = selectedOption === question?.answer;
  return { isCorrect, feedback: isCorrect ? '정답' : '오답' };
}

function normalizeList(values = []) {
  return values
    .map((item) => String(item).trim())
    .filter((value, index, arr) => value !== '' && arr.indexOf(value) === index);
}

export function gradeCypher(question, rows) {
  const expected = normalizeList(question?.expected || []);
  const received = normalizeList(extractValues(rows));

  if (question?.ordered) {
    const isCorrect = expected.length === received.length && expected.every((val, idx) => val === received[idx]);
    return { isCorrect, expected, received };
  }

  const expectedSorted = [...expected].sort();
  const receivedSorted = [...received].sort();
  const isCorrect =
    expectedSorted.length === receivedSorted.length &&
    expectedSorted.every((val, idx) => val === receivedSorted[idx]);

  return { isCorrect, expected, received };
}
