import { useEffect, useRef } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../../firebase';

const MIN_SYNC_INTERVAL_MS = 50;

export function usePlayerSync(userId, position, nickname) {
    const lastSyncRef = useRef({
        x: null,
        y: null,
        nickname: null,
        syncedAt: 0,
    });
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (!userId || !nickname) {
            return undefined;
        }

        const lastSync = lastSyncRef.current;
        const hasChanged =
            lastSync.x !== position.x ||
            lastSync.y !== position.y ||
            lastSync.nickname !== nickname;

        if (!hasChanged) {
            return undefined;
        }

        const playerRef = ref(database, `players/${userId}`);
        const syncPlayer = () => {
            const syncedAt = Date.now();

            lastSyncRef.current = {
                x: position.x,
                y: position.y,
                nickname,
                syncedAt,
            };

            timeoutRef.current = null;

            update(playerRef, {
                x: position.x,
                y: position.y,
                nickname,
                lastUpdate: syncedAt,
            });
        };

        const elapsed = Date.now() - lastSync.syncedAt;

        if (elapsed >= MIN_SYNC_INTERVAL_MS) {
            syncPlayer();
            return undefined;
        }

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(syncPlayer, MIN_SYNC_INTERVAL_MS - elapsed);

        return undefined;
    }, [nickname, position.x, position.y, userId]);

    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, []);
}
