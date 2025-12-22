import { LoginService } from "@/service/LoginService";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Waypoints as WaypointsIcon } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast, {
  BaseToastProps,
  ErrorToast,
  InfoToast,
  SuccessToast,
} from "react-native-toast-message";

const { height } = Dimensions.get("window");
SplashScreen.preventAutoHideAsync();

/* =======================================================
    TOAST CONFIGURATION
   ======================================================= */
const toastConfig = {
  success: (props: BaseToastProps) => (
    <SuccessToast
      {...props}
      style={{ borderLeftColor: "#4CAF50", height: 80, width: "94%" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 17, fontWeight: "700", color: "#1a1a1a" }}
      text2Style={{ fontSize: 15, color: "#444" }}
      text2NumberOfLines={2}
    />
  ),
  info: (props: BaseToastProps) => (
    <InfoToast
      {...props}
      style={{ borderLeftColor: "#007AFF", height: 80, width: "94%" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 17, fontWeight: "700" }}
      text2Style={{ fontSize: 15 }}
      text2NumberOfLines={2}
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

/* =======================================================
    ROOT LAYOUT COMPONENT
   ======================================================= */
export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hiệu ứng nhịp tim logo
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    async function prepare() {
      try {
        const loginService = LoginService.getInstance();

        // 1. Kiểm tra Token thực tế
        const isLoggedIn = await loginService.checkAndRefreshToken();

        // 2. Chờ để hiển thị thương hiệu
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // 3. Điều hướng ngầm
        if (isLoggedIn) {
          router.replace("/(main)/(tabs)/home");
        } else {
          router.replace("/(auth)/login");
        }

        await SplashScreen.hideAsync();
      } catch (e) {
        router.replace("/(auth)/login");
      } finally {
        // 4. Chạy hiệu ứng trượt lên và mờ dần
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -height,
            duration: 800,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => setAppIsReady(true));
      }
    }

    prepare();
    return () => pulse.stop();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#1E3A8A" }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>

      {/* Splash Screen Layer */}
      {!appIsReady && (
        <Animated.View
          style={[
            styles.splashOverlay,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={["#1D4ED8", "#1E3A8A"]}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <WaypointsIcon size={100} color="#FFFFFF" strokeWidth={1.5} />
          </Animated.View>
          <Text style={styles.loadingText}>WAYPOINTS SOCIAL</Text>
        </Animated.View>
      )}

      {/* Toast Layer - Đã thêm config trở lại */}
      <Toast 
        config={toastConfig} 
        position="top" 
        topOffset={50} 
        visibilityTime={4000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingText: {
    position: "absolute",
    bottom: 80,
    color: "#BFDBFE",
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: "600",
  },
});