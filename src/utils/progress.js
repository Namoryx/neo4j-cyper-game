const STORAGE_KEY = 'quokkaCypherProgress:v1';

const defaultProgress = { storyIndex: 0, records: {} };

export function loadProgress() {
  if (typeof localStorage === 'undefined') return { ...defaultProgress };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    const parsed = JSON.parse(raw);
    return {
      storyIndex: parsed?.storyIndex ?? 0,
      records: parsed?.records ?? {},
    };
  } catch (error) {
    console.warn('Failed to load progress', error);
    return { ...defaultProgress };
  }
}

export function saveProgress(progress) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save progress', error);
  }
}

export function recordAttempt(prevProgress, { questionId, isCorrect, timestamp = Date.now() }) {
  if (!questionId) return prevProgress ?? { ...defaultProgress };

  const base = prevProgress ?? { ...defaultProgress };
  const current = base.records?.[questionId] ?? { attempts: 0, lastIsCorrect: false, lastAttemptAt: null };

  const updatedRecord = {
    attempts: current.attempts + 1,
    lastIsCorrect: Boolean(isCorrect),
    lastAttemptAt: timestamp,
  };

  const nextProgress = {
    ...base,
    records: {
      ...base.records,
      [questionId]: updatedRecord,
    },
  };

  saveProgress(nextProgress);
  return nextProgress;
}

export function updateStoryIndex(prevProgress, nextIndex) {
  const base = prevProgress ?? { ...defaultProgress };
  const nextProgress = { ...base, storyIndex: Math.max(0, nextIndex ?? 0) };
  saveProgress(nextProgress);
  return nextProgress;
}

export function countPracticeStats(records = {}) {
  const values = Object.values(records);
  if (!values.length) return { attempts: 0, correct: 0 };

  const attempts = values.reduce((sum, rec) => sum + (rec?.attempts ?? 0), 0);
  const correct = values.reduce((sum, rec) => sum + (rec?.lastIsCorrect ? 1 : 0), 0);
  return { attempts, correct };
}
