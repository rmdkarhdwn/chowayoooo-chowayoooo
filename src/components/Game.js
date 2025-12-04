import { useEffect, useRef, useState } from 'react';
import { useKeyboard } from '../hooks/useKeyboard';
import { useFirebase } from '../hooks/useFirebase';
import { MAP_SIZE, PLAYER_SIZE, PLAYER_SPEED, GRID_SPACING, ZONE_SIZE } from '../utils/constants';
import { ref, set } from 'firebase/database';
import { database } from '../firebase';
import Leaderboard from './Leaderboard';

function Game({ userId, nickname }) {
    const canvasRef = useRef(null);
    const [position, setPosition] = useState({ x: 2500, y: 2500 });
    const [characterImage, setCharacterImage] = useState(null);
    const [characterHappy, setCharacterHappy] = useState(null); // ✅ 추가
    const [direction, setDirection] = useState('right');
    const [inZoneSince, setInZoneSince] = useState(null);
    const [squishPlayers, setSquishPlayers] = useState({});
    const [score, setScore] = useState(null);
    const scoreInitialized = useRef(false);

    const CANVAS_WIDTH = window.innerWidth;
    const CANVAS_HEIGHT = window.innerHeight;

    const keysPressed = useKeyboard();
    const { otherPlayers, zone, loadedScore, leaderboard } = useFirebase(userId, position); // ✅ leaderboard 추가

    // 이미지 로드
    useEffect(() => {
        const img = new Image();
        img.src = '/character.png';
        img.onload = () => setCharacterImage(img);

        const Happy = new Image();
        Happy.src = '/character-happy.png'
        Happy.onload = () => setCharacterHappy(Happy);
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
                
                newX = Math.max(PLAYER_SIZE/2, Math.min(MAP_SIZE - PLAYER_SIZE/2, newX));
                newY = Math.max(PLAYER_SIZE/2, Math.min(MAP_SIZE - PLAYER_SIZE/2, newY));
                
                if (zone) {
                    const inZone = 
                        Math.abs(newX - zone.x) < ZONE_SIZE / 2 &&
                        Math.abs(newY - zone.y) < ZONE_SIZE / 2;
                    
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

    // Canvas 렌더링
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const cameraX = position.x - CANVAS_WIDTH / 2;
        const cameraY = position.y - CANVAS_HEIGHT / 2;
        
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < MAP_SIZE; x += GRID_SPACING) {
            const screenX = x - cameraX;
            if (screenX >= -GRID_SPACING && screenX <= CANVAS_WIDTH + GRID_SPACING) {
                ctx.beginPath();
                ctx.moveTo(screenX, 0);
                ctx.lineTo(screenX, CANVAS_HEIGHT);
                ctx.stroke();
            }
        }
        
        for (let y = 0; y < MAP_SIZE; y += GRID_SPACING) {
            const screenY = y - cameraY;
            if (screenY >= -GRID_SPACING && screenY <= CANVAS_HEIGHT + GRID_SPACING) {
                ctx.beginPath();
                ctx.moveTo(0, screenY);
                ctx.lineTo(CANVAS_WIDTH, screenY);
                ctx.stroke();
            }
        }
        
        if (zone) {
            const zoneScreenX = zone.x - cameraX;
            const zoneScreenY = zone.y - cameraY;
            const elapsed = (Date.now() - zone.createdAt) / 1000;
            const remaining = zone.duration - elapsed;
            
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.fillRect(zoneScreenX - ZONE_SIZE/2, zoneScreenY - ZONE_SIZE/2, ZONE_SIZE, ZONE_SIZE);
            
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(zoneScreenX - ZONE_SIZE/2, zoneScreenY - ZONE_SIZE/2, ZONE_SIZE, ZONE_SIZE);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(Math.ceil(remaining) + 's', zoneScreenX, zoneScreenY);
        }
        
        if (characterImage) {
            Object.entries(otherPlayers).forEach(([id, player]) => {
                const screenX = player.x - cameraX;
                const screenY = player.y - cameraY;
                
                if (screenX > -PLAYER_SIZE && screenX < CANVAS_WIDTH + PLAYER_SIZE &&
                    screenY > -PLAYER_SIZE && screenY < CANVAS_HEIGHT + PLAYER_SIZE) {
                    
                    if (squishPlayers[id]) {
                        const squish = squishPlayers[id];
                        const pushDepth = 15;
                        
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = PLAYER_SIZE;
                        tempCanvas.height = PLAYER_SIZE;
                        const tempCtx = tempCanvas.getContext('2d');
                        
                        tempCtx.drawImage(characterImage, 0, 0, PLAYER_SIZE, PLAYER_SIZE);
                        const imageData = tempCtx.getImageData(0, 0, PLAYER_SIZE, PLAYER_SIZE);
                        
                        ctx.save();
                        
                        const clickPixelX = (squish.clickX + 1) * PLAYER_SIZE / 2;
                        const clickPixelY = (squish.clickY + 1) * PLAYER_SIZE / 2;
                        
                        const outputCanvas = document.createElement('canvas');
                        outputCanvas.width = PLAYER_SIZE;
                        outputCanvas.height = PLAYER_SIZE;
                        const outputCtx = outputCanvas.getContext('2d');
                        
                        for (let y = 0; y < PLAYER_SIZE; y++) {
                            for (let x = 0; x < PLAYER_SIZE; x++) {
                                const dx = x - clickPixelX;
                                const dy = y - clickPixelY;
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                const maxDist = PLAYER_SIZE / 2;
                                
                                if (distance < maxDist) {
                                    const pushAmount = (1 - distance / maxDist) * pushDepth;
                                    const angle = Math.atan2(dy, dx);
                                    
                                    const sourceX = x + Math.cos(angle) * pushAmount;
                                    const sourceY = y + Math.sin(angle) * pushAmount;
                                    
                                    if (sourceX >= 0 && sourceX < PLAYER_SIZE && 
                                        sourceY >= 0 && sourceY < PLAYER_SIZE) {
                                        const srcIdx = (Math.floor(sourceY) * PLAYER_SIZE + Math.floor(sourceX)) * 4;
                                        
                                        if (srcIdx >= 0 && srcIdx < imageData.data.length - 3) {
                                            outputCtx.fillStyle = `rgba(${imageData.data[srcIdx]},${imageData.data[srcIdx+1]},${imageData.data[srcIdx+2]},${imageData.data[srcIdx+3]/255})`;
                                            outputCtx.fillRect(x, y, 1, 1);
                                        }
                                    }
                                } else {
                                    const srcIdx = (y * PLAYER_SIZE + x) * 4;
                                    outputCtx.fillStyle = `rgba(${imageData.data[srcIdx]},${imageData.data[srcIdx+1]},${imageData.data[srcIdx+2]},${imageData.data[srcIdx+3]/255})`;
                                    outputCtx.fillRect(x, y, 1, 1);
                                }
                            }
                        }
                        
                        ctx.drawImage(
                            outputCanvas,
                            screenX - PLAYER_SIZE/2,
                            screenY - PLAYER_SIZE/2
                        );
                        
                        ctx.restore();
                    } else {
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
        
        // ✅ 구역 안이면 다른 이미지 사용
        const currentImage = inZoneSince ? characterHappy : characterImage;
        const size = inZoneSince ? PLAYER_SIZE * 0.8 : PLAYER_SIZE; // 80%로 줄임
        
        if (direction === 'left') {
            ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - size/2);
            ctx.scale(-1, 1);
            ctx.drawImage(currentImage, -size/2, 0, size,size);
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
        
    }, [position, characterImage, characterHappy,direction, otherPlayers, zone, squishPlayers, inZoneSince]);

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