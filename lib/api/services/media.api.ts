import { apiClient } from '../client';
import type { MediaSession, MediaCommand } from '../types';

export const mediaApi = {
    /** GET /media/sessions/:deviceId - Get media session for device */
    getSession: async (deviceId: string): Promise<MediaSession> => {
        const { data } = await apiClient.get<MediaSession>(
            `/media/sessions/${deviceId}`,
        );
        return data;
    },

    /** POST /media/commands - Send media command to device */
    sendCommand: async (body: MediaCommand): Promise<void> => {
        await apiClient.post('/media/commands', body);
    },
};
