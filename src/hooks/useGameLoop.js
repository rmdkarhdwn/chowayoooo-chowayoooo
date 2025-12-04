// src/hooks/useImageLoader.js
import { useEffect, useState } from 'react';

export const useImageLoader = (normalSrc, happySrc) => {
    const [normalImage, setNormalImage] = useState(null);
    const [happyImage, setHappyImage] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let loadedCount = 0;
        
        const img = new Image();
        img.src = normalSrc;
        img.onload = () => {
            setNormalImage(img);
            loadedCount++;
            if (loadedCount === 2) setLoaded(true);
        };
        
        const happyImg = new Image();
        happyImg.src = happySrc;
        happyImg.onload = () => {
            setHappyImage(happyImg);
            loadedCount++;
            if (loadedCount === 2) setLoaded(true);
        };
    }, [normalSrc, happySrc]);

    return { normalImage, happyImage, loaded };
};