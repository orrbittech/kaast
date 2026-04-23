import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "../api";

const publicSiteSettingsSchema = z.object({
  businessName: z.string(),
});

export type PublicSiteSettings = z.infer<typeof publicSiteSettingsSchema>;

export function usePublicSiteSettings() {
  return useQuery({
    queryKey: ["public-site-settings"],
    queryFn: async () => {
      const { data } = await apiClient.get<PublicSiteSettings>("/public/site-settings");
      return publicSiteSettingsSchema.parse(data);
    },
  });
}
