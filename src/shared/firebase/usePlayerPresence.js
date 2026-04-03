import { useEffect, useRef } from 'react';
import { onDisconnect, ref, remove, set } from 'firebase/database';
import { database } from '../../firebase';

export function usePlayerPresence(userId, nickname, initialPosition) {
    const initialPositionRef = useRef(initialPosition);

    useEffect(() => {
        if (!userId || !nickname) {
            return undefined;
        }

        const playerRef = ref(database, `players/${userId}`);
        const { x, y } = initialPositionRef.current;
        const disconnectHandler = onDisconnect(playerRef);

        set(playerRef, {
            x,
            y,
            nickname,
            lastUpdate: Date.now(),
        });

        disconnectHandler.remove();

        return () => {
            disconnectHandler.cancel();
            remove(playerRef);
        };
    }, [nickname, userId]);
}
