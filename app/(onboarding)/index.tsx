import { useState, useRef } from "react";
import {
  View,
  Pressable,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { setOnboardingComplete, SLIDES } from "../../lib/onboarding";
import { Text } from "../../components/ui/Text";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Onboarding screen - 2-3 slides with centered content.
 * Persists completion to SecureStore, then navigates to sign-in.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const onGetStarted = async () => {
    await setOnboardingComplete();
    router.replace("/sign-in");
  };

  const onNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      onGetStarted();
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-base"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, index) => (
          <View
            key={index}
            className="flex-1 justify-center items-center px-8"
            style={{ width: SCREEN_WIDTH }}
          >
            <View className="items-center">
              <Text className="text-[120px] mb-6">{slide.icon}</Text>
              <Text className="text-2xl font-sans-semibold text-white text-center mb-3">
                {slide.title}
              </Text>
              <Text className="text-zinc-400 text-center mb-12">
                {slide.subtitle}
              </Text>
              <Pressable
                onPress={onNext}
                className="py-3 px-8 rounded-lg bg-primary active:opacity-90"
              >
                <Text className="font-sans-medium text-white">
                  {index === SLIDES.length - 1 ? "Get Started" : "Next"}
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View className="flex-row justify-center gap-2 pb-12">
        {SLIDES.map((_, index) => (
          <View
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? "bg-primary" : "bg-zinc-600"
            }`}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}
