import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { Spacing } from "@/constants/theme";

// Import separately to avoid errors when not in tab context
let useBottomTabBarHeightHook: (() => number) | null = null;

try {
  useBottomTabBarHeightHook = require("@react-navigation/bottom-tabs").useBottomTabBarHeight;
} catch (e) {
  // useBottomTabBarHeight not available
}

export function useScreenInsets() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  
  // Call hook only if available - this returns 0 when not in tab navigator
  let tabBarHeight = 0;
  if (useBottomTabBarHeightHook) {
    try {
      tabBarHeight = useBottomTabBarHeightHook() ?? 0;
    } catch (e) {
      tabBarHeight = 0;
    }
  }

  return {
    paddingTop: headerHeight + Spacing.xl,
    paddingBottom: tabBarHeight + Spacing.xl + (tabBarHeight === 0 ? insets.bottom : 0),
    scrollInsetBottom: insets.bottom + 16,
  };
}
