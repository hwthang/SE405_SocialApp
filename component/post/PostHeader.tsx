
import { getRelativeTimeFromISO } from "@/utils/date";
import { UserLock, Users, UserStar } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  author: {
    name: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
  privacy: "PUBLIC" | "FRIENDS" | "PRIVATE";
  canAddFriend?: boolean;
};

const PostHeader = ({
  author,
  createdAt,
  privacy,
  canAddFriend = false,
}: Props) => {
  const renderScope = () => {
    switch (privacy) {
      case "PUBLIC":
        return (
          <View style={styles.scopeContainer}>
            <Users size={15} />
            <Text style={styles.scopeText}>Công khai</Text>
          </View>
        );
      case "FRIENDS":
        return (
          <View style={styles.scopeContainer}>
            <UserStar size={15} />
            <Text style={styles.scopeText}>Bạn bè</Text>
          </View>
        );
      default:
        return (
          <View style={styles.scopeContainer}>
            <UserLock size={15} />
            <Text style={styles.scopeText}>Chỉ mình tôi</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri:
            author.avatarUrl ||
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(author.name),
        }}
        style={styles.avatar}
      />

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.fullName}>{author.name}</Text>

          {canAddFriend && (
            <TouchableOpacity style={styles.addFriendButton}>
              <Text style={styles.addFriendText}>Thêm bạn bè</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rowCenter}>
          <Text style={styles.timeText}>
            {getRelativeTimeFromISO(createdAt)}
          </Text>
          {renderScope()}
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
