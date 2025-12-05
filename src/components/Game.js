import { useEffect, useRef, useState } from 'react';
import { useKeyboard } from '../hooks/useKeyboard';
import { useFirebase } from '../hooks/useFirebase';
import { useImageLoader } from '../hooks/useImageLoader';
import { MAP_SIZE, MAP_WIDTH, MAP_HEIGHT, PLAYER_SIZE, PLAYER_SPEED, GRID_SPACING, ZONE_SIZE } from '../utils/constants';
import { ref, set } from 'firebase/database';
import { useSound } from '../hooks/useSound';
import { database } from '../firebase';
import Leaderboard from './Leaderboard';
import { isInsideZone, isOnScreen } from '../utils/gameHelpers';
import { renderGrid, renderZone, renderSquishEffect } from '../utils/renderHelpers';


function Game({ userId, nickname }) {
    const canvasRef = useRef(null);
    const [position, setPosition] = useState({ x: 2500, y: 2500 });
    const [direction, setDirection] = useState('right');
    const [inZoneSince, setInZoneSince] = useState(null);
    const [squishPlayers, setSquishPlayers] = useState({});
    const [score, setScore] = useState(null);
    const scoreInitialized = useRef(false);
    const { playClick, playScore, playBGM, playZoneEnd } = useSound(); // ✅ playZoneEnd 추가

    // ✅ ref 추가
    const positionRef = useRef(position);
    const directionRef = useRef(direction);
    const inZoneSinceRef = useRef(inZoneSince);
    const otherPlayersRef = useRef({});
    const zoneRef = useRef(null);
    const squishPlayersRef = useRef({});
    const prevZone = useRef(null);
    const wasInZone = useRef(false);
    const prevZoneId = useRef(null);

    const CANVAS_WIDTH = window.innerWidth;
    const CANVAS_HEIGHT = window.innerHeight;

    const keysPressed = useKeyboard();
    const { otherPlayers, zone, loadedScore, leaderboard } = useFirebase(userId, position);

    // 이미지 로드
    const { normalImage: characterImage, happyImage: characterHappy, backgroundImage, zoneImage } = useImageLoader(
        '/character.png',
        '/character-happy.png',
        '/background.png',
        '/zone.png'  // ✅ 추가
    );
    const zoneImageRef = useRef(null);

    // ✅ ref 동기화
    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    useEffect(() => {
        inZoneSinceRef.current = inZoneSince;
    }, [inZoneSince]);

    useEffect(() => {
        otherPlayersRef.current = otherPlayers;
    }, [otherPlayers]);

    useEffect(() => {
        zoneRef.current = zone;
    }, [zone]);

    useEffect(() => {
        squishPlayersRef.current = squishPlayers;
    }, [squishPlayers]);

    useEffect(() => {
    zoneImageRef.current = zoneImage;
    }, [zoneImage]);

    useEffect(() => {
        playBGM();
        }, []);

    // 게임 루프
    useEffect(() => {
        const gameLoop = () => {
            setPosition(prev => {
                let newX = prev.x;
                let newY = prev.y;
                let newDirection = direction;
                
                const moveUp = keysPressed.current['w'] || keysPressed.current['arrowup'];
                const moveDown = keysPressed.current['s'] || keysPressed.current['arrowdown'];
                const moveLeft = keysPressed.current['a'] || keysPressed.current['arrowleft'];
                const moveRight = keysPressed.current['d'] || keysPressed.current['arrowright'];
                
                if (moveUp) newY -= PLAYER_SPEED;
                if (moveDown) newY += PLAYER_SPEED;
                if (moveLeft) {
                    newX -= PLAYER_SPEED;
                    newDirection = 'left';
                }
                if (moveRight) {
                    newX += PLAYER_SPEED;
                    newDirection = 'right';
                }
                
                if (newDirection !== direction) {
                    setDirection(newDirection);
                }
                
                newX = Math.max(PLAYER_SIZE/2, Math.min(MAP_WIDTH - PLAYER_SIZE/2, newX));   // ✅ MAP_WIDTH
                newY = Math.max(PLAYER_SIZE/2, Math.min(MAP_HEIGHT - PLAYER_SIZE/2, newY));  // ✅ MAP_HEIGHT

                
                // ✅ 헬퍼 함수 사용
                if (zone) {
                    const inZone = isInsideZone(newX, newY, zone, ZONE_SIZE);
                    
                    if (inZone) {
                        if (!inZoneSince) {
                            setInZoneSince(Date.now());
                        }
                    } else {
                        setInZoneSince(null);
                    }
                }
                
                return { x: newX, y: newY };
            });
        };

        const interval = setInterval(gameLoop, 1000 / 60);
        return () => clearInterval(interval);
    }, [direction, zone, inZoneSince]);

    // 5초 체크
    // 5초 체크
    useEffect(() => {
        if (!inZoneSince || !zone) return;
        
        // ✅ 이미 점수 받았으면 타이머 중지만 (inZoneSince 유지)
        if (zone.scoredUsers && zone.scoredUsers[userId]) {
            return; // setInZoneSince(null) 삭제
        }
        
        const checkTimer = setInterval(() => {
            const elapsed = (Date.now() - inZoneSince) / 1000;
            
            if (elapsed >= 5) {
                setScore(prev => (prev ?? 0) + 1);
                
                const zoneRef = ref(database, `zone/scoredUsers/${userId}`);
                set(zoneRef, true);
            }
        }, 100);
        
        return () => clearInterval(checkTimer);
    }, [inZoneSince, zone, userId]);
    const zoneSound = useRef(null);

    // 구역 사운드 초기화
    useEffect(() => {
        zoneSound.current = new Audio('/sounds/zone.mp3'); // 구역용 사운드 추가
        zoneSound.current.loop = true;
        zoneSound.current.volume = 0.3;
    }, []);

    // 구역 진입/이탈 체크
    useEffect(() => {
        if (inZoneSince) {
            wasInZone.current = true;
            
            if (zoneSound.current) {
                zoneSound.current.play().catch(e => console.log('Zone sound failed:', e));
            }
        } else {
            // ✅ wasInZone은 그대로 유지 (구역이 사라질 때만 false)
            
            if (zoneSound.current) {
                zoneSound.current.pause();
                zoneSound.current.currentTime = 0;
            }
        }
    }, [inZoneSince]);

    // 구역 변경 감지
    useEffect(() => {
        // 구역 ID가 바뀌고 && 안에 있었을 때
        if (prevZoneId.current && zone && zone.id !== prevZoneId.current && wasInZone.current) {
            console.log('🎵 구역 바뀜! 사운드 재생!');
            playZoneEnd();
            wasInZone.current = false;
        }
        
        prevZoneId.current = zone?.id || null;
    }, [zone, playZoneEnd]);


    // 점수 불러오기 (딱 한 번)
    useEffect(() => {
        if (scoreInitialized.current) return;
        
        if (loadedScore !== null) {
            setScore(loadedScore);
            scoreInitialized.current = true;
        }
    }, [loadedScore]);

    // 점수 저장 (초기화 후에만)
    useEffect(() => {
        if (!scoreInitialized.current) return;
        if (score === null) return;
        
        const scoreRef = ref(database, `scores/${userId}`);
        set(scoreRef, {
            score: score,
            nickname: nickname,
            lastUpdate: Date.now()
        });
    }, [score, userId]);

    // Canvas 클릭 이벤트
    useEffect(() => {
        const canvas = canvasRef.current;
        
        const handleClick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            const cameraX = position.x - CANVAS_WIDTH / 2;
            const cameraY = position.y - CANVAS_HEIGHT / 2;
            
            const worldX = clickX + cameraX;
            const worldY = clickY + cameraY;
            
            Object.entries(otherPlayers).forEach(([id, player]) => {
                const dist = Math.sqrt(
                    Math.pow(worldX - player.x, 2) + 
                    Math.pow(worldY - player.y, 2)
                );
                
                if (dist < PLAYER_SIZE / 2) {
                    const clickOffsetX = (worldX - player.x) / (PLAYER_SIZE / 2);
                    const clickOffsetY = (worldY - player.y) / (PLAYER_SIZE / 2);
                    playClick(); // ✅ 클릭 사운드
                    
                    setSquishPlayers(prev => ({
                        ...prev,
                        [id]: {
                            clickX: clickOffsetX,
                            clickY: clickOffsetY,
                            time: Date.now()
                        }
                    }));
                    
                    setTimeout(() => {
                        setSquishPlayers(prev => {
                            const newState = {...prev};
                            delete newState[id];
                            return newState;
                        });
                    }, 500);
                }
            });
        };
        
        canvas.addEventListener('click', handleClick);
        return () => canvas.removeEventListener('click', handleClick);
    }, [position, otherPlayers]);

    const backgroundRef = useRef(null);

    useEffect(() => {
        backgroundRef.current = backgroundImage;
    }, [backgroundImage]);

    // Canvas 렌더링
        useEffect(() => {
        let animationId;
        
        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas || !characterImage || !characterHappy) {
                animationId = requestAnimationFrame(render);
                return;
            }
            
            const ctx = canvas.getContext('2d');
            
            // ✅ 카메라 제한 없음 (원래대로)
            const cameraX = positionRef.current.x - CANVAS_WIDTH / 2;
            const cameraY = positionRef.current.y - CANVAS_HEIGHT / 2;
            
            // 배경색 (맵 밖 영역)
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            // 배경 이미지 (0,0 ~ MAP_WIDTH, MAP_HEIGHT만)
            if (backgroundRef.current) {
                const bgX = -cameraX;
                const bgY = -cameraY;
                
                // 배경이 화면에 보이는 경우만 그리기
                if (bgX + MAP_WIDTH > 0 && bgX < CANVAS_WIDTH &&
                    bgY + MAP_HEIGHT > 0 && bgY < CANVAS_HEIGHT) {
                    ctx.drawImage(
                        backgroundRef.current,
                        bgX,
                        bgY,
                        MAP_WIDTH,
                        MAP_HEIGHT
                    );
                }
            }

            // 구역
            renderZone(ctx, zoneRef.current, cameraX, cameraY, zoneImageRef.current);

            // ... 나머지 동일 ...
            
            // 다른 유저들
            if (characterImage) {
                Object.entries(otherPlayersRef.current).forEach(([id, player]) => {
                    const screenX = player.x - cameraX;
                    const screenY = player.y - cameraY;
                    
                    if (isOnScreen(player.x, player.y, cameraX, cameraY, CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SIZE)) {
                        if (squishPlayersRef.current[id]) {
                            renderSquishEffect(ctx, characterImage, squishPlayersRef.current[id], screenX, screenY, PLAYER_SIZE);
                        } else {
                            // ✅ 모든 유저를 같은 이미지로 렌더링
                            ctx.drawImage(
                                characterImage,
                                screenX - PLAYER_SIZE/2,
                                screenY - PLAYER_SIZE/2,
                                PLAYER_SIZE,
                                PLAYER_SIZE
                            );
                        }
                    }
                });
            }
            
            // 내 캐릭터
            if (characterImage && characterHappy) {
                ctx.save();
                
                const currentImage = inZoneSinceRef.current ? characterHappy : characterImage; // ✅ .current
                const size = inZoneSinceRef.current ? PLAYER_SIZE * 0.8 : PLAYER_SIZE;
                
                if (directionRef.current === 'left') { // ✅ .current
                    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - size/2);
                    ctx.scale(-1, 1);
                    ctx.drawImage(currentImage, -size/2, 0, size, size);
                } else {
                    ctx.drawImage(
                        currentImage, 
                        CANVAS_WIDTH / 2 - size/2, 
                        CANVAS_HEIGHT / 2 - size/2, 
                        size, 
                        size
                    );
                }
                
                ctx.restore();
            }
            
            animationId = requestAnimationFrame(render);
        };
        
        render();
        
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [characterImage, characterHappy, CANVAS_WIDTH, CANVAS_HEIGHT]);

    return (
        <>
            <div style={{
                position: 'fixed',
                top: 10,
                left: 10,
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '10px',
                borderRadius: '5px',
                fontFamily: 'monospace',
                zIndex: 1000
            }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFD700' }}>
                    점수: {score ?? 0}
                </div>
                <div>내 위치: ({Math.floor(position.x)}, {Math.floor(position.y)})</div>
                <div>접속자: {Object.keys(otherPlayers).length + 1}명</div>
                {zone && (
                    <div style={{ color: '#FFD700', marginTop: '5px' }}>
                        구역 위치: ({Math.floor(zone.x)}, {Math.floor(zone.y)})
                    </div>
                )}
                {inZoneSince && (
                    <div style={{ color: '#00FF00', marginTop: '5px' }}>
                        구역 체류: {((Date.now() - inZoneSince) / 1000).toFixed(1)}초
                    </div>
                )}
            </div>

            <Leaderboard leaderboard={leaderboard} myUserId={userId} />

            <canvas 
                ref={canvasRef} 
                width={CANVAS_WIDTH} 
                height={CANVAS_HEIGHT}
                style={{ 
                    display: 'block',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    margin: 0,
                    padding: 0,
                    cursor: 'pointer'
                }}
            />
        </>
    );
}

export default Game;