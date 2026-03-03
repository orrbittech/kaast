import { apiClient } from '../client';
import type {
    Device,
    CreateDevice,
    PairDevice,
    GeneratePairingCodeResponse,
} from '../types';

export const devicesApi = {
    /** POST /devices/pairing-code - Generate 6-digit pairing code for TV device (no auth) */
    generatePairingCode: async (
        deviceId: string,
    ): Promise<GeneratePairingCodeResponse> => {
        const { data } = await apiClient.post<GeneratePairingCodeResponse>(
            '/devices/pairing-code',
            { deviceId },
        );
        return data;
    },

    /** GET /locations/:locationId/devices - List devices for location */
    list: async (locationId: string): Promise<Device[]> => {
        const { data } = await apiClient.get<Device[]>(
            `/locations/${locationId}/devices`,
        );
        return data;
    },

    /** POST /locations/:locationId/devices - Create device */
    create: async (locationId: string, body: CreateDevice): Promise<Device> => {
        const { data } = await apiClient.post<Device>(
            `/locations/${locationId}/devices`,
            body,
        );
        return data;
    },

    /** POST /devices/pair - Pair device to org/location */
    pair: async (body: PairDevice): Promise<Device> => {
        const { data } = await apiClient.post<Device>('/devices/pair', body);
        return data;
    },

    /** GET /devices/:id - Get device by ID */
    getById: async (id: string): Promise<Device> => {
        const { data } = await apiClient.get<Device>(`/devices/${id}`);
        return data;
    },

    /** PATCH /devices/:id - Update device */
    update: async (
        id: string,
        body: Partial<{ name: string; status: string }>,
    ): Promise<Device> => {
        const { data } = await apiClient.patch<Device>(`/devices/${id}`, body);
        return data;
    },

    /** DELETE /devices/:id - Delete device */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/devices/${id}`);
    },
};
