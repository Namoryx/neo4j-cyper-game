import { useState } from 'react';
import Quiz from './components/Quiz.jsx';
import QuokkaCharacter from './components/QuokkaCharacter.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import DiagnosticsPanel from './components/DiagnosticsPanel.jsx';

function App() {
  const [speech, setSpeech] = useState('문제 풀어봐!');

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">쿼카와 함께하는 Cypher 게임</h1>
      </header>
      <main className="app-main">
        <section className="app-layout">
          <QuokkaCharacter speech={speech} />
          <div className="app-panels">
            <Quiz onSpeechChange={setSpeech} />
            <ResultPanel />
            <DiagnosticsPanel />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
