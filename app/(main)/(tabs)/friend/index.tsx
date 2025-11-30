import FriendInvitationSection from "@/component/friend/FriendInviteSection";
import FriendListSection from "@/component/friend/FriendListSection";
import FriendSuggestionSection from "@/component/friend/FriendSuggestionSection";
import { BellPlus, UserPlus, Users } from "lucide-react-native"; // <--- ICONS
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const tabs = [
  { label: "Bạn bè", icon: Users },
  { label: "Gợi ý", icon: UserPlus },
  { label: "Lời mời", icon: BellPlus },
];

const FriendScreen = () => {
  const [isActive, setIsActive] = useState(0);

  return (
    <View style={{ borderWidth: 1, marginBottom: 100, paddingBottom: 20, display:'flex', flex:1, marginTop:10 }}>
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
