import { create } from "zustand";
import type { BookingPaymentTiming } from "../types/booking";

type WashVehicleClass = "compact" | "suv" | "van" | "luxury" | "truck" | "bike";

type ScannedVehicle = {
  registration: string;
  vehicleId?: string;
  vin?: string;
  make?: string | null;
  model?: string | null;
  color?: string | null;
  vehicleClass?: WashVehicleClass;
  loyaltyPoints?: number;
  rawPayload?: string;
};

type WalkInState = {
  scannedVehicle: ScannedVehicle | null;
  /** Editable plate for walk-in; seeded from scan and used for API submit. */
  vehicleRegistration: string;
  paymentTiming: BookingPaymentTiming;
  locationId: string | undefined;
  customerCellNumber: string;
  notes: string;
  setScannedVehicle: (vehicle: ScannedVehicle | null) => void;
  setVehicleRegistration: (vehicleRegistration: string) => void;
  setPaymentTiming: (timing: BookingPaymentTiming) => void;
  setLocationId: (locationId: string | undefined) => void;
  setCustomerCellNumber: (customerCellNumber: string) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
};

const defaultState = {
  scannedVehicle: null,
  vehicleRegistration: "",
  paymentTiming: "PAY_AT_PICKUP" as BookingPaymentTiming,
  locationId: undefined,
  customerCellNumber: "",
  notes: "",
};

export const useWalkInStore = create<WalkInState>((set) => ({
  ...defaultState,
  setScannedVehicle: (scannedVehicle) =>
    set({
      scannedVehicle,
      vehicleRegistration: scannedVehicle?.registration ?? "",
    }),
  setVehicleRegistration: (vehicleRegistration) => set({ vehicleRegistration }),
  setPaymentTiming: (paymentTiming) => set({ paymentTiming }),
  setLocationId: (locationId) => set({ locationId }),
  setCustomerCellNumber: (customerCellNumber) => set({ customerCellNumber }),
  setNotes: (notes) => set({ notes }),
  reset: () => set(defaultState),
}));
