import * as SecureStore from "expo-secure-store";

export const ONBOARDING_KEY = "karr_has_completed_onboarding";
const LEGACY_ONBOARDING_KEY = "kaast_has_completed_onboarding";

export interface OnboardingSlide {
  title: string;
  subtitle: string;
  icon: string;
}

export const SLIDES: OnboardingSlide[] = [
  {
    title: "KARR",
    subtitle:
      "Welcome to your drive-through car wash command center.",
    icon: "🚗",
  },
  {
    title: "Fast Drive-In Intake",
    subtitle:
      "Scan license discs, prefill vehicle details, and start walk-ins in seconds.",
    icon: "📷",
  },
  {
    title: "Secure Key Handover",
    subtitle:
      "Release controls protect keys with claim code, PIN verification, and audit logs.",
    icon: "🔐",
  },
  {
    title: "Service Flow Built-In",
    subtitle:
      "Track every job from keys collected to wash complete and pickup ready.",
    icon: "🧽",
  },
  {
    title: "Ready to Wash",
    subtitle:
      "Sign in and start serving customers at your bay.",
    icon: "✅",
  },
];

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const legacy = await SecureStore.getItemAsync(LEGACY_ONBOARDING_KEY);
    if (legacy === "true") {
      await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
      await SecureStore.deleteItemAsync(LEGACY_ONBOARDING_KEY);
    }
    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
  } catch {
    // SecureStore unavailable (e.g. web) - no-op
  }
}
