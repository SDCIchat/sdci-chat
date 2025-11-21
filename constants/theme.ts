import { Platform } from "react-native";

const primaryColor = "#5B7FFF";
const secondaryColor = "#7C3AED";

export const Colors = {
  light: {
    primary: primaryColor,
    secondary: secondaryColor,
    text: "#1F2937",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: primaryColor,
    link: primaryColor,
    background: "#FFFFFF",
    surface: "#F7F8FA",
    border: "#E5E7EB",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    messageSent: primaryColor,
    messageReceived: "#F7F8FA",
    messageSystem: "#E5E7EB",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F7F8FA",
    backgroundSecondary: "#E5E7EB",
    backgroundTertiary: "#D1D5DB",
  },
  dark: {
    primary: primaryColor,
    secondary: secondaryColor,
    text: "#FFFFFF",
    textSecondary: "#98989D",
    buttonText: "#FFFFFF",
    tabIconDefault: "#98989D",
    tabIconSelected: primaryColor,
    link: primaryColor,
    background: "#000000",
    surface: "#1C1C1E",
    border: "#38383A",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    messageSent: primaryColor,
    messageReceived: "#1C1C1E",
    messageSystem: "#38383A",
    backgroundRoot: "#000000",
    backgroundDefault: "#1C1C1E",
    backgroundSecondary: "#38383A",
    backgroundTertiary: "#48484A",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  headerLarge: {
    fontSize: 34,
    fontWeight: "700" as const,
  },
  header: {
    fontSize: 28,
    fontWeight: "600" as const,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 17,
    fontWeight: "400" as const,
  },
  subhead: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
