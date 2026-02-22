import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import { PremiumTier } from '@/types';

// RevenueCat API Keys - Replace with your actual keys from RevenueCat dashboard
const REVENUECAT_API_KEY_IOS = 'appl_YOUR_REVENUECAT_IOS_API_KEY';
const REVENUECAT_API_KEY_ANDROID = 'goog_YOUR_REVENUECAT_ANDROID_API_KEY';

// RevenueCat entitlement identifier - must match what you configure in RevenueCat dashboard
const ENTITLEMENT_ID = 'premium';

interface PremiumStore {
  tier: PremiumTier;
  dailyQuestionsAnswered: number;
  dailyQuestionLimit: number;
  dailyExamsCompleted: number;
  dailyExamLimit: number;
  lastResetDate: string;
  isInitialized: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;

  initialize: () => Promise<void>;
  setTier: (tier: PremiumTier) => void;
  consumeQuestion: () => boolean;
  consumeExam: () => boolean;
  resetDailyCounters: () => void;
  checkAndResetDaily: () => void;
  purchaseLifetime: () => Promise<boolean>;
  restore: () => Promise<boolean>;
  syncPurchaseStatus: () => Promise<void>;
}

function checkEntitlements(customerInfo: CustomerInfo): boolean {
  return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
}

export const usePremiumStore = create<PremiumStore>()(
  persist(
    (set, get) => ({
      tier: 'free',
      dailyQuestionsAnswered: 0,
      dailyQuestionLimit: 10,
      dailyExamsCompleted: 0,
      dailyExamLimit: 1,
      lastResetDate: new Date().toISOString().split('T')[0],
      isInitialized: false,
      isPurchasing: false,
      isRestoring: false,

      initialize: async () => {
        if (get().isInitialized) return;

        try {
          const apiKey = Platform.OS === 'ios'
            ? REVENUECAT_API_KEY_IOS
            : REVENUECAT_API_KEY_ANDROID;

          Purchases.configure({ apiKey });

          // Listen for customer info changes
          Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
            const isPremium = checkEntitlements(info);
            get().setTier(isPremium ? 'premium' : 'free');
          });

          // Check current entitlements
          const customerInfo = await Purchases.getCustomerInfo();
          const isPremium = checkEntitlements(customerInfo);
          set({
            isInitialized: true,
            tier: isPremium ? 'premium' : 'free',
            dailyQuestionLimit: isPremium ? Infinity : 10,
            dailyExamLimit: isPremium ? Infinity : 1,
          });
        } catch (error) {
          console.warn('[RevenueCat] Initialization failed:', error);
          set({ isInitialized: true });
        }
      },

      setTier: (tier) => {
        set({
          tier,
          dailyQuestionLimit: tier === 'premium' ? Infinity : 10,
          dailyExamLimit: tier === 'premium' ? Infinity : 1,
        });
      },

      consumeQuestion: () => {
        const state = get();
        if (state.tier === 'premium') return true;
        if (state.dailyQuestionsAnswered >= state.dailyQuestionLimit) return false;
        set({ dailyQuestionsAnswered: state.dailyQuestionsAnswered + 1 });
        return true;
      },

      consumeExam: () => {
        const state = get();
        if (state.tier === 'premium') return true;
        if (state.dailyExamsCompleted >= state.dailyExamLimit) return false;
        set({ dailyExamsCompleted: state.dailyExamsCompleted + 1 });
        return true;
      },

      resetDailyCounters: () => {
        set({
          dailyQuestionsAnswered: 0,
          dailyExamsCompleted: 0,
          lastResetDate: new Date().toISOString().split('T')[0],
        });
      },

      checkAndResetDaily: () => {
        const today = new Date().toISOString().split('T')[0];
        if (get().lastResetDate !== today) {
          get().resetDailyCounters();
        }
      },

      purchaseLifetime: async () => {
        if (get().isPurchasing) return false;
        set({ isPurchasing: true });

        try {
          const offerings = await Purchases.getOfferings();
          const current = offerings.current;

          if (!current) {
            console.warn('[RevenueCat] No current offering found');
            set({ isPurchasing: false });
            return false;
          }

          // Look for the lifetime package
          const lifetimePackage: PurchasesPackage | undefined =
            current.lifetime ?? current.availablePackages[0];

          if (!lifetimePackage) {
            console.warn('[RevenueCat] No lifetime package found');
            set({ isPurchasing: false });
            return false;
          }

          const { customerInfo } = await Purchases.purchasePackage(lifetimePackage);
          const isPremium = checkEntitlements(customerInfo);

          if (isPremium) {
            get().setTier('premium');
          }

          set({ isPurchasing: false });
          return isPremium;
        } catch (error: any) {
          set({ isPurchasing: false });

          // User cancelled - not an error
          if (error.userCancelled) {
            return false;
          }

          console.warn('[RevenueCat] Purchase failed:', error);
          throw error;
        }
      },

      restore: async () => {
        if (get().isRestoring) return false;
        set({ isRestoring: true });

        try {
          const customerInfo = await Purchases.restorePurchases();
          const isPremium = checkEntitlements(customerInfo);

          if (isPremium) {
            get().setTier('premium');
          }

          set({ isRestoring: false });
          return isPremium;
        } catch (error) {
          set({ isRestoring: false });
          console.warn('[RevenueCat] Restore failed:', error);
          throw error;
        }
      },

      syncPurchaseStatus: async () => {
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          const isPremium = checkEntitlements(customerInfo);
          get().setTier(isPremium ? 'premium' : 'free');
        } catch (error) {
          console.warn('[RevenueCat] Sync failed:', error);
        }
      },
    }),
    {
      name: 'yds_premium',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tier: state.tier,
        dailyQuestionsAnswered: state.dailyQuestionsAnswered,
        dailyExamsCompleted: state.dailyExamsCompleted,
        lastResetDate: state.lastResetDate,
      }),
    }
  )
);
