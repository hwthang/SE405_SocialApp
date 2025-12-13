import { getRelativeTimeFromISO } from "@/utils/date";
import { UserLock, Users, UserStar } from "lucide-react-native";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const data = {
  avatarUrl:
    "https://res.cloudinary.com/diz9pqlzo/image/upload/v1765016620/481464988_1675623343373213_3008382985378437814_n_rpewet.jpg",
  fullName: "Đặng Hữu Thắng",
  postedAt: "2025-12-01T14:32:45.140+00:00",
  scope: "public", // friend, private
  canAddFriend: true,
};

const PostHeader = () => {
  const renderScope = (scope: string) => {
    switch (scope) {
      case "public":
        return (
          <View style={styles.scopeContainer}>
            <Users strokeWidth={1.75} size={15} />
            <Text style={styles.scopeText}>Công khai</Text>
          </View>
        );
      case "friend":
        return (
          <View style={styles.scopeContainer}>
            <UserStar strokeWidth={2} size={15} />
            <Text style={styles.scopeText}>Bạn bè</Text>
          </View>
        );
      default:
        return (
          <View style={styles.scopeContainer}>
            <UserLock strokeWidth={2} size={15} />
            <Text style={styles.scopeText}>Chỉ mình tôi</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <Image source={{ uri: data.avatarUrl }} style={styles.avatar} />

      {/* Info */}
      <View style={styles.info}>
        {/* Hàng trên: tên + nút thêm bạn */}
        <View style={styles.topRow}>
          <Text style={styles.fullName}>{data.fullName}</Text>

          {data.canAddFriend && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.addFriendButton}
              // onPress={() => {}}
            >
              <Text style={styles.addFriendText}>Thêm bạn bè</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hàng dưới: thời gian + scope */}
        <View style={styles.rowCenter}>
          <Text style={styles.timeText}>
            {getRelativeTimeFromISO(data.postedAt)}
          </Text>
          {renderScope(data.scope)}
        </View>
      </View>
    </View>
  );
};

export default PostHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 999,
  },

  info: {
    flex: 1,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  fullName: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },

  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },

  timeText: {
    fontSize: 13,
    color: "#666",
  },

  scopeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  scopeText: {
    fontSize: 13,
    color: "#666",
  },

  addFriendButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1877F2",
  },

  addFriendText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1877F2",
  },
});
