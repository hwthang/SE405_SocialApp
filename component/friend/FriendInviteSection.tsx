import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { Avatars } from "@/public/img/avatar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert, // Thêm Alert từ react-native
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import TagChips from "./TagChip";

const FriendInvitationSection = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const token = await AuthHelper.getInstance().getAccessToken();
      const response = await fetch(
        `${Api.getInstance().baseUrl}/friends/requests/received`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();

      if (result.data) {
        const formattedData = result.data.map((item: any) => ({
          id: item.id,
          name: item.fromUser?.name || "Người dùng lạ",
          avatar: item.fromUser?.avatarUrl
            ? { uri: item.fromUser.avatarUrl }
            : Avatars.cat,
          mutualFriends: item.mutualFriendsCount || 0,
          nearby: item.isNearby || false,
        }));
        setInvitations(formattedData);
      }
    } catch (error) {
      console.error("Lỗi khi tải lời mời:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleFriendRequest = async (id: string, action: "accept" | "reject") => {
    if (processingIds.includes(id)) return;

    try {
      setProcessingIds((prev) => [...prev, id]);
      const token = await AuthHelper.getInstance().getAccessToken();
      const response = await fetch(
        `${Api.getInstance().baseUrl}/friends/requests/${id}/${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && !result.error) {
        const targetUser = invitations.find((item) => item.id === id);
        
        if (action === "accept") {
          Toast.show({
            type: "success",
            text1: "🎉 +1 bạn bè nhó",
            text2: `${targetUser?.name} đã trở thành bạn bè`,
          });
        }
        // Xóa khỏi danh sách UI
        setInvitations((prev) => prev.filter((item) => item.id !== id));
      } else {
        throw new Error(result.message || "Thao tác thất bại");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi hệ thống",
        text2: "Không thể xử lý yêu cầu",
      });
    } finally {
      setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  // Hàm xử lý riêng khi nhấn nút Xóa
  const confirmDecline = (id: string, name: string) => {
    Alert.alert(
      "Xác nhận gỡ",
      `Bạn có chắc chắn muốn xóa lời mời kết bạn từ ${name} không?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive", 
          onPress: () => handleFriendRequest(id, "reject") 
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.blue[500]} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <FlatList
        data={invitations}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 10, gap: 12 }}
        renderItem={({ item }) => {
          const isProcessing = processingIds.includes(item.id);

          return (
            <View
              style={{
                padding: 12,
                flexDirection: "row",
                backgroundColor: "white",
                borderRadius: 12,
                alignItems: "center",
                marginHorizontal: 16,
                elevation: 1,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
              }}
            >
              <Image
                source={item.avatar}
                style={{ width: 70, height: 70, borderRadius: 35 }}
                resizeMode="cover"
              />

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#1C1E21" }}>
                    {item.name}
                  </Text>
                  <View style={{ marginTop: 2 }}>
                    <TagChips
                      tags={[
                        ...(item.mutualFriends > 0
                          ? [{ key: "mutual", value: `${item.mutualFriends} bạn chung` }]
                          : []),
                        ...(item.nearby ? [{ key: "nearby", value: "Gần bạn" }] : []),
                      ]}
                      maxDisplay={2}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    disabled={isProcessing}
                    onPress={() => handleFriendRequest(item.id, "accept")}
                    style={{
                      flex: 1,
                      height: 36,
                      backgroundColor: Colors.blue[500],
                      borderRadius: 8,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
                        Chấp nhận
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={isProcessing}
                    onPress={() => confirmDecline(item.id, item.name)} // Gọi Alert xác nhận
                    style={{
                      flex: 1,
                      height: 36,
                      backgroundColor: "#E4E6EB",
                      borderRadius: 8,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#050505", fontSize: 14, fontWeight: "600" }}>
                      Xóa
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default FriendInvitationSection;