import { useState } from 'react';
import Quiz from './components/Quiz.jsx';
import QuokkaCharacter from './components/QuokkaCharacter.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import DiagnosticsPanel from './components/DiagnosticsPanel.jsx';

function App() {
  const [speech, setSpeech] = useState('문제 풀어봐!');
  const [mood, setMood] = useState('ask');
  const [rows, setRows] = useState([]);
  const [impact, setImpact] = useState(null);

  return (
    <div className={`app ${impact ? `app--impact-${impact}` : ''}`}>
      <div className="app-shell">
        <header className="app-header">
          <h1 className="app-title">쿼카와 함께하는 Cypher 게임</h1>
        </header>
        <main className="app-main">
          <section className="app-layout">
            <QuokkaCharacter speech={speech} mood={mood} />
            <div className="app-panels">
              <Quiz
                onSpeechChange={setSpeech}
                onMoodChange={setMood}
                onImpact={setImpact}
                onResultsChange={setRows}
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
