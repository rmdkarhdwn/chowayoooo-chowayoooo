import { useEffect, useRef, useState } from 'react';

function Game({ userId }) {
    const canvasRef = useRef(null);
    const [position, setPosition] = useState({ x: 400, y: 300 });
    const [characterImage, setCharacterImage] = useState(null);

  // 이미지 로드
    useEffect(() => {
    const img = new Image();
    img.src = '/character.png';
    img.onload = () => setCharacterImage(img);
    }, []);

  // 키보드 입력
    useEffect(() => {
        const handleKeyDown = (e) => {
        const speed = 5;
        
        setPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        
        if (e.key === 'w' || e.key === 'W') newY -= speed;
        if (e.key === 's' || e.key === 'S') newY += speed;
        if (e.key === 'a' || e.key === 'A') newX -= speed;
        if (e.key === 'd' || e.key === 'D') newX += speed;
        
        return { x: newX, y: newY };
        });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

  // Canvas 렌더링
    useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 화면 지우기
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 캐릭터 그리기
    if (characterImage) {
        ctx.drawImage(characterImage, position.x - 25, position.y - 25, 50, 50);
    }
    
    }, [position, characterImage]);

    return (
    <div>
        <h1>조아요조아요</h1>
        <canvas 
        ref={canvasRef} 
        width={800} 
        height={600}
        style={{ border: '1px solid black' }}
        />
        <p>WASD로 이동</p>
    </div>
    );
}

export default Game;