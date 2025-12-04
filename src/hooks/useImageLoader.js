import { useEffect, useState } from 'react';

export const useImageLoader = (normalSrc, happySrc) => {
    const [normalImage, setNormalImage] = useState(null);
    const [happyImage, setHappyImage] = useState(null);

    useEffect(() => {
        const img = new Image();
        img.src = normalSrc;
        img.onload = () => setNormalImage(img);
        
        const happyImg = new Image();
        happyImg.src = happySrc;
        happyImg.onload = () => setHappyImage(happyImg);
    }, [normalSrc, happySrc]);

    return { normalImage, happyImage };
};