import { useEffect, useState } from 'react';
import { ref, set, remove, onValue } from 'firebase/database';
import { database } from '../firebase';

export const useFirebase = (userId, position) => {
    const [otherPlayers, setOtherPlayers] = useState({});
    const [zone, setZone] = useState(null);

    // 내 위치 업데이트
    useEffect(() => {
        const playerRef = ref(database, `players/${userId}`);
        set(playerRef, {
            x: position.x,
            y: position.y,
            lastUpdate: Date.now()
        });
    }, [userId, position.x, position.y]);

    // 다른 유저 구독
    useEffect(() => {
        const playersRef = ref(database, 'players');
        
        const unsubscribe = onValue(playersRef, (snapshot) => {
            const players = snapshot.val();
            if (players) {
                const { [userId]: me, ...others } = players;
                setOtherPlayers(others);
            } else {
                setOtherPlayers({});
            }
        });
        
        return () => unsubscribe();
    }, [userId]);

    // 구역 구독
    useEffect(() => {
        const zoneRef = ref(database, 'zone');
        
        const unsubscribe = onValue(zoneRef, (snapshot) => {
            const zoneData = snapshot.val();
            if (zoneData) {
                setZone(zoneData);
            }
        });
        
        return () => unsubscribe();
    }, []);

    // 접속 종료 시 삭제
    useEffect(() => {
        return () => {
            const playerRef = ref(database, `players/${userId}`);
            remove(playerRef);
        };
    }, [userId]);

    return { otherPlayers, zone };
};