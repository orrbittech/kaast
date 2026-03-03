import { Text as RNText, TextProps } from "react-native";

/**
 * App Text component with Urbanist font as default.
 * Use font-sans-medium or font-sans-semibold in className for other weights.
 */
export function Text({ style, ...props }: TextProps) {
  return (
    <RNText
      style={[{ fontFamily: "Urbanist_400Regular" }, style]}
      {...props}
    />
  );
}
