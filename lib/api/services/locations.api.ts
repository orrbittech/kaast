import { apiClient } from '../client';
import type { Location, CreateLocation, UpdateLocation } from '../types';

export const locationsApi = {
    /** GET /orgs/:orgId/locations - List locations for organization */
    list: async (orgId: string): Promise<Location[]> => {
        const { data } = await apiClient.get<Location[]>(
            `/orgs/${orgId}/locations`,
        );
        return data;
    },

    /** POST /orgs/:orgId/locations - Create location */
    create: async (orgId: string, body: CreateLocation): Promise<Location> => {
        const { data } = await apiClient.post<Location>(
            `/orgs/${orgId}/locations`,
            body,
        );
        return data;
    },

    /** GET /orgs/:orgId/locations/:id - Get location by ID */
    getById: async (orgId: string, id: string): Promise<Location> => {
        const { data } = await apiClient.get<Location>(
            `/orgs/${orgId}/locations/${id}`,
        );
        return data;
    },

    /** PATCH /orgs/:orgId/locations/:id - Update location */
    update: async (
        orgId: string,
        id: string,
        body: UpdateLocation,
    ): Promise<Location> => {
        const { data } = await apiClient.patch<Location>(
            `/orgs/${orgId}/locations/${id}`,
            body,
        );
        return data;
    },

    /** DELETE /orgs/:orgId/locations/:id - Delete location */
    delete: async (orgId: string, id: string): Promise<void> => {
        await apiClient.delete(`/orgs/${orgId}/locations/${id}`);
    },
};
