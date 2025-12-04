import { useEffect, useRef, useState } from 'react';
import { ref, set, remove } from 'firebase/database';
import { database } from './firebase';

function Game({ userId }) {
    const canvasRef = useRef(null);
    const [position, setPosition] = useState({ x: 2500, y: 2500 });
    const [characterImage, setCharacterImage] = useState(null);
    const [direction, setDirection] = useState('right'); // ✅ 추가 (기본 오른쪽)
    const keysPressed = useRef({});
    const MAP_SIZE = 5000;
    const CANVAS_WIDTH = window.innerWidth;
    const CANVAS_HEIGHT = window.innerHeight;
    

    // 이미지 로드
    useEffect(() => {
        const img = new Image();
        img.src = '/character.png';
        img.onload = () => setCharacterImage(img);
    }, []);

    // ✅ 키보드 입력 (추가)
    useEffect(() => {
        const handleKeyDown = (e) => {
            keysPressed.current[e.key.toLowerCase()] = true;
        };

        const handleKeyUp = (e) => {
            keysPressed.current[e.key.toLowerCase()] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // 게임 루프
// 게임 루프
useEffect(() => {
    const gameLoop = () => {
        const speed = 5;
        
        setPosition(prev => {
            let newX = prev.x;
            let newY = prev.y;
            
            // WASD
            if (keysPressed.current['w']) newY -= speed;
            if (keysPressed.current['s']) newY += speed;
            if (keysPressed.current['a']) {
                newX -= speed;
                setDirection('left'); // ✅ 왼쪽
            }
            if (keysPressed.current['d']) {
                newX += speed;
                setDirection('right'); // ✅ 오른쪽
            }
            
            // 방향키
            if (keysPressed.current['arrowup']) newY -= speed;
            if (keysPressed.current['arrowdown']) newY += speed;
            if (keysPressed.current['arrowleft']) {
                newX -= speed;
                setDirection('left'); // ✅ 왼쪽
            }
            if (keysPressed.current['arrowright']) {
                newX += speed;
                setDirection('right'); // ✅ 오른쪽
            }
            
            // 맵 경계 체크
            newX = Math.max(100, Math.min(MAP_SIZE - 100, newX));
            newY = Math.max(100, Math.min(MAP_SIZE - 100, newY));
            
            // Firebase에 내 위치 저장
            const playerRef = ref(database, `players/${userId}`);
            set(playerRef, {
                x: newX,
                y: newY,
                lastUpdate: Date.now()
            });
            
            return { x: newX, y: newY };
        });
    };

    const interval = setInterval(gameLoop, 1000 / 60);
    return () => clearInterval(interval);
}, [userId]);

    // 접속 종료 시 데이터 삭제
    useEffect(() => {
        return () => {
            const playerRef = ref(database, `players/${userId}`);
            remove(playerRef);
        };
    }, [userId]);

    // Canvas 렌더링
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // 카메라 위치
        const cameraX = position.x - CANVAS_WIDTH / 2;
        const cameraY = position.y - CANVAS_HEIGHT / 2;
        
        // 화면 지우기
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // 그리드 그리기
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < MAP_SIZE; x += 150) {
            const screenX = x - cameraX;
            if (screenX >= -150 && screenX <= CANVAS_WIDTH + 150) {
                ctx.beginPath();
                ctx.moveTo(screenX, 0);
                ctx.lineTo(screenX, CANVAS_HEIGHT);
                ctx.stroke();
            }
        }
        
        for (let y = 0; y < MAP_SIZE; y += 150) {
            const screenY = y - cameraY;
            if (screenY >= -150 && screenY <= CANVAS_HEIGHT + 150) {
                ctx.beginPath();
                ctx.moveTo(0, screenY);
                ctx.lineTo(CANVAS_WIDTH, screenY);
                ctx.stroke();
            }
        }
        
        // 캐릭터 그리기 (항상 화면 중앙)
// 캐릭터 그리기 (항상 화면 중앙)
    if (characterImage) {
        ctx.save(); // ✅ 현재 상태 저장
        
        // ✅ 왼쪽 보면 이미지 반전
        if (direction === 'left') {
            ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
            ctx.scale(-1, 1); // 좌우 반전
            ctx.drawImage(characterImage, -100, 0, 200, 200);
        } else {
            ctx.drawImage(
                characterImage, 
                CANVAS_WIDTH / 2 - 100, 
                CANVAS_HEIGHT / 2 - 100, 
                200, 
                200
            );
        }
        
        ctx.restore(); // ✅ 원래 상태로 복구
    }
        
    }, [position, characterImage]);

    return (
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
    );
}

export default Game;