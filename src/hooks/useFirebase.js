import { useLeaderboard } from '../shared/firebase/useLeaderboard';
import { useOtherPlayers } from '../shared/firebase/useOtherPlayers';
import { usePlayerPresence } from '../shared/firebase/usePlayerPresence';
import { usePlayerScore } from '../shared/firebase/usePlayerScore';
import { usePlayerSync } from '../shared/firebase/usePlayerSync';
import { useSquishes } from '../shared/firebase/useSquishes';
import { useZoneState } from '../shared/firebase/useZoneState';

export const useFirebase = (userId, position, nickname) => {
    usePlayerPresence(userId, nickname, position);
    usePlayerSync(userId, position, nickname);

    const otherPlayers = useOtherPlayers(userId);
    const zone = useZoneState();
    const loadedScore = usePlayerScore(userId);
    const leaderboard = useLeaderboard();
    const squishes = useSquishes();

    return { otherPlayers, zone, loadedScore, leaderboard, squishes };
};
