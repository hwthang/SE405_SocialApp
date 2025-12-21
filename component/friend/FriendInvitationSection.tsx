import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { Colors } from "@/constant/Colors";
import SocketHelper from "@/helper/SocketHelper"; // 1. Import SocketHelper
import { Avatars } from "@/public/img/avatar";
import { FriendService } from "@/service/FriendService";
import TagChips from "./TagChip";

const FriendInvitationSection = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  
  const friendService = FriendService.getInstance();

  // 1. Logic tải danh sách lời mời
  const fetchInvitations = useCallback(async (isSilent = false) => {
    try {
      // Nếu là silent fetch (từ socket), không hiện màn hình loading lớn
      if (!isSilent) setLoading(true);
      
      const data = await friendService.fetchReceivedRequests();

      const formattedData = data.map((item: any) => ({
        id: item.id,
        fromId: item.fromUserId,
        name: item.fromUser?.name || "Người dùng lạ",
        avatar: item.fromUser?.avatarUrl ? { uri: item.fromUser.avatarUrl } : Avatars.cat,
        mutualFriends: item.mutualFriendsCount || 0,
        nearby: item.isNearby || false,
      }));
      
      setInvitations(formattedData);
    } catch (error) {
      console.error("Lỗi khi tải lời mời:", error);
      if (!isSilent) {
        Toast.show({ type: "error", text1: "Lỗi", text2: "Không thể tải danh sách lời mời" });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 2. useEffect Khởi tạo dữ liệu & Đăng ký Socket
  useEffect(() => {
    fetchInvitations();

    // 2. Định nghĩa hàm xử lý khi nhận socket thông báo lời mời mới
    const handleSocketNotification = (data: any) => {
      // Dựa trên type payload bạn đã đề cập: FRIEND_REQUEST_RECEIVED
      if (data.type === "FRIEND_REQUEST_RECEIVED") {
        console.log("🔄 [Socket] Nhận lời mời kết bạn mới, đang cập nhật danh sách...");
        fetchInvitations(true); // Fetch lại ngầm (silent) để trải nghiệm mượt mà
      }
    };

    // 3. Lắng nghe qua SocketHelper
    SocketHelper.onNewNotification(handleSocketNotification);

    // 4. Cleanup: Huỷ lắng nghe khi rời khỏi màn hình
    return () => {
      SocketHelper.removeListener("notification:new", handleSocketNotification);
    };
  }, [fetchInvitations]);

  // --- Giữ nguyên các hàm onAction, confirmDecline và Render bên dưới ---
  
  const onAction = async (id: string, fromId: string, action: "accept" | "reject") => {
    if (processingIds.includes(id)) return;
    try {
      setProcessingIds((prev) => [...prev, id]);
      const result = await friendService.handleFriendRequest(id, action);
      if (!result.error) {
        const targetUser = invitations.find((item) => item.id === id);
        if (action === "accept") {
          Toast.show({ type: "success", text1: "🎉 +1 bạn bè nhó", text2: `${targetUser?.name} đã trở thành bạn bè` });
          await friendService.createDirectConversation(fromId);
        }
        setInvitations((prev) => prev.filter((item) => item.id !== id));
      } else {
        throw new Error(result.message || "Thao tác thất bại");
      }
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Thất bại", text2: error.message || "Không thể thực hiện thao tác" });
    } finally {
      setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  const confirmDecline = (id: string, name: string) => {
    Alert.alert("Xác nhận gỡ", `Bạn muốn xóa lời mời từ ${name}?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => onAction(id, "", "reject") },
    ]);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.blue[500]} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={invitations}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              setRefreshing(true);
              fetchInvitations(true);
            }} 
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Hiện không có lời mời nào</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isProcessing = processingIds.includes(item.id);
          return (
            <View style={styles.card}>
              <Image source={item.avatar} style={styles.avatar} />
              <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <TagChips
                  tags={[
                    ...(item.mutualFriends > 0 ? [{ key: "mutual", value: `${item.mutualFriends} bạn chung` }] : []),
                    ...(item.nearby ? [{ key: "nearby", value: "Gần bạn" }] : []),
                  ]}
                  maxDisplay={2}
                />
                <View style={styles.btnGroup}>
                  <TouchableOpacity 
                    disabled={isProcessing} 
                    onPress={() => onAction(item.id, item.fromId, "accept")} 
                    style={[styles.btn, styles.btnAccept]}
                  >
                    {isProcessing ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.textAccept}>Chấp nhận</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    disabled={isProcessing} 
                    onPress={() => confirmDecline(item.id, item.name)} 
                    style={[styles.btn, styles.btnReject]}
                  >
                    <Text style={styles.textReject}>Xóa</Text>
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

// ... Styles giữ nguyên ...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 50 },
    listContent: { paddingVertical: 10, paddingBottom: 20, gap: 12 },
    card: { padding: 12, flexDirection: "row", backgroundColor: "white", borderRadius: 12, marginHorizontal: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#eee" },
    infoContainer: { flex: 1, marginLeft: 12, justifyContent: "center" },
    name: { fontSize: 16, fontWeight: "700", color: "#1C1E21", marginBottom: 4 },
    btnGroup: { flexDirection: "row", gap: 8, marginTop: 10 },
    btn: { flex: 1, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center" },
    btnAccept: { backgroundColor: Colors.blue[500] },
    btnReject: { backgroundColor: "#E4E6EB" },
    textAccept: { color: "white", fontWeight: "600", fontSize: 14 },
    textReject: { color: "#050505", fontWeight: "600", fontSize: 14 },
    emptyText: { color: "#888", fontSize: 14 }
});

export default FriendInvitationSection;