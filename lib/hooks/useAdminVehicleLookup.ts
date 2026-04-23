import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api";
import {
  adminVehicleLookupResponseSchema,
  type AdminVehicleLookupResponse,
} from "../api/schemas";

export function useAdminVehicleLookup() {
  return useMutation({
    mutationFn: async (registration: string): Promise<AdminVehicleLookupResponse> => {
      const { data } = await apiClient.get("/admin/vehicles/by-registration", {
        params: { registration },
      });
      return adminVehicleLookupResponseSchema.parse(data);
    },
  });
}
