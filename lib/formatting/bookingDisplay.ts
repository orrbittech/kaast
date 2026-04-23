import type { Booking } from "../api/schemas";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** e.g. `18 Apr 12:09` in the device local calendar (no year). */
export function formatBookingDateShort(scheduledAtIso: string): string {
  const d = new Date(scheduledAtIso);
  const mon = MONTHS_SHORT[d.getMonth()];
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${mon} ${hh}:${mm}`;
}

/** Make + model (or nickname / registration); empty if nothing usable. */
export function formatBookingVehicleTitle(vehicle: Booking["vehicle"]): string {
  if (!vehicle) return "";
  const makeModel = [vehicle.make, vehicle.model]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(" ")
    .trim();
  if (makeModel) return makeModel;
  const nick = vehicle.nickname?.trim();
  if (nick) return nick;
  return vehicle.registration?.trim() ?? "";
}

export function formatBookingVehicleColor(vehicle: Booking["vehicle"]): string {
  return vehicle?.color?.trim() ?? "";
}

/** Single line for list cards: title · color, or fallback. */
export function formatBookingVehicleSummaryLine(vehicle: Booking["vehicle"]): string {
  const title = formatBookingVehicleTitle(vehicle);
  const color = formatBookingVehicleColor(vehicle);
  if (!title && !color) return "Vehicle not linked";
  if (!color) return title;
  if (!title) return color;
  return `${title} · ${color}`;
}

export function showKeyCustodyAfterWash(visitStatus: Booking["visitStatus"]): boolean {
  return visitStatus === "WASH_DONE" || visitStatus === "READY_FOR_PICKUP";
}
