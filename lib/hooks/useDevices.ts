import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import {
    devicesApi,
    deviceKeys,
    locationKeys,
    type Device,
    type CreateDevice,
    type PairDevice,
} from '../api';
import { showSuccessNotification } from '../notifications/successNotification';

export type { Device };

/** List all devices for an organization. Refetches on app focus and uses 30s stale time. */
export function useDevices(orgId: string | undefined) {
    return useQuery({
        queryKey: deviceKeys.list(orgId ?? ''),
        queryFn: () => devicesApi.list(orgId),
        enabled: !!orgId,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    });
}

/** Single device by UUID. Used for control screen and device detail. */
export function useDevice(id: string | undefined) {
    return useQuery({
        queryKey: deviceKeys.detail(id ?? ''),
        queryFn: () => devicesApi.getById(id!),
        enabled: !!id,
        staleTime: 15_000,
        refetchOnWindowFocus: true,
    });
}

/** Create device. Org from token. Pass orgId for org-scoped JWT. Invalidates all device queries. */
export function useCreateDevice(orgId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreateDevice) => devicesApi.create(body, orgId),
        onSuccess: (data) => {
            if (orgId) {
                queryClient.setQueryData(deviceKeys.list(orgId), (old: Device[] | undefined) =>
                    old ? [...old, data] : [data],
                );
            }
            queryClient.invalidateQueries({ queryKey: deviceKeys.all });
            showSuccessNotification('Device created', data.name);
        },
    });
}

/** Update device. Optimistically updates list, invalidates all device queries. */
export function useUpdateDevice(orgId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            body,
        }: {
            id: string;
            body: Partial<{ name: string; status: string; locationId: string | null; activePlaylistId: string | null }>;
        }) => devicesApi.update(id, body),
        onSuccess: (data, variables) => {
            if (orgId) {
                queryClient.setQueryData(deviceKeys.list(orgId), (old: Device[] | undefined) =>
                    old
                        ? old.map((d) => (d.id === variables.id ? { ...d, ...data } : d))
                        : [],
                );
            }
            queryClient.invalidateQueries({ queryKey: deviceKeys.all });
            showSuccessNotification('Device updated', data.name);
        },
    });
}

/** Delete device. Optimistically removes from list, removes detail, invalidates all device queries. */
export function useDeleteDevice(orgId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => devicesApi.delete(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: deviceKeys.detail(id) });
            if (orgId) {
                queryClient.setQueryData(deviceKeys.list(orgId), (old: Device[] | undefined) =>
                    old ? old.filter((d) => d.id !== id) : [],
                );
            }
            queryClient.invalidateQueries({ queryKey: deviceKeys.all });
            showSuccessNotification('Device deleted');
        },
    });
}

/** Pair device with 6-digit code. Org from token. Pass orgId for org-scoped JWT. Invalidates device and location queries. */
export function usePairDevice(orgId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: PairDevice) => devicesApi.pair(body, orgId),
        onSuccess: (data) => {
            if (orgId) {
                queryClient.setQueryData(deviceKeys.list(orgId), (old: Device[] | undefined) =>
                    old ? [...old, data.device] : [data.device],
                );
            }
            queryClient.invalidateQueries({ queryKey: deviceKeys.all });
            if (orgId) {
                queryClient.invalidateQueries({
                    queryKey: locationKeys.list(orgId),
                });
            }
            showSuccessNotification('Device paired', data.device.name);
        },
    });
}

/** Generate pairing code for TV device. No cache invalidation. */
export function useGeneratePairingCode() {
    return useMutation({
        mutationFn: (deviceId: string) =>
            devicesApi.generatePairingCode(deviceId),
    });
}
