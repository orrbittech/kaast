import { apiClient } from '../client';
import type { Organization } from '../types';

export const organizationsApi = {
    /** GET /orgs - List organizations for current user */
    list: async (): Promise<Organization[]> => {
        const { data } = await apiClient.get<Organization[]>('/orgs');
        return data;
    },

    /** GET /orgs/:id - Get organization by ID */
    getById: async (id: string): Promise<Organization> => {
        const { data } = await apiClient.get<Organization>(`/orgs/${id}`);
        return data;
    },
};
