import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";
import { locationListSchema, type Location } from "../api/schemas";

function parseLocationList(data: unknown): Location[] {
  const parsed = locationListSchema.safeParse(data);
  if (!parsed.success) {
    if (__DEV__) {
      console.warn("[useLocations] Zod parse failed", parsed.error.flatten());
    }
    throw new Error(
      `Invalid locations response: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
    );
  }
  return parsed.data;
}

export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>("/locations");
      return parseLocationList(data);
    },
  });
}
