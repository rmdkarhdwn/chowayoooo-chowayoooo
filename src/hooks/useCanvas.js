import { useEffect } from 'react';

export const useCanvas = (canvasRef, renderFn, dependencies) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        renderFn(ctx);
    }, dependencies);
};