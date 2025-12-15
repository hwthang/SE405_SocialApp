import { Stack } from "expo-router";
import React from "react";
import Toast, {
  ErrorToast,
  SuccessToast
} from "react-native-toast-message";

const toastConfig = {
  success: (props: any) => (
    <SuccessToast
      {...props}
      text1Style={{
        fontSize: 16,   // ✅ text1 = 16px
        fontWeight: "600",
      }}
      text2Style={{
        fontSize: 14,   // ✅ text2 = 14px
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
      }}
      text2Style={{
        fontSize: 14,
      }}
    />
  ),
};

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>

      {/* ✅ Toast nằm ngoài Stack */}
      <Toast
        config={toastConfig}
        position="top"
        topOffset={60}
      />
    </>
  );
}
