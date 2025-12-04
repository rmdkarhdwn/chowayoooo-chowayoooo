import { useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Game from './components/Game';
import NicknameModal from './components/NicknameModal';

function App() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState(null);

  useEffect(() => {
    signInAnonymously(auth);
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  if (!user) {
    return <div>로딩중...</div>;
  }

  if (!nickname) {
    return <NicknameModal onSubmit={setNickname} />;
  }

  return <Game userId={user.uid} nickname={nickname} />;
}

export default App;