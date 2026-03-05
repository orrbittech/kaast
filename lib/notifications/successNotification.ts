import * as Notifications from 'expo-notifications';

/** Show notifications as banner when app is in foreground */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

/** Whether permission has been requested this session (avoids repeated prompts) */
let permissionRequested = false;

/**
 * Requests notification permissions if not yet granted.
 * Call early (e.g. in root layout) for best UX.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    if (permissionRequested) {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
    }
    permissionRequested = true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

/**
 * Shows a local success notification as a push-style banner.
 * Schedules immediately; no server required.
 * Handles permission request on first use.
 *
 * @param title - Notification title (e.g. "Device updated")
 * @param body - Optional body text (e.g. device/playlist name)
 */
export async function showSuccessNotification(
    title: string,
    body?: string,
): Promise<void> {
    try {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body: body ?? '',
                data: { type: 'success' },
            },
            trigger: null, // null = show immediately
        });
    } catch {
        // Silently ignore if notifications fail (e.g. web, simulator)
    }
}
