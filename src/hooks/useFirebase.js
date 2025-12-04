import { useEffect, useState } from 'react';
import { ref, set, remove, onValue } from 'firebase/database';
import { database } from '../firebase';
import { MAP_SIZE } from '../utils/constants';

const createZone = () => {
    const zoneRef = ref(database, 'zone');
    const newZone = {
        x: Math.random() * (MAP_SIZE - 600) + 300,
        y: Math.random() * (MAP_SIZE - 600) + 300,
        createdAt: Date.now(),
        duration: 30
    };
    set(zoneRef, newZone);
};

export const useFirebase = (userId, position) => { // ✅ score 제거
    const [otherPlayers, setOtherPlayers] = useState({});
    const [zone, setZone] = useState(null);
    const [loadedScore, setLoadedScore] = useState(null); // null로 시작

    // 내 위치 업데이트
    useEffect(() => {
        const playerRef = ref(database, `players/${userId}`);
        set(playerRef, {
            x: position.x,
            y: position.y,
            lastUpdate: Date.now()
        });
    }, [userId, position.x, position.y]);

    useEffect(() => {
        const scoreRef = ref(database, `scores/${userId}`);
        
        const unsubscribe = onValue(scoreRef, (snapshot) => {
            const scoreData = snapshot.val();
            
            if (scoreData && typeof scoreData.score === 'number') {
                setLoadedScore(scoreData.score);
            } else {
                setLoadedScore(0);
            }
        }, { onlyOnce: true });
        
        return () => unsubscribe();
    }, [userId]);


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

    // 구역 구독 + 자동 생성
    useEffect(() => {
        const zoneRef = ref(database, 'zone');
        
        const unsubscribe = onValue(zoneRef, (snapshot) => {
            const zoneData = snapshot.val();
            
            if (zoneData) {
                setZone(zoneData);
            } else {
                createZone();
            }
        });
        
        return () => unsubscribe();
    }, []);

    // 타이머 체크
    useEffect(() => {
        if (!zone) return;
        
        const checkTimer = setInterval(() => {
            const elapsed = (Date.now() - zone.createdAt) / 1000;
            
            if (elapsed >= zone.duration) {
                createZone();
            }
        }, 1000);
        
        return () => clearInterval(checkTimer);
    }, [zone]);

    // 접속 종료 시 삭제
    useEffect(() => {
        return () => {
            const playerRef = ref(database, `players/${userId}`);
            remove(playerRef);
        };
    }, [userId]);

    return { otherPlayers, zone, loadedScore };
};