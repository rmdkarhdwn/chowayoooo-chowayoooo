import { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { database } from '../../firebase';

export function usePlayerScore(userId) {
    const [loadedScore, setLoadedScore] = useState(null);

    useEffect(() => {
        if (!userId) {
            return undefined;
        }

        const scoreRef = ref(database, `scores/${userId}`);

        get(scoreRef).then((snapshot) => {
            const scoreData = snapshot.val();

            if (scoreData && typeof scoreData.score === 'number') {
                setLoadedScore(scoreData.score);
                return;
            }

            setLoadedScore(0);
        });

        return undefined;
    }, [userId]);

    return loadedScore;
}
