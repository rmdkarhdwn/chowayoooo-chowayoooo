import { useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Game from './Game';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    signInAnonymously(auth);
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  if (!user) {
    return <div>로딩중...</div>;
  }

  return <Game userId={user.uid} />;
}

export default App;