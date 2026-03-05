import { useEffect } from 'react';
import { Alert } from 'react-native';
import { onNetworkError } from '../lib/api/networkEvents';
import { getUserFriendlyMessage } from '../lib/api';

/**
 * Global handler for API/network errors.
 * Subscribes to network error events and shows a single Alert for each error.
 * Mount once in root layout.
 */
export function NetworkErrorHandler() {
    useEffect(() => {
        const unsubscribe = onNetworkError((error) => {
            Alert.alert('Error', getUserFriendlyMessage(error));
        });
        return unsubscribe;
    }, []);

    return null;
}
