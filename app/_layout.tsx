import { LoginService } from "@/service/LoginService"; // Import Service mới
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
import Toast from "react-native-toast-message";

const { height } = Dimensions.get("window");
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation nhịp tim
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

        // Thực hiện check token thực tế từ Server
        const isLoggedIn = await loginService.checkAndRefreshToken();

        // Đảm bảo splash hiện ít nhất 2s cho đẹp
        await new Promise((resolve) => setTimeout(resolve, 4000));

        if (isLoggedIn) {
          router.replace("/(main)/(tabs)/home");
        } else {
          router.replace("/(auth)/login");
        }

        await SplashScreen.hideAsync();
      } catch (e) {
        router.replace("/(auth)/login");
      } finally {
        // Chạy hiệu ứng trượt lên khi mọi thứ xong xuôi
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -height,
            duration: 600,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 600,
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

      <Toast position="top" topOffset={50} />
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
  },
});
