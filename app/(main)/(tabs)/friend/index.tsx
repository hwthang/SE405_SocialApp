import FriendInvitationSection from "@/component/friend/FriendInvitationSection";
import FriendListSection from "@/component/friend/FriendListSection";
import { useLocalSearchParams } from "expo-router";
import { BellPlus, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const tabs = [
  { label: "Bạn bè", icon: Users },
  { label: "Lời mời", icon: BellPlus },
];

const FriendScreen = () => {
  const params = useLocalSearchParams();
  // Khởi tạo tab: Nếu url có ?tab=invitation thì mở tab 1, ngược lại tab 0
  const [isActive, setIsActive] = useState(params.tab === "invitation" ? 1 : 0);
  const [hasNewInvite, setHasNewInvite] = useState(false);

  // Cập nhật tab khi params thay đổi (Ví dụ đang ở màn hình này mà nhấn Toast)
  useEffect(() => {
    if (params.tab === "invitation") {
      setIsActive(1);
      setHasNewInvite(false);
    }
  }, [params.tab]);

  // ================= 1. THIẾT LẬP SOCKET LISTENERS =================

  return (
    <View style={styles.container}>
      {/* Tabs Layout */}
      <View style={styles.tabContainer}>
        {tabs.map((item, index) => {
          const IconComponent = item.icon;
          const active = isActive === index;
          const showBadge = index === 1 && hasNewInvite;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => {
                setIsActive(index);
                if (index === 1) setHasNewInvite(false);
              }}
            >
              <View style={styles.iconWrapper}>
                <IconComponent
                  size={18}
                  color={active ? "#fff" : "#333"}
                  strokeWidth={2}
                />
                {showBadge && <View style={styles.badge} />}
              </View>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content Render */}
      <View style={{ flex: 1 }}>
        {isActive === 0 ? <FriendListSection /> : <FriendInvitationSection />}
      </View>
    </View>
  );
};

export default FriendScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "white",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    paddingHorizontal: 16,
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
    fontSize: 14,
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  iconWrapper: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    borderWidth: 1,
    borderColor: "white",
  },
});