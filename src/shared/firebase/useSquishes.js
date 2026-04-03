import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../../firebase';

export function useSquishes() {
    const [squishes, setSquishes] = useState({});

    useEffect(() => {
        const squishesRef = ref(database, 'squishes');

        const unsubscribe = onValue(squishesRef, (snapshot) => {
            setSquishes(snapshot.val() || {});
        });

        return unsubscribe;
    }, []);

    return squishes;
}
