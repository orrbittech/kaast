import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";

export interface Location {
  id: string;
  name: string;
  address?: string;
  timezone?: string;
}

export function useLocations(orgId: string | undefined) {
  return useQuery({
    queryKey: ["locations", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data } = await apiClient.get<Location[]>(`/orgs/${orgId}/locations`);
      return data;
    },
    enabled: !!orgId,
  });
}
