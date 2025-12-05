import { useEffect, useState } from 'react'; // ✅ 추가

export const useImageLoader = (normalSrc, happySrc, backgroundSrc, zoneSrc) => {
    const [normalImage, setNormalImage] = useState(null);
    const [happyImage, setHappyImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [zoneImage, setZoneImage] = useState(null);

    useEffect(() => {
        const img = new Image();
        img.src = normalSrc;
        img.onload = () => setNormalImage(img);
        
        const happyImg = new Image();
        happyImg.src = happySrc;
        happyImg.onload = () => setHappyImage(happyImg);
        
        if (backgroundSrc) {
            const bgImg = new Image();
            bgImg.src = backgroundSrc;
            bgImg.onload = () => setBackgroundImage(bgImg);
        }
        
        if (zoneSrc) {
            const zImg = new Image();
            zImg.src = zoneSrc;
            zImg.onload = () => setZoneImage(zImg);
        }
    }, [normalSrc, happySrc, backgroundSrc, zoneSrc]);

    return { normalImage, happyImage, backgroundImage, zoneImage };
};