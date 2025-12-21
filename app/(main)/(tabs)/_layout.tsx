import BackHeader from "@/component/BackHeader";
import MainHeader from "@/component/MainHeader";
import { Colors } from "@/constant/Colors";
import { Tabs } from "expo-router";
import {
  Bell,
  Home,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react-native";
import React from "react";
import { Platform, View } from "react-native";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.blue[600],
        tabBarInactiveTintColor: Colors.gray[500],
        tabBarStyle: {
          backgroundColor: "#fff",
          height: Platform.OS === 'ios' ? 90 : 100, // Điều chỉnh chiều cao phù hợp cho từng OS
          borderTopColor: "#eee",
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 25 : 12,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
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
          tabBarIcon: ({ color }) => (
            <Home color={color} size={24} />
          ),
        }}
      />

      {/* 👥 Bạn bè */}
      <Tabs.Screen
        name="friend/index"
        options={{
          header: () => <MainHeader />,
          title: "Bạn bè",
          tabBarIcon: ({ color }) => (
            <Users color={color} size={24} />
          ),
        }}
      />

      {/* ➕ Đăng bài (Floating Button) */}
      <Tabs.Screen
        name="post/index"
        options={{
          header: () => <BackHeader />,
          title: "", // Để trống title cho nút giữa
          tabBarIcon: () => (
            <View
              style={{
                position: "absolute",
                top: -20, // Đẩy nút lên trên thanh tab
                backgroundColor: Colors.blue[500],
                borderRadius: 30,
                width: 56,
                height: 56,
                justifyContent: "center",
                alignItems: "center",
                elevation: 5,
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 5,
              }}
            >
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
              {/* Badge số tin nhắn chưa đọc (nếu cần) */}
            </View>
          ),
        }}
      />

      {/* 👤 Hồ sơ (Sử dụng route profile/index làm tab cuối thay vì notification) */}
      <Tabs.Screen
        name="profile/index"
        options={{
          header: () => <MainHeader />,
          title: "Hồ sơ",
          tabBarIcon: ({ color }) => (
            <Bell color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;