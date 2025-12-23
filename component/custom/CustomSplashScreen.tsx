import { LinearGradient } from "expo-linear-gradient";
import { Waypoints as WaypointsIcon } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text
} from "react-native";

const { height } = Dimensions.get("window");

interface Props {
  isReady: boolean;    // Khi xong việc (Socket connect) thì truyền true
  statusText?: string; // Chữ hiển thị tiến trình
  onFinish: () => void; // Gọi sau khi animation trượt lên kết thúc
}

const CustomSplashScreen = ({ isReady, statusText, onFinish }: Props) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Hiệu ứng nhịp tim (Pulse) chạy liên tục
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();

    // 2. Lắng nghe khi isReady = true thì chạy hiệu ứng thoát
    if (isReady) {
      pulse.stop();
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
      ]).start(() => onFinish());
    }

    return () => pulse.stop();
  }, [isReady]);

  return (
    <Animated.View 
      style={[
        styles.overlay, 
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <LinearGradient colors={["#1D4ED8", "#1E3A8A"]} style={StyleSheet.absoluteFill} />
      
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <WaypointsIcon size={100} color="#FFFFFF" strokeWidth={1.5} />
      </Animated.View>

      <Text style={styles.appName}>WAYPOINTS SOCIAL</Text>
      
      <Text style={styles.statusText}>{statusText || "Đang khởi tạo..."}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 20,
    letterSpacing: 4,
  },
  statusText: {
    position: "absolute",
    bottom: 60,
    color: "#BFDBFE",
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "500",
  },
});

export default CustomSplashScreen;