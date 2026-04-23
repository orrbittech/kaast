import { useEffect } from "react";
import { Appearance, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useFonts } from "@expo-google-fonts/urbanist/useFonts";
import {
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
} from "@expo-google-fonts/urbanist";
import "../lib/theme/global.css";

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Dev reload / second call: native splash may not be registered for this view controller.
});

export { ErrorBoundary } from "../components/ErrorBoundary";

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file."
  );
}
const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

/**
 * Root layout - wraps auth and drawer groups.
 * Default route is / (drawer home). Auth at /sign-in, /sign-up.
 * App defaults to dark mode with Urbanist font.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
  });

  useEffect(() => {
    Appearance.setColorScheme("dark");
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync().catch(() => {
        // Fast Refresh can leave no native splash for this lifecycle; ignore.
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <StripeProvider publishableKey={stripePublishableKey} merchantIdentifier="merchant.karr.pos">
          <StatusBar
            style="light"
            translucent={Platform.OS === "android"}
            backgroundColor={Platform.OS === "android" ? "transparent" : undefined}
          />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          </Stack>
        </StripeProvider>
      </ClerkProvider>
    </QueryClientProvider>
  );
}
