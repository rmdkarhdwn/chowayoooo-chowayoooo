import { ref, set } from 'firebase/database';
import { database } from '../../firebase';
import { MAP_HEIGHT, MAP_WIDTH } from '../../utils/constants';

const ZONE_MARGIN = 300;

export function createZone() {
    const zoneRef = ref(database, 'zone');
    const nextZone = {
        id: Date.now(),
        x: Math.random() * (MAP_WIDTH - ZONE_MARGIN * 2) + ZONE_MARGIN,
        y: Math.random() * (MAP_HEIGHT - ZONE_MARGIN * 2) + ZONE_MARGIN,
        createdAt: Date.now(),
        duration: 30,
    };

    return set(zoneRef, nextZone);
}
