import { useEffect, useRef } from 'react';

export const useSound = () => {
    const clickSound = useRef(null);
    const scoreSound = useRef(null);
    const bgmSound = useRef(null);

    useEffect(() => {
        // 클릭 사운드
        clickSound.current = new Audio('/sounds/click.mp3');
        clickSound.current.volume = 0.3;
        
        // 점수 사운드
        scoreSound.current = new Audio('/sounds/score.mp3');
        scoreSound.current.volume = 0.5;
        
        // 배경음악 (선택)
        bgmSound.current = new Audio('/sounds/bgm.mp3');
        bgmSound.current.volume = 0.2;
        bgmSound.current.loop = true;
    }, []);

    const playClick = () => {
        if (clickSound.current) {
            clickSound.current.currentTime = 0;
            clickSound.current.play().catch(e => console.log('Audio play failed:', e));
        }
    };

    const playScore = () => {
        if (scoreSound.current) {
            scoreSound.current.currentTime = 0;
            scoreSound.current.play().catch(e => console.log('Audio play failed:', e));
        }
    };

    const playBGM = () => {
        if (bgmSound.current) {
            bgmSound.current.play().catch(e => console.log('Audio play failed:', e));
        }
    };

    const stopBGM = () => {
        if (bgmSound.current) {
            bgmSound.current.pause();
        }
    };

    return { playClick, playScore, playBGM, stopBGM };
};