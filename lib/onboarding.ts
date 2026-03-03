import * as SecureStore from 'expo-secure-store';

export const ONBOARDING_KEY = 'kaast_has_completed_onboarding';

export interface OnboardingSlide {
    title: string;
    subtitle: string;
    icon: string;
}

/**
 * Onboarding slides - sales-focused copy for KaasT intro and features.
 * Written to resonate with brand managers and multi-location operators.
 */
export const SLIDES: OnboardingSlide[] = [
    {
        title: 'KaasT',
        subtitle:
            'Your command center for brand-wide media. One app to control every screen across your organization—from retail to lobbies to waiting rooms.',
        icon: '📺',
    },
    {
        title: 'Media at Your Fingertips',
        subtitle:
            'Manage every display, playlist, and schedule from a single dashboard. One location or hundreds—KaasT puts complete control in your hands.',
        icon: '📱',
    },
    {
        title: 'Control Rogue Media',
        subtitle:
            'Eliminate unauthorized content and ensure only approved messaging reaches your screens. Schedule campaigns with precision, lock down playlists, and enforce brand guidelines.',
        icon: '🎯',
    },
    {
        title: 'Uniform Brand Experience',
        subtitle:
            'Deliver consistent media and music across every store, branch, and venue. One voice, one look, everywhere.',
        icon: '🎵',
    },
    {
        title: 'Get Started',
        subtitle:
            'Sign in now and take control of your media empire. Join brands that trust KaasT to keep their screens on-message and on-brand.',
        icon: '🚀',
    },
];

/**
 * Check if user has completed onboarding.
 * Uses SecureStore (native only); on web returns false.
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
    try {
        const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
        return value === 'true';
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
        await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    } catch {
        // SecureStore unavailable (e.g. web) - no-op
    }
}
