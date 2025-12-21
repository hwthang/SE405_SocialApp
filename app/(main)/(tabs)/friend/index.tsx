import FriendInvitationSection from "@/component/friend/FriendInviteSection";
import FriendListSection from "@/component/friend/FriendListSection";
import FriendSuggestionSection from "@/component/friend/FriendSuggestionSection";
import SocketHelper from "@/helper/SocketHelper"; // <--- Import SocketHelper
import { BellPlus, UserPlus, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

const tabs = [
  { label: "Bạn bè", icon: Users },
  { label: "Gợi ý", icon: UserPlus },
  { label: "Lời mời", icon: BellPlus },
];

const FriendScreen = () => {
  const [isActive, setIsActive] = useState(0);

  // ================= 1. THIẾT LẬP SOCKET LISTENERS =================
  useEffect(() => {
    // Đảm bảo socket đã được kết nối (Hàm connect này bạn đã gọi ở Home hoặc App Root)
    // SocketHelper.connect(); 

    console.log("🔌 [FriendScreen] Socket listener initialized");

    SocketHelper.onNewNotification((data) => {
      console.log("📩 [FriendScreen] Socket Received Data:", data);

      // Xử lý các loại thông báo liên quan đến bạn bè
      switch (data.type) {
        case "FRIEND_REQUEST":
          Toast.show({
            type: "info",
            text1: "Lời mời kết bạn",
            text2: data.payload?.senderName || "Ai đó đã gửi lời mời kết bạn cho bạn",
            onPress: () => {
              setIsActive(2); // Chuyển sang Tab Lời mời khi nhấn vào Toast
              Toast.hide();
            }
          });
          break;

        case "FRIEND_ACCEPT":
          Toast.show({
            type: "success",
            text1: "Kết bạn thành công",
            text2: "Bạn và đối phương đã trở thành bạn bè",
          });
          // Có thể fetch lại danh sách bạn bè tại đây nếu cần
          break;

        default:
          console.log("ℹ️ Thông báo loại khác:", data.type);
      }
    });

    // Clean up khi rời màn hình
    return () => {
      console.log("🔌 [FriendScreen] Removing socket listener");
      SocketHelper.removeListener("notification:new");
    };
  }, []);

  return (
    <View
      style={{
        borderWidth: 0,
        marginBottom: 100,
        paddingBottom: 20,
        display: "flex",
        flex: 1,
        paddingTop: 10,
        backgroundColor: "white",
      }}
    >
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((item, index) => {
          const IconComponent = item.icon;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.tabItem,
                isActive === index && styles.tabItemActive,
              ]}
              onPress={() => setIsActive(index)}
            >
              <IconComponent
                size={18}
                color={isActive === index ? "#fff" : "#333"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  isActive === index && styles.tabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {/* Lưu ý: Nếu bạn muốn dữ liệu tự động load lại khi có socket, 
         bạn có thể truyền một state "refreshTrigger" hoặc gọi hàm fetch 
         bên trong các Section này thông qua Ref/Context.
      */}
      {isActive === 0 && <FriendListSection />}
      {isActive === 1 && <FriendSuggestionSection />}
      {isActive === 2 && <FriendInvitationSection />}
    </View>
  );
};

export default FriendScreen;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    paddingHorizontal: 16,
    borderWidth: 0
  },
  tabItem: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  tabText: {
    color: "#333",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});