import MainHeader from "@/component/MainHeader";
import { Colors } from "@/constant/Colors";
import { Avatars } from "@/public/img/avatar";
import { UserService } from "@/service/UserService";
import { Tabs } from "expo-router";
import { Home, MessageSquare, Plus, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  DeviceEventEmitter,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native"; // 🔥 Thêm DeviceEventEmitter

const TabLayout = () => {
  const [avatar, setAvatar] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const result = (await UserService.getInstance().getMe()) as any;
      if (result?.avatarUrl) {
        setAvatar(result.avatarUrl);
      }
    } catch (error) {
      console.error("Fetch Tab Avatar error:", error);
    }
  };

  useEffect(() => {
    fetchUserData();

    // 🔥 LẮNG NGHE SỰ KIỆN CẬP NHẬT TỪ EDIT PROFILE
    const subscription = DeviceEventEmitter.addListener(
      "userProfileUpdated",
      () => {
        fetchUserData();
      }
    );

    return () => {
      subscription.remove(); // Hủy lắng nghe khi component unmount
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.blue[600],
        tabBarInactiveTintColor: Colors.gray[500],
        tabBarStyle: {
          backgroundColor: "#fff",
          height: Platform.OS === "ios" ? 88 : 100,
          borderTopColor: "#eee",
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          elevation: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          header: () => <MainHeader />,
          title: "Trang chủ",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="friend/index"
        options={{
          header: () => <MainHeader />,
          title: "Bạn bè",
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="post/index"
        options={{
          headerShown: false,
          title: "",
          tabBarIcon: () => (
            <View style={styles.floatingButton}>
              <Plus color="white" size={30} strokeWidth={3} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="conversation/index"
        options={{
          header: () => <MainHeader />,
          title: "Tin nhắn",
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          header: () => <MainHeader />,
          title: "Cá nhân",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.avatarContainer,
                focused && { borderColor: color },
              ]}
            >
              <Image
                source={avatar ? { uri: avatar } : Avatars.cat}
                style={styles.avatarIcon}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    top: -22,
    backgroundColor: Colors.blue[500],
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 32, // Thu nhỏ lại một chút cho cân đối tab bar
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  avatarIcon: { width: "100%", height: "100%" },
});

export default TabLayout;
