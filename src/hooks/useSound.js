import { useEffect, useRef } from 'react';

export const useSound = () => {
    const clickSound = useRef(null);
    const scoreSound = useRef(null);
    const bgmSound = useRef(null);
    const zoneEndSound = useRef(null); // ✅ 여기로 이동

    useEffect(() => {
        // 클릭 사운드
        clickSound.current = new Audio('/sounds/click.mp3');
        clickSound.current.volume = 0.3;
        
        // 점수 사운드
        scoreSound.current = new Audio('/sounds/score.mp3');
        scoreSound.current.volume = 0.5;
        
        // 배경음악
        bgmSound.current = new Audio('/sounds/bgm.mp3');
        bgmSound.current.volume = 0.2;
        bgmSound.current.loop = true;
        
        // ✅ 구역 종료 사운드
        zoneEndSound.current = new Audio('/sounds/zone-end.mp3');
        zoneEndSound.current.volume = 0.5;
    }, []);

    const playClick = () => {
        if (clickSound.current) {
            clickSound.current.currentTime = 0;
        }
    };

    const playScore = () => {
        if (scoreSound.current) {
            scoreSound.current.currentTime = 0;
        }
    };

    const playBGM = () => {
        if (bgmSound.current) {
        }
    };

    const stopBGM = () => {
        if (bgmSound.current) {
            bgmSound.current.pause();
        }
    };

    const playZoneEnd = () => {
        if (zoneEndSound.current) {
            zoneEndSound.current.currentTime = 0;
        }
    };

    return { playClick, playScore, playBGM, stopBGM, playZoneEnd };
};