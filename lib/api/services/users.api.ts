import { apiClient } from '../client';
import type { UserProfile } from '../types';

export const usersApi = {
    /** GET /users/me - Current user profile */
    getMe: async (): Promise<UserProfile> => {
        const { data } = await apiClient.get<UserProfile>('/users/me');
        return data;
    },
};
