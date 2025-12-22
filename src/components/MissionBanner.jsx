import { useMemo } from 'react';
import missions from '../data/missions.json';

function pickMissions(list = [], count = 3, seed = '') {
  if (!list.length) return [];
  const hash = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const start = hash % list.length;
  return Array.from({ length: Math.min(count, list.length) }, (_, idx) => list[(start + idx) % list.length]);
}

function MissionBanner({ questions = [], progress = {} }) {
  const todayKey = new Date().toISOString().slice(0, 10);

  const todaysMissions = useMemo(() => pickMissions(missions, 3, todayKey), [todayKey]);

  const progressById = useMemo(() => {
    const lookup = {};
    questions.forEach((q) => {
      lookup[q.id] = progress?.[q.id];
    });
    return lookup;
  }, [progress, questions]);

  const getMissionProgress = (mission) => {
    const relevantQuestions = questions.filter((q) => {
      if (mission.track && q.track !== mission.track) return false;
      if (mission.lesson && q.lesson !== mission.lesson) return false;
      if (mission.difficulty && q.difficulty !== mission.difficulty) return false;
      if (mission.questionType && q.type !== mission.questionType) return false;
      return true;
    });

    const attempts = relevantQuestions.reduce(
      (sum, q) => sum + (progressById[q.id]?.attempts ?? 0),
      0
    );
    const corrects = relevantQuestions.reduce(
      (sum, q) => sum + (progressById[q.id]?.corrects ?? 0),
      0
    );

    if (mission.type === 'attempts') return attempts;
    if (mission.type === 'corrects') return corrects;
    return 0;
  };

  return (
    <div className="card mission-card">
      <div className="card-header">
        <p className="subtitle">오늘의 미션</p>
        <span className="muted">오늘도 작은 성취를 쌓아보세요.</span>
      </div>
      <ul className="mission-list">
        {todaysMissions.map((mission) => {
          const current = getMissionProgress(mission);
          const complete = current >= mission.target;
          return (
            <li key={mission.id} className={`mission-item ${complete ? 'mission-item--done' : ''}`}>
              <div>
                <p className="mission-text">{mission.text}</p>
                <p className="muted">
                  진행 {Math.min(current, mission.target)}/{mission.target}
                </p>
              </div>
              <span className="badge">{complete ? '완료!' : '진행 중'}</span>
            </li>
          );
        })}
      </ul>
      {todaysMissions.every((mission) => getMissionProgress(mission) >= mission.target) ? (
        <p className="mission-complete">오늘의 미션을 모두 완료했어요! 🎉</p>
      ) : null}
    </div>
  );
}

export default MissionBanner;
