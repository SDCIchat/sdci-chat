import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { Spacing } from "@/constants/theme";

export function useScreenInsets() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  
  // Always call the hook - it returns 0 when not in a tab navigator context
  const tabBarHeight = useBottomTabBarHeight();

  return {
    paddingTop: headerHeight + Spacing.xl,
    paddingBottom: tabBarHeight + Spacing.xl + (tabBarHeight === 0 ? insets.bottom : 0),
    scrollInsetBottom: insets.bottom + 16,
  };
}
