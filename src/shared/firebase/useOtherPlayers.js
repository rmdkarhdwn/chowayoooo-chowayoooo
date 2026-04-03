import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../../firebase';

export function useOtherPlayers(userId) {
    const [otherPlayers, setOtherPlayers] = useState({});

    useEffect(() => {
        if (!userId) {
            return undefined;
        }

        const playersRef = ref(database, 'players');

        const unsubscribe = onValue(playersRef, (snapshot) => {
            const players = snapshot.val();

            if (!players) {
                setOtherPlayers({});
                return;
            }

            const { [userId]: _currentUser, ...others } = players;
            setOtherPlayers(others);
        });

        return unsubscribe;
    }, [userId]);

    return otherPlayers;
}
