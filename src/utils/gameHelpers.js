// src/utils/gameHelpers.js

// 거리 계산
export function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// 구역 안에 있는지 체크
export function isInsideZone(playerX, playerY, zone, zoneSize) {
    if (!zone) return false;
    return Math.abs(playerX - zone.x) < zoneSize / 2 &&
        Math.abs(playerY - zone.y) < zoneSize / 2;
}

// 화면 안에 있는지 체크
export function isOnScreen(x, y, cameraX, cameraY, canvasWidth, canvasHeight, objectSize) {
    const screenX = x - cameraX;
    const screenY = y - cameraY;
    return screenX > -objectSize && screenX < canvasWidth + objectSize &&
    screenY > -objectSize && screenY < canvasHeight + objectSize;
}