import { useEffect, useMemo, useState } from 'react';
import Quiz from './components/Quiz.jsx';
import QuokkaCharacter from './components/QuokkaCharacter.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import DiagnosticsPanel from './components/DiagnosticsPanel.jsx';
import ModeSwitcher from './components/ModeSwitcher.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import Playground from './components/Playground.jsx';
import DataBrowser from './components/DataBrowser.jsx';
import Curriculum from './components/Curriculum.jsx';
import MissionBanner from './components/MissionBanner.jsx';
import StoryThemes from './components/StoryThemes.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import questions from './data/questions.json';
import {
  countPracticeStats,
  loadProgress,
  recordAttempt,
  updateSoundtrack,
  updateStoryIndex,
  updateStoryTheme,
  weakScore,
  DEFAULT_STORY_THEME,
} from './utils/progress.js';

function App() {
  const [speech, setSpeech] = useState('문제 풀어봐!');
  const [mood, setMood] = useState('ask');
  const [rows, setRows] = useState([]);
  const [impact, setImpact] = useState(null);
  const [mode, setMode] = useState('story');
  const [activeTab, setActiveTab] = useState('quiz');
  const [filters, setFilters] = useState({ domain: 'all', concepts: [], track: 'all', lesson: 'all', search: '' });
  const [filterDraft, setFilterDraft] = useState({ domain: 'all', concepts: [], track: 'all', lesson: 'all', search: '' });
  const [onlyWeak, setOnlyWeak] = useState(false);
  const [progress, setProgress] = useState({
    storyIndex: 0,
    storyTheme: DEFAULT_STORY_THEME,
    storyIndices: {},
    soundtrack: 'A',
    records: {},
  });
  const [storyTheme, setStoryTheme] = useState(DEFAULT_STORY_THEME);
  const [soundtrack, setSoundtrack] = useState('A');
  const [initialStoryIndex, setInitialStoryIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastRun, setLastRun] = useState(null);

  useEffect(() => {
    const loaded = loadProgress();
    const themeFromStorage = loaded.storyTheme ?? DEFAULT_STORY_THEME;
    const soundtrackFromStorage = loaded.soundtrack ?? 'A';
    const storyIndexFromTheme = loaded.storyIndices?.[themeFromStorage] ?? loaded.storyIndex ?? 0;

    setProgress(loaded);
    setStoryTheme(themeFromStorage);
    setSoundtrack(soundtrackFromStorage);
    setInitialStoryIndex(storyIndexFromTheme);
    setActiveIndex(storyIndexFromTheme);
  }, []);

  const domains = useMemo(() => ['all', ...new Set(questions.map((q) => q.domain))], []);
  const concepts = useMemo(() => Array.from(new Set(questions.flatMap((q) => q.concepts || []))), []);
  const tracks = useMemo(() => ['all', ...new Set(questions.map((q) => q.track))], []);
  const lessons = useMemo(() => {
    const source = filterDraft.track === 'all' ? questions : questions.filter((q) => q.track === filterDraft.track);
    return ['all', ...new Set(source.map((q) => q.lesson))];
  }, [filterDraft.track]);

  const activeFilters = useMemo(() => filters, [filters]);

  const practiceQuestions = useMemo(() => {
    const filtered = questions.filter((q) => {
      const domainMatch = activeFilters.domain === 'all' || q.domain === activeFilters.domain;
      const trackMatch = activeFilters.track === 'all' || q.track === activeFilters.track;
      const lessonMatch = activeFilters.lesson === 'all' || q.lesson === activeFilters.lesson;
      const conceptMatch =
        !activeFilters.concepts.length || activeFilters.concepts.every((c) => q.concepts?.includes(c));
      const searchMatch =
        !activeFilters.search ||
        q.question?.toLowerCase().includes(activeFilters.search.toLowerCase());
      return domainMatch && trackMatch && lessonMatch && conceptMatch && searchMatch;
    });

    if (onlyWeak) {
      const scored = filtered
        .map((q) => ({ question: q, score: weakScore(q.id, progress.records) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);
      if (scored.length) return scored.map((item) => item.question);
    }

    return filtered;
  }, [activeFilters, onlyWeak, progress.records]);

  const storyThemes = useMemo(
    () => [
      {
        id: 'general',
        title: '기본 그래프',
        description: 'Cypher 핵심 문법과 패턴을 차근차근 따라가세요.',
        domainLabel: 'general',
      },
      {
        id: 'shopping',
        title: '쇼핑 그래프',
        description: '장바구니, 주문, 추천 그래프에서 데이터를 찾으세요.',
        domainLabel: 'shopping',
      },
      {
        id: 'knowledge',
        title: '지식 그래프',
        description: '지식 그래프 탐색과 관계 패턴을 연습하세요.',
        domainLabel: 'knowledge',
      },
      {
        id: 'social',
        title: '소셜 네트워크',
        description: '친구 추천과 네트워크 확장 문제를 해결하세요.',
        domainLabel: 'social',
      },
    ],
    [],
  );

  const storyQuestions = useMemo(
    () => questions.filter((q) => q.domain === storyTheme),
    [storyTheme],
  );

  const activeQuestions = mode === 'story' ? storyQuestions : practiceQuestions;

  const practiceStats = useMemo(() => countPracticeStats(progress.records), [progress.records]);

  const handleFilterApply = () => {
    setFilters(filterDraft);
  };

  const handleProgressUpdate = ({ questionId, isCorrect, elapsedMs }) => {
    setProgress((prev) => recordAttempt(prev, { questionId, isCorrect, elapsedMs }));
  };

  const handleIndexPersist = (nextIndex) => {
    if (mode !== 'story') return;
    setProgress((prev) => updateStoryIndex(prev, nextIndex, storyTheme));
    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    setRows([]);
    setImpact(null);
    if (mode === 'story') {
      const nextIndex = progress.storyIndices?.[storyTheme] ?? progress.storyIndex ?? 0;
      setInitialStoryIndex(nextIndex);
      setActiveIndex(nextIndex);
    } else {
      setActiveIndex(0);
    }
  }, [mode, progress.storyIndex, progress.storyIndices, storyTheme]);

  useEffect(() => {
    setRows([]);
    setLastRun(null);
  }, [activeTab]);

  const handleCurriculumSelect = ({ track, lesson }) => {
    const nextFilters = {
      domain: 'all',
      concepts: [],
      track: track ?? 'all',
      lesson: lesson ?? 'all',
      search: '',
    };
    setFilterDraft(nextFilters);
    setFilters(nextFilters);
    setOnlyWeak(false);
    setMode('practice');
    setActiveTab('quiz');
  };

  const handleStoryThemeChange = (nextTheme) => {
    setStoryTheme(nextTheme);
    setProgress((prev) => {
      const updated = updateStoryTheme(prev, nextTheme);
      const nextIndex = updated.storyIndices?.[nextTheme] ?? updated.storyIndex ?? 0;
      setInitialStoryIndex(nextIndex);
      setActiveIndex(nextIndex);
      return updated;
    });
    setMode('story');
    setActiveTab('quiz');
  };

  const handleSoundtrackChange = (nextSoundtrack) => {
    setSoundtrack(nextSoundtrack);
    setProgress((prev) => updateSoundtrack(prev, nextSoundtrack));
  };

  return (
    <div className={`app ${impact ? `app--impact-${impact}` : ''}`}>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header__top">
            <h1 className="app-title">쿼카와 함께하는 Cypher 게임</h1>
            {activeTab === 'quiz' ? <ModeSwitcher mode={mode} onChange={setMode} /> : null}
          </div>
          <div className="app-header__progress">
            {activeTab === 'quiz' ? (
              mode === 'story' ? (
                <p>
                  현재 <strong>{activeIndex + 1}</strong> / 총 <strong>{activeQuestions.length}</strong>
                </p>
              ) : (
                <p>
                  오늘 연습: <strong>{practiceStats.attempts}</strong>회 · 누적 정답{' '}
                  <strong>{practiceStats.correct}</strong>
                </p>
              )
            ) : activeTab === 'curriculum' ? (
              <p className="muted">커리큘럼에서 레슨을 선택해 연습을 시작하세요.</p>
            ) : (
              <p className="muted">읽기 전용 데이터 탐색 모드</p>
            )}
          </div>
          <div className="app-tabs" role="tablist" aria-label="앱 탭">
            <button
              type="button"
              className={`chip ${activeTab === 'quiz' ? 'chip--active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'quiz'}
              onClick={() => setActiveTab('quiz')}
            >
              Quiz
            </button>
            <button
              type="button"
              className={`chip ${activeTab === 'playground' ? 'chip--active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'playground'}
              onClick={() => setActiveTab('playground')}
            >
              Playground
            </button>
            <button
              type="button"
              className={`chip ${activeTab === 'browse' ? 'chip--active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'browse'}
              onClick={() => setActiveTab('browse')}
            >
              Browse
            </button>
            <button
              type="button"
              className={`chip ${activeTab === 'curriculum' ? 'chip--active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'curriculum'}
              onClick={() => setActiveTab('curriculum')}
            >
              Curriculum
            </button>
          </div>
        </header>
        <main className="app-main">
          <section className="app-layout">
            <div className="app-primary">
              <QuokkaCharacter speech={speech} mood={mood} />
              <div className="app-panels">
              {activeTab === 'quiz' ? (
                <>
                  {mode === 'story' ? (
                    <StoryThemes
                      themes={storyThemes}
                      activeTheme={storyTheme}
                      onSelect={handleStoryThemeChange}
                    />
                  ) : null}
                  <FilterPanel
                    domains={domains}
                    concepts={concepts}
                    draftDomain={filterDraft.domain}
                    draftConcepts={filterDraft.concepts}
                    draftTrack={filterDraft.track}
                    draftLesson={filterDraft.lesson}
                    draftSearch={filterDraft.search}
                    onDraftDomainChange={(value) => setFilterDraft((prev) => ({ ...prev, domain: value }))}
                    onDraftSearchChange={(value) => setFilterDraft((prev) => ({ ...prev, search: value }))}
                    onDraftTrackChange={(value) => setFilterDraft((prev) => ({ ...prev, track: value, lesson: 'all' }))}
                    onDraftLessonChange={(value) => setFilterDraft((prev) => ({ ...prev, lesson: value }))}
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
                    tracks={tracks}
                    lessons={lessons}
                    showPracticeFilters={mode === 'practice'}
                  />
                  {mode === 'practice' ? (
                    <MissionBanner questions={questions} progress={progress.records} />
                  ) : null}
                  <Quiz
                    key={`${mode}-${storyTheme}-${activeFilters.domain}-${activeFilters.track}-${activeFilters.lesson}-${activeFilters.search}-${activeFilters.concepts.join(',')}-${onlyWeak}-${activeQuestions.length}`}
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
                </>
              ) : null}
              {activeTab === 'playground' ? (
                <Playground onResultsChange={setRows} onLastRun={setLastRun} />
              ) : null}
              {activeTab === 'browse' ? (
                <DataBrowser onResultsChange={setRows} onLastRun={setLastRun} />
              ) : null}
              {activeTab === 'curriculum' ? (
                <Curriculum questions={questions} progress={progress.records} onLessonSelect={handleCurriculumSelect} />
              ) : null}
              </div>
            </div>
            <aside className="app-sidebar" aria-label="Query results">
              <ResultPanel rows={rows} />
              <DiagnosticsPanel lastRun={lastRun} />
              <SettingsPanel soundtrack={soundtrack} onSoundtrackChange={handleSoundtrackChange} />
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
