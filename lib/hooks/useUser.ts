import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";

export interface UserProfile {
  id: string;
  clerkUserId: string;
  email?: string;
  name?: string;
  imageUrl?: string;
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<UserProfile>("/users/me");
      return data;
    },
  });
}
