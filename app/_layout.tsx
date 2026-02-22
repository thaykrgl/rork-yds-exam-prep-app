import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StudyProvider } from "@/providers/StudyProvider";
import { usePremiumStore } from "@/stores/premiumStore";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { useAchievementStore } from "@/stores/achievementStore";
import BadgeUnlockModal from "@/components/BadgeUnlockModal";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function PremiumDailyReset() {
  useEffect(() => {
    usePremiumStore.getState().checkAndResetDaily();
  }, []);
  return null;
}

function AnalyticsSessionTracker() {
  useEffect(() => {
    useAnalyticsStore.getState().startSession();
    return () => {
      useAnalyticsStore.getState().endSession();
    };
  }, []);
  return null;
}

function BadgeToast() {
  const { newBadgeQueue, dismissBadge } = useAchievementStore();
  const currentBadge = newBadgeQueue.length > 0 ? newBadgeQueue[0] : null;

  if (!currentBadge) return null;

  return (
    <BadgeUnlockModal
      badge={currentBadge}
      visible={true}
      onDismiss={dismissBadge}
    />
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Geri" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="quiz" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="exam" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="exam-result" options={{ headerShown: false }} />
      <Stack.Screen name="daily-review" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="bookmarked-quiz" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="analytics" options={{ headerShown: false }} />
      <Stack.Screen name="study-plans" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="study-plan-detail" options={{ headerShown: false }} />
      <Stack.Screen name="grammar-library" options={{ headerShown: false }} />
      <Stack.Screen name="grammar-topic" options={{ headerShown: false }} />
      <Stack.Screen name="personal-records" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <StudyProvider>
          <PremiumDailyReset />
          <AnalyticsSessionTracker />
          <RootLayoutNav />
          <BadgeToast />
        </StudyProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
