import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";
import { washPackageListSchema, type WashPackage } from "../api/schemas";

function parseWashPackageList(data: unknown): WashPackage[] {
  const parsed = washPackageListSchema.safeParse(data);
  if (!parsed.success) {
    if (__DEV__) {
      console.warn("[useWashPackages] Zod parse failed", parsed.error.flatten());
    }
    throw new Error(
      `Invalid wash-packages response: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
    );
  }
  return parsed.data;
}

export function useWashPackages() {
  return useQuery({
    queryKey: ["wash-packages"],
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>("/wash-packages");
      return parseWashPackageList(data);
    },
  });
}
