import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const ANDROID_CHANNEL_ID = "walk-in-default";

let handlerRegistered = false;
let androidChannelReady = false;

function ensureForegroundHandler(): void {
  if (handlerRegistered) return;
  handlerRegistered = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android" || androidChannelReady) return;
  androidChannelReady = true;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Bookings",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export type WalkInBookedNotificationInput = {
  bookingCode: string;
  plate: string;
};

/** Best-effort local notification after walk-in booking; never throws. */
export async function notifyWalkInBookedIn(input: WalkInBookedNotificationInput): Promise<void> {
  try {
    if (Platform.OS === "web") return;

    ensureForegroundHandler();
    await ensureAndroidChannel();

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Booking created",
        body: `${input.bookingCode} · ${input.plate}`,
        sound: Platform.OS === "android" ? "default" : true,
      },
      trigger:
        Platform.OS === "android"
          ? { channelId: ANDROID_CHANNEL_ID }
          : null,
    });
  } catch {
    /* notification failures must not break booking flow */
  }
}
