import { useEffect, useRef, useState } from 'react';
import { useKeyboard } from '../hooks/useKeyboard';
import { useFirebase } from '../hooks/useFirebase';
import { MAP_SIZE, PLAYER_SIZE, PLAYER_SPEED, GRID_SPACING, ZONE_SIZE } from '../utils/constants';
import { ref, set } from 'firebase/database';
import { database } from '../firebase';

function Game({ userId }) {
    const canvasRef = useRef(null);
    const [position, setPosition] = useState({ x: 2500, y: 2500 });
    const [characterImage, setCharacterImage] = useState(null);
    const [direction, setDirection] = useState('right');
    const [score, setScore] = useState(0); // ✅ 점수
    const [inZoneSince, setInZoneSince] = useState(null); // ✅ 구역 진입 시간
    
    const CANVAS_WIDTH = window.innerWidth;
    const CANVAS_HEIGHT = window.innerHeight;

    const keysPressed = useKeyboard();
    const { otherPlayers, zone } = useFirebase(userId, position);

    // 이미지 로드
    useEffect(() => {
        const img = new Image();
        img.src = '/character.png';
        img.onload = () => setCharacterImage(img);
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
                
                // ✅ 구역 안에 있는지 체크
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


    // ✅ 5초 체크
    useEffect(() => {
        if (!inZoneSince || !zone) return;
        
        // ✅ 이미 이 구역에서 점수 받았는지 체크
        if (zone.scoredUsers && zone.scoredUsers[userId]) {
            setInZoneSince(null); // 이미 받았으면 타이머 리셋
            return;
        }
        
        const checkTimer = setInterval(() => {
            const elapsed = (Date.now() - inZoneSince) / 1000;
            
            if (elapsed >= 5) {
                // 점수 획득!
                setScore(prev => prev + 1);
                setInZoneSince(null);
                
                // ✅ 이 구역에 내 ID 추가 (더 이상 점수 못 받음)
                const zoneRef = ref(database, `zone/scoredUsers/${userId}`);
                set(zoneRef, true);
            }
        }, 100);
        
        return () => clearInterval(checkTimer);
    }, [inZoneSince, zone, userId]);
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
                    
                    ctx.drawImage(
                        characterImage,
                        screenX - PLAYER_SIZE/2,
                        screenY - PLAYER_SIZE/2,
                        PLAYER_SIZE,
                        PLAYER_SIZE
                    );
                }
            });
        }
        
        if (characterImage) {
            ctx.save();
            
            if (direction === 'left') {
                ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - PLAYER_SIZE/2);
                ctx.scale(-1, 1);
                ctx.drawImage(characterImage, -PLAYER_SIZE/2, 0, PLAYER_SIZE, PLAYER_SIZE);
            } else {
                ctx.drawImage(
                    characterImage, 
                    CANVAS_WIDTH / 2 - PLAYER_SIZE/2, 
                    CANVAS_HEIGHT / 2 - PLAYER_SIZE/2, 
                    PLAYER_SIZE, 
                    PLAYER_SIZE
                );
            }
            
            ctx.restore();
        }
        
    }, [position, characterImage, direction, otherPlayers, zone]);

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
                {/* ✅ 점수 표시 */}
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFD700' }}>
                    점수: {score}
                </div>
                <div>내 위치: ({Math.floor(position.x)}, {Math.floor(position.y)})</div>
                <div>접속자: {Object.keys(otherPlayers).length + 1}명</div>
                {zone && (
                    <div style={{ color: '#FFD700', marginTop: '5px' }}>
                        구역 위치: ({Math.floor(zone.x)}, {Math.floor(zone.y)})
                    </div>
                )}
                {/* ✅ 구역 체류 시간 */}
                {inZoneSince && (
                    <div style={{ color: '#00FF00', marginTop: '5px' }}>
                        구역 체류: {((Date.now() - inZoneSince) / 1000).toFixed(1)}초
                    </div>
                )}
            </div>

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
                    padding: 0
                }}
            />
        </>
    );
}

export default Game;