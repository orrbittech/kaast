import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api";
import {
  createVehicleSchema,
  vehicleListSchema,
  vehicleSchema,
  type CreateVehicleBody,
  type Vehicle,
} from "../api/schemas";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await apiClient.get<Vehicle[]>("/vehicles");
      return vehicleListSchema.parse(data);
    },
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateVehicleBody) => {
      const payload = createVehicleSchema.parse(body);
      const { data } = await apiClient.post<Vehicle>("/vehicles", payload);
      return vehicleSchema.parse(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}
