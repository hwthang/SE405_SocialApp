import { AlertCircle, CheckCircle2, Trash2 } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { Avatars } from "@/public/img/avatar";
import { FriendService } from "@/service/FriendService";
import TagChips from "./TagChip";

const FriendInvitationSection = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  // --- Alert State ---
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ visible: false, type: "success", title: "", message: "" });

  const friendService = FriendService.getInstance();

  const showAlert = (type: "success" | "error" | "warning", title: string, message: string, onConfirm?: () => void) => {
    setAlertConfig({ visible: true, type, title, message, onConfirm });
  };

  const fetchInvitations = useCallback(async (isSilent = false) => {
    try {
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
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const onAction = async (id: string, fromId: string, action: "accept" | "reject") => {
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

      if (!result.error) {
        const targetUser = invitations.find((item) => item.id === id);
        
        if (action === "accept") {
          // Hiện Alert thành công khi chấp nhận
          showAlert("success", "Thành công", `Bạn và ${targetUser?.name} đã trở thành bạn bè.`);
          
          // Tạo chat ngầm
          fetch(`${Api.getInstance().baseUrl}/conversations`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ type: "DIRECT", otherUserId: fromId }),
          }).catch(() => {});
        } else {
          // Nếu reject từ nút confirm của Alert Warning thì danh sách sẽ update
        }
        setInvitations((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      showAlert("error", "Thất bại", "Không thể thực hiện yêu cầu. Vui lòng thử lại.");
    } finally {
      setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  if (loading)
    return (
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchInvitations(true)} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Hiện không có lời mời nào</Text>
          </View>
        }
        renderItem={({ item }) => (
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
                  disabled={processingIds.includes(item.id)}
                  onPress={() => onAction(item.id, item.fromId, "accept")}
                  style={[styles.btn, styles.btnAccept]}
                >
                  {processingIds.includes(item.id) ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.textAccept}>Chấp nhận</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={processingIds.includes(item.id)}
                  onPress={() => showAlert("warning", "Gỡ lời mời?", `Bạn muốn xóa lời mời từ ${item.name}?`, () => onAction(item.id, "", "reject"))}
                  style={[styles.btn, styles.btnReject]}
                >
                  <Text style={styles.textReject}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* --- CUSTOM BEAUTIFUL ALERT MODAL --- */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[styles.alertIconCircle, { 
                backgroundColor: alertConfig.type === "success" ? "#ECFDF5" : alertConfig.type === "warning" ? "#FFFBEB" : "#FEF2F2" 
            }]}>
              {alertConfig.type === "success" && <CheckCircle2 size={32} color="#10B981" />}
              {alertConfig.type === "warning" && <Trash2 size={32} color="#F59E0B" />}
              {alertConfig.type === "error" && <AlertCircle size={32} color="#EF4444" />}
            </View>
            
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            
            <View style={styles.alertActionRow}>
              {alertConfig.type === 'warning' && (
                <TouchableOpacity 
                  style={[styles.alertBtnBase, styles.btnCancel]} 
                  onPress={() => setAlertConfig({ ...alertConfig, visible: false })}
                >
                  <Text style={styles.btnTextCancel}>Hủy</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.alertBtnBase, { backgroundColor: alertConfig.type === "success" ? "#10B981" : alertConfig.type === "warning" ? "#F59E0B" : "#EF4444" }]}
                onPress={() => {
                  setAlertConfig({ ...alertConfig, visible: false });
                  if (alertConfig.onConfirm) alertConfig.onConfirm();
                }}
              >
                <Text style={styles.alertBtnText}>
                  {alertConfig.type === 'warning' ? 'Xác nhận xóa' : 'Đóng'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 50 },
  listContent: { paddingVertical: 12, gap: 12 },
  card: {
    padding: 12,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: { width: 74, height: 74, borderRadius: 37, backgroundColor: "#eee" },
  infoContainer: { flex: 1, marginLeft: 12, justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "700", color: "#050505", marginBottom: 2 },
  btnGroup: { flexDirection: "row", gap: 8, marginTop: 10 },
  btn: { flex: 1, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  btnAccept: { backgroundColor: Colors.blue[500] },
  btnReject: { backgroundColor: "#E4E6EB" },
  textAccept: { color: "white", fontWeight: "700", fontSize: 14 },
  textReject: { color: "#050505", fontWeight: "700", fontSize: 14 },
  emptyText: { color: "#65676B", fontSize: 14, fontWeight: '500' },

  // --- Alert Style ---
  alertOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  alertBox: { backgroundColor: "#FFF", width: "85%", borderRadius: 28, padding: 24, alignItems: "center" },
  alertIconCircle: { width: 68, height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  alertTitle: { fontSize: 20, fontWeight: "800", color: "#1F2937", marginBottom: 8 },
  alertMessage: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  alertActionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  alertBtnBase: { flex: 1, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  btnCancel: { backgroundColor: '#F3F4F6' },
  btnTextCancel: { color: '#4B5563', fontWeight: '700' },
  alertBtnText: { color: "#FFF", fontWeight: "700" },
});

export default FriendInvitationSection;