import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../../../firebase';

export function usePlayerCapacity() {
    const [playerCount, setPlayerCount] = useState(0);

    useEffect(() => {
        const playersRef = ref(database, 'players');

        const unsubscribe = onValue(playersRef, (snapshot) => {
            const players = snapshot.val();
            const count = players ? Object.keys(players).length : 0;
            setPlayerCount(count);
        });

        return unsubscribe;
    }, []);

    return playerCount;
}
