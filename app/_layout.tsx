import { Stack } from "expo-router";
import React from "react";
import Toast, {
  BaseToastProps,
  ErrorToast,
  InfoToast,
  SuccessToast
} from "react-native-toast-message";

const toastConfig = {
  // Cấu hình cho thông báo thành công hoặc kết bạn
  success: (props: BaseToastProps) => (
    <SuccessToast
      {...props}
      style={{ borderLeftColor: '#4CAF50', height: 80, width: '94%' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17, // Tiêu đề lớn hơn
        fontWeight: "700",
        color: '#1a1a1a'
      }}
      text2Style={{
        fontSize: 15, // Nội dung lớn hơn
        color: '#444'
      }}
      text2NumberOfLines={2} // Cho phép hiển thị 2 dòng nội dung
    />
  ),

  // Cấu hình cho tin nhắn mới hoặc thông báo chung
  info: (props: BaseToastProps) => (
    <InfoToast
      {...props}
      style={{ borderLeftColor: '#007AFF', height: 80, width: '94%' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: "700",
      }}
      text2Style={{
        fontSize: 15,
      }}
      text2NumberOfLines={2}
    />
  ),

  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#FF3B30', height: 80, width: '94%' }}
      text1Style={{ fontSize: 17, fontWeight: "700" }}
      text2Style={{ fontSize: 15 }}
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

      <Toast
        config={toastConfig}
        position="top"
        topOffset={50}
        visibilityTime={4000} // Hiện lâu hơn một chút (4 giây)
      />
    </>
  );
}