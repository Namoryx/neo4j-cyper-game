import { useEffect, useMemo, useState } from 'react';
import Quiz from './components/Quiz.jsx';
import QuokkaCharacter from './components/QuokkaCharacter.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import DiagnosticsPanel from './components/DiagnosticsPanel.jsx';
import ModeSwitcher from './components/ModeSwitcher.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import questions from './data/questions.json';
import { countPracticeStats, loadProgress, recordAttempt, updateStoryIndex } from './utils/progress.js';

function App() {
  const [speech, setSpeech] = useState('문제 풀어봐!');
  const [mood, setMood] = useState('ask');
  const [rows, setRows] = useState([]);
  const [impact, setImpact] = useState(null);
  const [mode, setMode] = useState('story');
  const [filters, setFilters] = useState({ domain: 'all', concepts: [] });
  const [filterDraft, setFilterDraft] = useState({ domain: 'all', concepts: [] });
  const [onlyWeak, setOnlyWeak] = useState(false);
  const [progress, setProgress] = useState({ storyIndex: 0, records: {} });
  const [initialStoryIndex, setInitialStoryIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loaded = loadProgress();
    setProgress(loaded);
    setInitialStoryIndex(loaded.storyIndex ?? 0);
    setActiveIndex(loaded.storyIndex ?? 0);
  }, []);

  const domains = useMemo(() => ['all', ...new Set(questions.map((q) => q.domain))], []);
  const concepts = useMemo(() => Array.from(new Set(questions.flatMap((q) => q.concepts || []))), []);

  const weaknessPool = useMemo(() => {
    return questions.filter((q) => {
      const record = progress.records?.[q.id];
      return record && record.attempts > 0 && !record.lastIsCorrect;
    });
  }, [progress.records]);

  const activeFilters = useMemo(() => filters, [filters]);

  const practiceQuestions = useMemo(() => {
    const filtered = questions.filter((q) => {
      const domainMatch = activeFilters.domain === 'all' || q.domain === activeFilters.domain;
      const conceptMatch =
        !activeFilters.concepts.length || activeFilters.concepts.every((c) => q.concepts?.includes(c));
      return domainMatch && conceptMatch;
    });

    if (onlyWeak && weaknessPool.length) {
      return filtered.filter((q) => weaknessPool.some((weak) => weak.id === q.id));
    }

    return filtered;
  }, [activeFilters, onlyWeak, weaknessPool]);

  const activeQuestions = mode === 'story' ? questions : practiceQuestions;

  const practiceStats = useMemo(() => countPracticeStats(progress.records), [progress.records]);

  const handleFilterApply = () => {
    setFilters(filterDraft);
  };

  const handleProgressUpdate = ({ questionId, isCorrect }) => {
    setProgress((prev) => recordAttempt(prev, { questionId, isCorrect }));
  };

  const handleIndexPersist = (nextIndex) => {
    if (mode !== 'story') return;
    setProgress((prev) => updateStoryIndex(prev, nextIndex));
    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    setRows([]);
    setImpact(null);
    if (mode === 'story') {
      setActiveIndex(progress.storyIndex ?? 0);
    } else {
      setActiveIndex(0);
    }
  }, [mode, progress.storyIndex]);

  return (
    <div className={`app ${impact ? `app--impact-${impact}` : ''}`}>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header__top">
            <h1 className="app-title">쿼카와 함께하는 Cypher 게임</h1>
            <ModeSwitcher mode={mode} onChange={setMode} />
          </div>
          <div className="app-header__progress">
            {mode === 'story' ? (
              <p>
                현재 <strong>{activeIndex + 1}</strong> / 총 <strong>{questions.length}</strong>
              </p>
            ) : (
              <p>
                오늘 연습: <strong>{practiceStats.attempts}</strong>회 · 최근 정답{' '}
                <strong>{practiceStats.correct}</strong>
              </p>
            )}
          </div>
        </header>
        <main className="app-main">
          <section className="app-layout">
            <QuokkaCharacter speech={speech} mood={mood} />
            <div className="app-panels">
              <FilterPanel
                domains={domains}
                concepts={concepts}
                draftDomain={filterDraft.domain}
                draftConcepts={filterDraft.concepts}
                onDraftDomainChange={(value) => setFilterDraft((prev) => ({ ...prev, domain: value }))}
                onDraftConceptToggle={(concept) =>
                  setFilterDraft((prev) => {
                    const has = prev.concepts.includes(concept);
                    return {
                      ...prev,
                      concepts: has
                        ? prev.concepts.filter((c) => c !== concept)
                        : [...prev.concepts, concept],
                    };
                  })
                }
                onApply={handleFilterApply}
                onlyWeak={onlyWeak}
                onWeakToggle={setOnlyWeak}
                disabled={mode !== 'practice'}
              />
              <Quiz
                key={`${mode}-${activeFilters.domain}-${activeFilters.concepts.join(',')}-${onlyWeak}-${activeQuestions.length}`}
                questions={activeQuestions}
                startingIndex={mode === 'story' ? initialStoryIndex : 0}
                onSpeechChange={setSpeech}
                onMoodChange={setMood}
                onImpact={setImpact}
                onResultsChange={setRows}
                onProgressUpdate={handleProgressUpdate}
                onIndexPersist={handleIndexPersist}
                onIndexChange={setActiveIndex}
              />
              <ResultPanel rows={rows} />
              <DiagnosticsPanel />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
