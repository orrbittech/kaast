import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";

export interface Device {
  id: string;
  deviceId: string;
  name: string;
  status: string;
  lastSeenAt?: string;
}

export function useDevices(locationId: string | undefined) {
  return useQuery({
    queryKey: ["devices", locationId],
    queryFn: async () => {
      if (!locationId) return [];
      const { data } = await apiClient.get<Device[]>(
        `/locations/${locationId}/devices`
      );
      return data;
    },
    enabled: !!locationId,
  });
}
