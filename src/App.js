import { useState } from 'react';
import Game from './components/Game';
import NicknameModal from './components/NicknameModal';
import { useAuth } from './features/lobby/hooks/useAuth';
import { usePlayerCapacity } from './features/lobby/hooks/usePlayerCapacity';

function App() {
  const user = useAuth();
  const playerCount = usePlayerCapacity();
  const [nickname, setNickname] = useState(null);

  if (!user) {
    return <div>로딩중...</div>;
  }

  // ✅ 100명 제한
  if (playerCount >= 100) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#2c3e50',
        color: 'white',
        fontSize: '24px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h1>🎃 서버 만원!</h1>
          <p>현재 접속자: {playerCount}명</p>
          <p>잠시 후 다시 접속해주세요.</p>
        </div>
      </div>
    );
  }

  if (!nickname) {
    return <NicknameModal onSubmit={setNickname} />;
  }

  return <Game userId={user.uid} nickname={nickname} />;
}

export default App;
