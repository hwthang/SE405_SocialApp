import { Colors } from "@/constant/Colors";
import { Avatars } from "@/public/img/avatar";
import React, { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import TagChips from "./TagChip";

// === Mock data cho Friend Invitations ===
const FriendInvitations = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    avatar: Avatars.cat,
    mutualFriends: 3,
    nearby: true,
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    avatar: Avatars.cat,
    mutualFriends: 0,
    nearby: true,
  },
  {
    id: 3,
    name: "Lê Minh Đức",
    avatar: Avatars.cat,
    mutualFriends: 1,
    nearby: false,
  },
  {
    id: 4,
    name: "Hoàng Thu Hà",
    avatar: Avatars.cat,
    mutualFriends: 0,
    nearby: false,
  },
  {
    id: 5,
    name: "Phạm Nhật Huy",
    avatar: Avatars.cat,
    mutualFriends: 2,
    nearby: true,
  },
  {
    id: 6,
    name: "Đỗ Khánh Linh",
    avatar: Avatars.cat,
    mutualFriends: 0,
    nearby: true,
  },
];

const FriendInvitationSection = () => {
  const [invitations, setInvitations] = useState(FriendInvitations);

  const acceptInvitation = (id: number) => {
    // Xử lý logic chấp nhận, ví dụ remove khỏi list
    setInvitations((prev) => prev.filter((item) => item.id !== id));
  };

  const declineInvitation = (id: number) => {
    // Xử lý logic từ chối, ví dụ remove khỏi list
    setInvitations((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 6 }}>
      <FlatList
        data={invitations}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }:{item:any}) => (
          <View
            style={{
              padding: 12,
              flexDirection: "row",
              backgroundColor: "white",
              borderRadius: 10,
              alignItems: "center",
              marginHorizontal: 10,
              borderWidth: 1,
              borderColor: "#eee",
              gap: 10,
            }}
          >
            {/* Avatar */}
            <Image
              source={ item.avatar }
              style={{ width: 50, height: 50, borderRadius: 999 }}
              resizeMode="cover"
            />

            {/* Info + Actions */}
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
                <View style={{ marginTop: 4 }}>
                  <TagChips
                    tags={[
                      ...(item.mutualFriends > 0
                        ? [{ key: "mutual_friends", value: "Có bạn chung" }]
                        : []),
                      ...(item.nearby ? [{ key: "nearby_location", value: "Gần bạn" }] : []),
                    ]}
                    maxDisplay={2}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "column", alignItems: "center", gap: 6 }}>
                <TouchableOpacity
                  onPress={() => acceptInvitation(item.id)}
                  style={{
                    height: 34,
                    paddingHorizontal: 14,
                    backgroundColor: Colors.blue[500],
                    borderRadius: 8,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 4,
                    width: 100,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 14 }}>Chấp nhận</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => declineInvitation(item.id)}
                  style={{
                    width: 100,
                    height: 34,
                    paddingHorizontal: 14,
                    borderColor: Colors.gray[500],
                    borderWidth: 1,
                    borderRadius: 8,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 4,
                  }}
                >
                  <Text style={{ color: "black", fontSize: 14 }}>Từ chối</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default FriendInvitationSection;
