import { useEffect, useState } from 'react';
import { ref, set, remove, onValue, onDisconnect } from 'firebase/database'; 
import { database } from '../firebase';
import { MAP_WIDTH, MAP_HEIGHT } from '../utils/constants';

const createZone = () => {
    const zoneRef = ref(database, 'zone');
    const newZone = {
        id: Date.now(), // ✅ 고유 ID 추가
        x: Math.random() * (MAP_WIDTH - 600) + 300,   // ✅ MAP_WIDTH
        y: Math.random() * (MAP_HEIGHT - 600) + 300,  // ✅ MAP_HEIGHT
        createdAt: Date.now(),
        duration: 30
    };
    set(zoneRef, newZone);
};

export const useFirebase = (userId, position,nickname) => {
    const [otherPlayers, setOtherPlayers] = useState({});
    const [zone, setZone] = useState(null);
    const [loadedScore, setLoadedScore] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [squishes, setSquishes] = useState({}); // ✅ {} 빈 객체

    // 내 위치 업데이트
    useEffect(() => {
        const playerRef = ref(database, `players/${userId}`);
        
        set(playerRef, {
            x: position.x,
            y: position.y,
            nickname: nickname,
            lastUpdate: Date.now()
        });
        
        onDisconnect(playerRef).remove();
        
    }, [userId, position.x, position.y,nickname]);

    // 점수 불러오기
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

    // 리더보드 구독
    useEffect(() => {
        const scoresRef = ref(database, 'scores');
        
        const unsubscribe = onValue(scoresRef, (snapshot) => {
            const scoresData = snapshot.val();
            
            if (scoresData) {
                const sorted = Object.entries(scoresData)
                    .map(([uid, data]) => ({
                        userId: uid,
                        nickname: data.nickname || '익명',
                        score: data.score || 0
                    }))
                    .filter(player => player.score > 0) // ✅ 0점 제외
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5);
                
                setLeaderboard(sorted);
            } else {
                setLeaderboard([]);
            }
        });
        
        return () => unsubscribe();
    }, []);
    // 접속자 수 계산
    useEffect(() => {
        const playersRef = ref(database, 'players');
        
        const unsubscribe = onValue(playersRef, (snapshot) => {
            const players = snapshot.val();
            const count = players ? Object.keys(players).length : 0;
            
            
            if (count >= 100) {
                console.warn('⚠️ 접속자 100명 도달!');
            }
        });
        
        return () => unsubscribe();
    }, []);

    // ✅ squishes 구독
    useEffect(() => {
        const squishesRef = ref(database, 'squishes');
        
        const unsubscribe = onValue(squishesRef, (snapshot) => {
            const squishesData = snapshot.val();
            setSquishes(squishesData || {});
        });
        
        return () => unsubscribe();
    }, []);

    return { otherPlayers, zone, loadedScore, leaderboard, squishes };
};