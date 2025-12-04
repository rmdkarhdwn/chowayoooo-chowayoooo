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

// 구역 렌더링
// 클릭 왜곡 효과
export function renderSquishEffect(ctx, characterImage, squish, screenX, screenY, playerSize) {
    const pushDepth = 15;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = playerSize;
    tempCanvas.height = playerSize;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.drawImage(characterImage, 0, 0, playerSize, playerSize);
    const imageData = tempCtx.getImageData(0, 0, playerSize, playerSize);
    
    ctx.save();
    
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
    
    ctx.drawImage(
        outputCanvas,
        screenX - playerSize/2,
        screenY - playerSize/2
    );
    
    ctx.restore();
}