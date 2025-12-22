import BackHeader from "@/component/BackHeader";
import MainHeader from "@/component/MainHeader";
import { Colors } from "@/constant/Colors";
import { Avatars } from "@/public/img/avatar";
import { UserService } from "@/service/UserService";
import { Tabs } from "expo-router";
import { Home, MessageSquare, Plus, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";

const TabLayout = () => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const fetchUserData = async () => {
    const result = (await UserService.getInstance().getMe()) as any;
    const avatarUrl = result?.avatarUrl;
    setAvatar(avatarUrl);
    
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.blue[600],
        tabBarInactiveTintColor: Colors.gray[500],
        tabBarStyle: {
          backgroundColor: "#fff",
          height: Platform.OS === "ios" ? 88 : 100, // Chiều cao chuẩn hơn cho Mobile
          borderTopColor: "#eee",
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      {/* 🏠 Trang chủ */}
      <Tabs.Screen
        name="home/index"
        options={{
          header: () => <MainHeader />,
          title: "Trang chủ",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />

      {/* 👥 Bạn bè */}
      <Tabs.Screen
        name="friend/index"
        options={{
          header: () => <MainHeader />,
          title: "Bạn bè",
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
        }}
      />

      {/* ➕ Đăng bài (Floating Button) */}
      <Tabs.Screen
        name="post/index"
        options={{
          header: () => <BackHeader />,
          title: "",
          tabBarIcon: () => (
            <View style={styles.floatingButton}>
              <Plus color="white" size={30} strokeWidth={3} />
            </View>
          ),
        }}
      />

      {/* 💬 Tin nhắn */}
      <Tabs.Screen
        name="conversation/index"
        options={{
          header: () => <MainHeader />,
          title: "Tin nhắn",
          tabBarIcon: ({ color }) => (
            <View>
              <MessageSquare color={color} size={24} />
            </View>
          ),
        }}
      />

      {/* 👤 Cá nhân */}
      <Tabs.Screen
        name="profile/index"
        options={{
          header: () => <MainHeader />,
          title: "",
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

export default TabLayout;

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
    shadowColor: Colors.blue[900],
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#f0f0f0", // Hiện màu xám nhẹ khi đang load
  },
  avatarIcon: {
    width: "100%",
    height: "100%",
  },
});
