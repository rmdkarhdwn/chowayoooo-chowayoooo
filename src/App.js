import { useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, database } from './firebase';
import Game from './components/Game';
import NicknameModal from './components/NicknameModal';

function App() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    signInAnonymously(auth);
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  // ✅ 접속자 수 모니터링
  useEffect(() => {
    const playersRef = ref(database, 'players');
    
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const players = snapshot.val();
      const count = players ? Object.keys(players).length : 0;
      setPlayerCount(count);
    });
    
    return () => unsubscribe();
  }, []);

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