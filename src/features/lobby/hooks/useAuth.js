import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../../../firebase';

export function useAuth() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        signInAnonymously(auth);

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return unsubscribe;
    }, []);

    return user;
}
