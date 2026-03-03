import * as SecureStore from "expo-secure-store";

export const ONBOARDING_KEY = "kaast_has_completed_onboarding";

export interface OnboardingSlide {
  title: string;
  subtitle: string;
  icon: string;
}

/**
 * Onboarding slides - sales-focused copy for KaasT intro and features.
 */
export const SLIDES: OnboardingSlide[] = [
  {
    title: "KaasT",
    subtitle:
      "Your command center for brand-wide media. One app to rule every screen.",
    icon: "📺",
  },
  {
    title: "Media at Your Fingertips",
    subtitle:
      "Manage every screen across your organization from one powerful app. No more juggling devices.",
    icon: "📱",
  },
  {
    title: "Control Rogue Media",
    subtitle:
      "Eliminate unauthorized content. Schedule and plan with precision. Your brand, your rules.",
    icon: "🎯",
  },
  {
    title: "Uniform Brand Experience",
    subtitle:
      "Deliver consistent media and music across every store location. One voice, everywhere.",
    icon: "🎵",
  },
  {
    title: "Get Started",
    subtitle:
      "Get Star Fire. Sign in and take control of your media empire today.",
    icon: "🚀",
  },
];

/**
 * Check if user has completed onboarding.
 * Uses SecureStore (native only); on web returns false.
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
    return value === "true";
  } catch {
    return false;
  }
}

/**
 * Mark onboarding as complete.
 * Uses SecureStore (native only); on web no-op.
 */
export async function setOnboardingComplete(): Promise<void> {
  try {
    await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
  } catch {
    // SecureStore unavailable (e.g. web) - no-op
  }
}
