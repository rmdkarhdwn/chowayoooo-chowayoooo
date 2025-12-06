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
        console.log('클릭 사운드 시도'); // ✅ 추가
        if (clickSound.current) {
            clickSound.current.currentTime = 0;
            clickSound.current.play()
                .then(() => console.log('✅ 클릭 사운드 성공'))
                .catch(e => console.log('❌ 클릭 사운드 실패:', e));
        }
    };

    const playBGM = () => {
        if (bgmSound.current) {
            bgmSound.current.play()
                .catch(e => console.error('❌ BGM play() 실패:', e));
        } else {
            console.error('❌ bgmSound.current 없음');
        }
    };

    const stopBGM = () => {
        if (bgmSound.current) {
            bgmSound.current.pause();
        }
    };

    const playScore = () => {
        if (scoreSound.current) {
            scoreSound.current.currentTime = 0;
            scoreSound.current.play()  // ✅ 추가
                .then(() => console.log('✅ 점수 사운드 성공'))
                .catch(e => console.log('❌ 점수 사운드 실패:', e));
        }
    };

    const playZoneEnd = () => {
        console.log('playZoneEnd 호출'); // ✅ 추가
        
        if (zoneEndSound.current) {
            zoneEndSound.current.currentTime = 0;
            zoneEndSound.current.play()  // ✅ 추가
                .then(() => console.log('✅ 구역 종료 사운드 성공'))
                .catch(e => console.log('❌ 구역 종료 사운드 실패:', e));
        } else {
            console.log('❌ zoneEndSound.current 없음');
        }
    };

    return { playClick, playScore, playBGM, stopBGM, playZoneEnd };
};