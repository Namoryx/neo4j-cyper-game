const KEY = 'neo4j-cypher-game-progress';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch (error) {
    console.warn('진행도 로딩 실패', error);
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export { loadProgress, saveProgress };
