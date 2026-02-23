import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StudyProvider } from "@/providers/StudyProvider";
import { usePremiumStore } from "@/stores/premiumStore";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { useAchievementStore } from "@/stores/achievementStore";
import { useThemeStore } from "@/stores/themeStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useColors } from "@/hooks/useColors";
import BadgeUnlockModal from "@/components/BadgeUnlockModal";
import LevelUpModal from "@/components/LevelUpModal";
import { useLevelUpStore } from "@/stores/levelUpStore";
import { StatusBar } from "expo-status-bar";
import { useRouter, useSegments } from "expo-router";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function OnboardingRedirect() {
  const { hasSeenOnboarding } = useSettingsStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait for navigation to be ready
    const timer = setTimeout(() => {
      if (!hasSeenOnboarding && segments[0] !== 'onboarding') {
        router.replace('/onboarding');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [hasSeenOnboarding, segments]);

  return null;
}

function PremiumInitializer() {
  useEffect(() => {
    usePremiumStore.getState().initialize();
    usePremiumStore.getState().checkAndResetDaily();
  }, []);
  return null;
}

function AnalyticsSessionTracker() {
  useEffect(() => {
    useAnalyticsStore.getState().startSession();
    useNotificationStore.getState().syncNotifications();
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

function LevelUpToast() {
  const { pendingLevelUp, dismissLevelUp } = useLevelUpStore();

  if (pendingLevelUp === null) return null;

  return (
    <LevelUpModal
      level={pendingLevelUp}
      visible={true}
      onDismiss={dismissLevelUp}
    />
  );
}

function RootLayoutNav() {
  const colors = useColors();
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Geri",
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.accent,
      contentStyle: { backgroundColor: colors.background }
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
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
      <Stack.Screen name="word-match" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const themeMode = useThemeStore((s) => s.mode);
  const colors = useColors();

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <StudyProvider>
          <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
          <PremiumInitializer />
          <AnalyticsSessionTracker />
          <OnboardingRedirect />
          <RootLayoutNav />
          <BadgeToast />
          <LevelUpToast />
        </StudyProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
