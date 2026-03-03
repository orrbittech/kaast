import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";

export interface Organization {
  id: string;
  clerkOrgId: string;
  name: string;
  slug?: string;
  role: string;
}

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data } = await apiClient.get<Organization[]>("/orgs");
      return data;
    },
  });
}
