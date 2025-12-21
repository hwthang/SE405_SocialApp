import BackHeader from "@/component/BackHeader";
import MainHeader from "@/component/MainHeader";
import { Colors } from "@/constant/Colors";
import { AuthHelper } from "@/helper/AuthHelper";
import { router, Tabs } from "expo-router";
import {
  BarChart3,
  Bell,
  Home,
  Layers,
  MessageSquare,
  Plus,
  User,
  Users,
} from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const TabLayout = () => {
  const isAdmin = AuthHelper.getInstance().getIsAdmin();
  return (
    <Tabs
      screenOptions={{
        // tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 100,
          borderTopColor: "#eee",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingTop: 6,
          elevation: 10,
        },
      }}
    >
      {/* 🏠 Home */}
      <Tabs.Protected guard={!isAdmin}>
        <Tabs.Screen
          name="home/index"
          options={{
            header: () => <MainHeader />,
            title: "Trang chủ",
            tabBarIcon: ({ focused }) => (
              <Home
                color={focused ? Colors.blue[600] : Colors.gray[500]}
                size={26}
              />
            ),
          }}
        />
      </Tabs.Protected>

      {/* 👥 Friend */}
      <Tabs.Protected guard={!isAdmin}>
        <Tabs.Screen
          name="friend/index"
          options={{
            header: () => <MainHeader />,
            title: "Bạn bè",
            tabBarIcon: ({ focused }) => (
              <TouchableOpacity
                onPress={() => router.replace("/(main)/(tabs)/friend")}
              >
                <Users
                  color={focused ? Colors.blue[600] : Colors.gray[500]}
                  size={26}
                />
              </TouchableOpacity>
            ),
          }}
        />
      </Tabs.Protected>

      {/* ➕ Post - Floating Button */}
      <Tabs.Protected guard={!isAdmin}>
        <Tabs.Screen
          name="post/index"
          options={{
            header: () => <BackHeader />,
            title: "",
            tabBarIcon: () => (
              <View
                style={{
                  position: "absolute",
                  top: -30,
                  backgroundColor: Colors.blue[500],
                  borderRadius: 40,
                  width: 60,
                  height: 60,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 8,
                }}
              >
                <Plus color="white" size={32} strokeWidth={3} />
              </View>
            ),
          }}
        />
      </Tabs.Protected>

      {/* 👤 Account */}
      <Tabs.Protected guard={isAdmin}>
        <Tabs.Screen
          name="account/index"
          options={{
            title: "Tài khoản",
            tabBarIcon: ({ focused }) => (
              <User
                color={focused ? Colors.blue[600] : Colors.gray[500]}
                size={26}
              />
            ),
          }}
        />
      </Tabs.Protected>

      {/* 🧩 Plan */}
      <Tabs.Protected guard={isAdmin}>
        <Tabs.Screen
          name="plan/index"
          options={{
            title: "Gói dịch vụ",
            tabBarIcon: ({ focused }) => (
              <Layers
                color={focused ? Colors.blue[600] : Colors.gray[500]}
                size={26}
              />
            ),
          }}
        />
      </Tabs.Protected>

      {/* 📊 Statistic */}
      <Tabs.Protected guard={isAdmin}>
        <Tabs.Screen
          name="statistic/index"
          options={{
            title: "Thống kê",
            tabBarIcon: ({ focused }) => (
              <BarChart3
                color={focused ? Colors.blue[600] : Colors.gray[500]}
                size={26}
              />
            ),
          }}
        />
      </Tabs.Protected>

      {/* 💬 Conversation */}
      <Tabs.Protected guard={true}>
        <Tabs.Screen
          name="conversation/index"
          options={{
            header: () => <MainHeader />,
            title: "Tin nhắn",
            tabBarIcon: ({ focused }) => (
              <View>
                <MessageSquare
                  color={focused ? Colors.blue[600] : Colors.gray[500]}
                  size={26}
                />
                {/* <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -4,
                    backgroundColor: Colors.red[500],
                    borderRadius: 8,
                    width: 16,
                    height: 16,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 10, fontWeight: "600" }}
                  >
                    2
                  </Text>
                </View> */}
              </View>
            ),
          }}
        />
      </Tabs.Protected>

      {/* 🔔 Notification */}
      <Tabs.Protected guard={true}>
        <Tabs.Screen
          name="notification/index"
          options={{
            title: "Thông báo",
            tabBarIcon: ({ focused }) => (
              <View>
                <Bell
                  color={focused ? Colors.blue[600] : Colors.gray[500]}
                  size={26}
                />
                {/* <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -4,
                    backgroundColor: Colors.red[500],
                    borderRadius: 8,
                    width: 16,
                    height: 16,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 10, fontWeight: "600" }}
                  >
                    3
                  </Text>
                </View> */}
              </View>
            ),
          }}
        />
      </Tabs.Protected>
    </Tabs>
  );
};

export default TabLayout;
