import CustomSplashScreen from "@/component/custom/CustomSplashScreen";
import { LoginService } from "@/service/LoginService";
import { Stack, useRouter } from "expo-router";
import * as SplashScreenNative from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Toast, { BaseToastProps, ErrorToast, InfoToast, SuccessToast } from "react-native-toast-message";

SplashScreenNative.preventAutoHideAsync();

const toastConfig = {
  success: (props: BaseToastProps) => (
    <SuccessToast
      {...props}
      style={{ borderLeftColor: "#4CAF50", height: 80, width: "94%" }}
      text1Style={{ fontSize: 17, fontWeight: "700" }}
      text2Style={{ fontSize: 15 }}
    />
  ),
  info: (props: BaseToastProps) => (
    <InfoToast
      {...props}
      style={{ borderLeftColor: "#007AFF", height: 80, width: "94%" }}
      text1Style={{ fontSize: 17, fontWeight: "700" }}
      text2Style={{ fontSize: 15 }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#FF3B30", height: 80, width: "94%" }}
      text1Style={{ fontSize: 17, fontWeight: "700" }}
      text2Style={{ fontSize: 15 }}
    />
  ),
};

export default function RootLayout() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState("Đang khởi động...");
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      const startTime = Date.now();
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

      try {
        setStatus("Kiểm tra phiên đăng nhập...");
        const loginService = LoginService.getInstance();
        
        // 1. Chạy song song: Check Auth và Chờ tối thiểu 5 giây (5000ms)
        const [isLoggedIn] = await Promise.all([
          loginService.checkAndRefreshToken(),
          delay(5000) 
        ]);

        // 2. Điều hướng dựa trên kết quả Auth
        if (isLoggedIn) {
          router.replace("/(main)/(tabs)/home");
        } else {
          router.replace("/(auth)/login");
        }

        await SplashScreenNative.hideAsync();
      } catch (e) {
        router.replace("/(auth)/login");
      } finally {
        // 3. Cho phép Splash chạy animation thoát
        setStatus("Sẵn sàng!");
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#1E3A8A" }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>

      {/* Hiển thị Splash Screen Layer */}
      {splashVisible && (
        <CustomSplashScreen 
          isReady={isReady} 
          statusText={status}
          onFinish={() => setSplashVisible(false)} 
        />
      )}

      <Toast config={toastConfig} position="top" topOffset={50} />
    </View>
  );
}