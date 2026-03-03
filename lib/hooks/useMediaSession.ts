import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";

export interface MediaSession {
  deviceId: string;
  mediaUrl?: string | null;
  position: number;
  duration: number;
  playing: boolean;
  volume?: number | null;
}

export function useMediaSession(deviceId: string | undefined) {
  return useQuery({
    queryKey: ["mediaSession", deviceId],
    queryFn: async () => {
      if (!deviceId) return null;
      const { data } = await apiClient.get<MediaSession>(
        `/media/sessions/${deviceId}`
      );
      return data;
    },
    enabled: !!deviceId,
    refetchInterval: 5000,
  });
}
