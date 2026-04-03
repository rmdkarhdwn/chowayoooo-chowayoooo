import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../../firebase';
import { createZone } from './createZone';

export function useZoneState() {
    const [zone, setZone] = useState(null);

    useEffect(() => {
        const zoneRef = ref(database, 'zone');

        const unsubscribe = onValue(zoneRef, (snapshot) => {
            const zoneData = snapshot.val();

            if (zoneData) {
                setZone(zoneData);
                return;
            }

            createZone();
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!zone) {
            return undefined;
        }

        const checkTimer = setInterval(() => {
            const elapsed = (Date.now() - zone.createdAt) / 1000;

            if (elapsed >= zone.duration) {
                createZone();
            }
        }, 1000);

        return () => clearInterval(checkTimer);
    }, [zone]);

    return zone;
}
