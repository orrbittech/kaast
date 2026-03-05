import { apiClient, type ApiRequestConfig } from '../client';
import type {
    Device,
    DeviceWithMediaSession,
    CreateDevice,
    PairDevice,
    PairDeviceResponse,
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

    /** GET /devices - List all devices for organization. Pass organizationId for org-scoped JWT. */
    list: async (organizationId?: string): Promise<Device[]> => {
        if (!organizationId || organizationId === 'undefined' || organizationId === 'null') {
            return [];
        }
        const config = { organizationId } as ApiRequestConfig;
        const { data } = await apiClient.get<Device[]>('/devices', config);
        return data;
    },

    /** POST /devices - Create device. Org from token (pass organizationId for org-scoped JWT). */
    create: async (body: CreateDevice, organizationId?: string): Promise<Device> => {
        const config: ApiRequestConfig = organizationId ? { organizationId } : {};
        const { data } = await apiClient.post<Device>('/devices', body, config as Parameters<typeof apiClient.post>[2]);
        return data;
    },

    /** POST /devices/pair - Pair device to org/location (pass organizationId for org-scoped JWT). */
    pair: async (body: PairDevice, organizationId?: string): Promise<PairDeviceResponse> => {
        const config: ApiRequestConfig = organizationId ? { organizationId } : {};
        const { data } = await apiClient.post<PairDeviceResponse>('/devices/pair', body, config as Parameters<typeof apiClient.post>[2]);
        return data;
    },

    /** GET /devices/:id - Get device by ID */
    getById: async (id: string): Promise<DeviceWithMediaSession> => {
        const { data } = await apiClient.get<DeviceWithMediaSession>(
            `/devices/${id}`,
        );
        return data;
    },

    /** PATCH /devices/:id - Update device */
    update: async (
        id: string,
        body: Partial<{ name: string; status: string; locationId: string | null; activePlaylistId: string | null }>,
    ): Promise<Device> => {
        const { data } = await apiClient.patch<Device>(`/devices/${id}`, body);
        return data;
    },

    /** DELETE /devices/:id - Delete device */
    delete: async (id: string): Promise<{ deleted: boolean }> => {
        const { data } = await apiClient.delete<{ deleted: boolean }>(
            `/devices/${id}`,
        );
        return data ?? { deleted: true };
    },
};
