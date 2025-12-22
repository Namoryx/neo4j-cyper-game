import { useEffect, useMemo, useState } from 'react';

function Curriculum({ questions = [], progress = {}, onLessonSelect }) {
  const tracks = useMemo(() => Array.from(new Set(questions.map((q) => q.track))), [questions]);
  const [activeTrack, setActiveTrack] = useState(tracks[0] ?? '');

  useEffect(() => {
    if (!activeTrack && tracks.length) {
      setActiveTrack(tracks[0]);
    }
  }, [activeTrack, tracks]);

  const lessons = useMemo(() => {
    return questions
      .filter((q) => q.track === activeTrack)
      .reduce((acc, question) => {
        const lesson = question.lesson;
        if (!acc[lesson]) acc[lesson] = [];
        acc[lesson].push(question);
        return acc;
      }, {});
  }, [activeTrack, questions]);

  const lessonEntries = Object.entries(lessons).sort(([a], [b]) => a.localeCompare(b));

  const getLessonStats = (lessonQuestions) => {
    const total = lessonQuestions.length;
    const solved = lessonQuestions.filter((q) => (progress?.[q.id]?.attempts ?? 0) > 0).length;
    const attempts = lessonQuestions.reduce((sum, q) => sum + (progress?.[q.id]?.attempts ?? 0), 0);
    const corrects = lessonQuestions.reduce((sum, q) => sum + (progress?.[q.id]?.corrects ?? 0), 0);
    const rate = attempts ? Math.round((corrects / attempts) * 100) : 0;
    return { total, solved, rate };
  };

  return (
    <div className="card curriculum-card">
      <div className="card-header">
        <p className="subtitle">Curriculum</p>
        <span className="muted">트랙별 레슨을 선택해 연습하세요.</span>
      </div>
      <div className="curriculum">
        <aside className="curriculum__tracks" data-testid="curriculum-track-list">
          {tracks.map((track) => (
            <button
              key={track}
              type="button"
              className={`curriculum-track ${track === activeTrack ? 'curriculum-track--active' : ''}`}
              onClick={() => setActiveTrack(track)}
            >
              {track}
            </button>
          ))}
        </aside>
        <div className="curriculum__lessons">
          {!lessonEntries.length ? <p className="muted">레슨이 없습니다.</p> : null}
          {lessonEntries.map(([lesson, lessonQuestions]) => {
            const stats = getLessonStats(lessonQuestions);
            return (
              <div key={lesson} className="curriculum-lesson">
                <div>
                  <h3 className="curriculum-lesson__title">{lesson}</h3>
                  <p className="muted">{lessonQuestions.length}문제 · {lessonQuestions[0]?.concepts?.join(', ')}</p>
                </div>
                <div className="curriculum-lesson__meta">
                  <span className="badge">{stats.solved}/{stats.total} 완료</span>
                  <span className="badge">정답률 {stats.rate}%</span>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => onLessonSelect?.({ track: activeTrack, lesson })}
                  >
                    연습 시작
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Curriculum;
