import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../../firebase';

export function useLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const scoresRef = ref(database, 'scores');

        const unsubscribe = onValue(scoresRef, (snapshot) => {
            const scoresData = snapshot.val();

            if (!scoresData) {
                setLeaderboard([]);
                return;
            }

            const sorted = Object.entries(scoresData)
                .map(([uid, data]) => ({
                    userId: uid,
                    nickname: data.nickname || '익명',
                    score: data.score || 0,
                }))
                .filter((player) => player.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);

            setLeaderboard(sorted);
        });

        return unsubscribe;
    }, []);

    return leaderboard;
}
