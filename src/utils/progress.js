const STORAGE_KEY = 'quokkaCypherProgress:v2';
const LEGACY_STORAGE_KEY = 'quokkaCypherProgress:v1';

export const DEFAULT_STORY_THEME = 'general';

const defaultProgress = {
  storyIndex: 0,
  storyTheme: DEFAULT_STORY_THEME,
  storyIndices: {},
  soundtrack: 'A',
  records: {},
};

function migrateLegacyProgress(legacy) {
  if (!legacy?.records) return { ...defaultProgress };

  const migratedRecords = Object.entries(legacy.records).reduce((acc, [questionId, record]) => {
    const attempts = record?.attempts ?? 0;
    const lastWasCorrect = Boolean(record?.lastIsCorrect);
    acc[questionId] = {
      attempts,
      corrects: lastWasCorrect ? 1 : 0,
      lastWasCorrect,
      lastAttemptAt: record?.lastAttemptAt ?? null,
      avgMs: null,
    };
    return acc;
  }, {});

  return {
    storyIndex: legacy?.storyIndex ?? 0,
    storyTheme: DEFAULT_STORY_THEME,
    storyIndices: {},
    soundtrack: 'A',
    records: migratedRecords,
  };
}

export function loadProgress() {
  if (typeof localStorage === 'undefined') return { ...defaultProgress };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        storyIndex: parsed?.storyIndex ?? 0,
        storyTheme: parsed?.storyTheme ?? DEFAULT_STORY_THEME,
        storyIndices: parsed?.storyIndices ?? {},
        soundtrack: parsed?.soundtrack ?? 'A',
        records: parsed?.records ?? {},
      };
    }
  } catch (error) {
    console.warn('Failed to load progress', error);
  }

  try {
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) return { ...defaultProgress };
    const legacyParsed = JSON.parse(legacyRaw);
    const migrated = migrateLegacyProgress(legacyParsed);
    saveProgress(migrated);
    return migrated;
  } catch (error) {
    console.warn('Failed to migrate legacy progress', error);
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

export function recordAttempt(prevProgress, { questionId, isCorrect, timestamp = Date.now(), elapsedMs }) {
  if (!questionId) return prevProgress ?? { ...defaultProgress };

  const base = prevProgress ?? { ...defaultProgress };
  const current = base.records?.[questionId] ?? {
    attempts: 0,
    corrects: 0,
    lastWasCorrect: false,
    lastAttemptAt: null,
    avgMs: null,
  };

  const nextAttempts = current.attempts + 1;
  const nextCorrects = current.corrects + (isCorrect ? 1 : 0);
  const nextAvgMs =
    typeof elapsedMs === 'number' && Number.isFinite(elapsedMs)
      ? Math.round(((current.avgMs ?? 0) * current.attempts + elapsedMs) / nextAttempts)
      : current.avgMs ?? null;

  const updatedRecord = {
    attempts: nextAttempts,
    corrects: nextCorrects,
    lastWasCorrect: Boolean(isCorrect),
    lastAttemptAt: timestamp,
    avgMs: nextAvgMs,
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

export function updateStoryIndex(prevProgress, nextIndex, theme = null) {
  const base = prevProgress ?? { ...defaultProgress };
  const themeKey = theme ?? base.storyTheme ?? DEFAULT_STORY_THEME;
  const storyIndices = { ...(base.storyIndices ?? {}) };
  storyIndices[themeKey] = Math.max(0, nextIndex ?? 0);

  const nextProgress = {
    ...base,
    storyTheme: themeKey,
    storyIndices,
    storyIndex: storyIndices[themeKey],
  };
  saveProgress(nextProgress);
  return nextProgress;
}

export function updateStoryTheme(prevProgress, nextTheme) {
  const base = prevProgress ?? { ...defaultProgress };
  const themeKey = nextTheme ?? DEFAULT_STORY_THEME;
  const storyIndices = { ...(base.storyIndices ?? {}) };
  const nextIndex = storyIndices[themeKey] ?? 0;

  const nextProgress = {
    ...base,
    storyTheme: themeKey,
    storyIndex: nextIndex,
    storyIndices,
  };
  saveProgress(nextProgress);
  return nextProgress;
}

export function updateSoundtrack(prevProgress, soundtrack) {
  const base = prevProgress ?? { ...defaultProgress };
  const nextProgress = { ...base, soundtrack: soundtrack ?? base.soundtrack ?? 'A' };
  saveProgress(nextProgress);
  return nextProgress;
}

export function countPracticeStats(records = {}) {
  const values = Object.values(records);
  if (!values.length) return { attempts: 0, correct: 0 };

  const attempts = values.reduce((sum, rec) => sum + (rec?.attempts ?? 0), 0);
  const correct = values.reduce((sum, rec) => sum + (rec?.corrects ?? 0), 0);
  return { attempts, correct };
}

export function weakScore(questionId, records = {}, now = Date.now()) {
  if (!questionId) return 0;
  const record = records?.[questionId];
  if (!record || !record.attempts) return 0;

  const accuracy = record.corrects ? record.corrects / record.attempts : 0;
  const missPenalty = record.lastWasCorrect ? 0 : 0.5;
  const accuracyPenalty = 1 - accuracy;
  const daysSince =
    record.lastAttemptAt ? Math.min((now - record.lastAttemptAt) / (1000 * 60 * 60 * 24), 30) : 30;
  const timeBonus = Math.min(daysSince / 7, 1) * 0.2;

  return Number((accuracyPenalty + missPenalty + timeBonus).toFixed(3));
}
