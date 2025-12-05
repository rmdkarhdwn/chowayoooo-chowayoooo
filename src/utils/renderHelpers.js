// src/utils/renderHelpers.js
import { MAP_SIZE, GRID_SPACING, ZONE_SIZE } from './constants';

// 그리드 렌더링
export function renderGrid(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < MAP_SIZE; x += GRID_SPACING) {
        const screenX = x - cameraX;
        if (screenX >= -GRID_SPACING && screenX <= canvasWidth + GRID_SPACING) {
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, canvasHeight);
            ctx.stroke();
        }
    }
    
    for (let y = 0; y < MAP_SIZE; y += GRID_SPACING) {
        const screenY = y - cameraY;
        if (screenY >= -GRID_SPACING && screenY <= canvasHeight + GRID_SPACING) {
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(canvasWidth, screenY);
            ctx.stroke();
        }
    }
}

// ✅ 구역 렌더링 (이미지 버전)
export function renderZone(ctx, zone, cameraX, cameraY, zoneImage) {
    if (!zone) return;
    
    const zoneScreenX = zone.x - cameraX;
    const zoneScreenY = zone.y - cameraY;
    const elapsed = (Date.now() - zone.createdAt) / 1000;
    const remaining = zone.duration - elapsed;
    
    // 호박 이미지
    if (zoneImage) {
        ctx.drawImage(
            zoneImage,
            zoneScreenX - ZONE_SIZE/2,
            zoneScreenY - ZONE_SIZE/2,
            ZONE_SIZE,
            ZONE_SIZE
        );
    } else {
        // 로딩 중 기본 디자인
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fillRect(zoneScreenX - ZONE_SIZE/2, zoneScreenY - ZONE_SIZE/2, ZONE_SIZE, ZONE_SIZE);
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(zoneScreenX - ZONE_SIZE/2, zoneScreenY - ZONE_SIZE/2, ZONE_SIZE, ZONE_SIZE);
    }
    
    // 타이머
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(zoneScreenX, zoneScreenY, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(remaining) + 's', zoneScreenX, zoneScreenY);
}

    // 클릭 왜곡 효과 캐싱
    const squishCache = new Map();

    export function renderSquishEffect(ctx, characterImage, squish, screenX, screenY, playerSize) {
        const pushDepth = 15;
        const cacheKey = `${squish.clickX}_${squish.clickY}`;
        
        // ✅ 캐시 확인
        if (squishCache.has(cacheKey)) {
            const cachedCanvas = squishCache.get(cacheKey);
            ctx.drawImage(
                cachedCanvas,
                screenX - playerSize/2,
                screenY - playerSize/2
            );
            return;
        }
        
        // 캐시 없으면 생성
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = playerSize;
        tempCanvas.height = playerSize;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(characterImage, 0, 0, playerSize, playerSize);
        const imageData = tempCtx.getImageData(0, 0, playerSize, playerSize);
        
        const clickPixelX = (squish.clickX + 1) * playerSize / 2;
        const clickPixelY = (squish.clickY + 1) * playerSize / 2;
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = playerSize;
        outputCanvas.height = playerSize;
        const outputCtx = outputCanvas.getContext('2d');
        
        for (let y = 0; y < playerSize; y++) {
            for (let x = 0; x < playerSize; x++) {
                const dx = x - clickPixelX;
                const dy = y - clickPixelY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDist = playerSize / 2;
                
                if (distance < maxDist) {
                    const pushAmount = (1 - distance / maxDist) * pushDepth;
                    const angle = Math.atan2(dy, dx);
                    
                    const sourceX = x + Math.cos(angle) * pushAmount;
                    const sourceY = y + Math.sin(angle) * pushAmount;
                    
                    if (sourceX >= 0 && sourceX < playerSize && 
                        sourceY >= 0 && sourceY < playerSize) {
                        const srcIdx = (Math.floor(sourceY) * playerSize + Math.floor(sourceX)) * 4;
                        
                        if (srcIdx >= 0 && srcIdx < imageData.data.length - 3) {
                            outputCtx.fillStyle = `rgba(${imageData.data[srcIdx]},${imageData.data[srcIdx+1]},${imageData.data[srcIdx+2]},${imageData.data[srcIdx+3]/255})`;
                            outputCtx.fillRect(x, y, 1, 1);
                        }
                    }
                } else {
                    const srcIdx = (y * playerSize + x) * 4;
                    outputCtx.fillStyle = `rgba(${imageData.data[srcIdx]},${imageData.data[srcIdx+1]},${imageData.data[srcIdx+2]},${imageData.data[srcIdx+3]/255})`;
                    outputCtx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        // ✅ 캐시 저장
        squishCache.set(cacheKey, outputCanvas);
        
        // ✅ 캐시 크기 제한 (최대 20개)
        if (squishCache.size > 20) {
            const firstKey = squishCache.keys().next().value;
            squishCache.delete(firstKey);
        }
        
        ctx.drawImage(
            outputCanvas,
            screenX - playerSize/2,
            screenY - playerSize/2
        );
    }