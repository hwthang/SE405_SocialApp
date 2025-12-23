import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { Avatars } from "@/public/img/avatar";
import { router } from "expo-router";
import { MapPin, Send, UserPlus, UserX } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import TagChips from "./TagChip";

const FriendListSection = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States cho Kết bạn nhanh
  const [friendIdInput, setFriendIdInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const token = await AuthHelper.getInstance().getAccessToken();
      const response = await fetch(`${Api.getInstance().baseUrl}/friends`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (result.data) {
        const formattedFriends = result.data.map((item: any) => ({
          id: item.friendId,
          name: item.name,
          avatar: item.avatarUrl ? { uri: item.avatarUrl } : Avatars.cat,
          status: item.isOnline ? "online" : "offline",
        }));
        setFriends(formattedFriends);
      }
    } catch (error) {
      console.error("Lỗi fetchFriends:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // --- LOGIC KẾT BẠN NHANH ---
  const handleSendRequest = async () => {
    const data = friendIdInput.trim();
    if (!data) return;

    setIsSending(true);
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      const response = await fetch(
        `${Api.getInstance().baseUrl}/friends/requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ toUserId: data }),
        }
      );
      const result = await response.json();

      if (result.data?.id || result.id) {
        Toast.show({
          type: 'success',
          text1: 'Gửi lời mời kết bạn thành công',
          text2: 'Hãy đợi người ấy đồng ý nhé!'
        });
        setFriendIdInput("");
      } else {
        Toast.show({
          type: 'error',
          text1: 'Thất bại',
          text2: result.message || 'Không thể gửi lời mời'
        });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Lỗi kết nối máy chủ' });
    } finally {
      setIsSending(false);
    }
  };

  const handlePaste = async () => {
    const content = await Clipboard.getString();
    if (content) setFriendIdInput(content);
  };

  // Hàm xử lý Block
  const handleBlockFriend = async (targetUserId: string, name: string) => {
    Alert.alert(
      "Xác nhận chặn",
      `Bạn có chắc chắn muốn chặn ${name}? Hai người sẽ không thể thấy nhau nữa.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chặn",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AuthHelper.getInstance().getAccessToken();
              const response = await fetch(`${Api.getInstance().baseUrl}/friends/block`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ targetUserId }),
              });

              if (response.ok) {
                setFriends((prev) => prev.filter((f) => f.id !== targetUserId));
                Alert.alert("Thành công", `Đã chặn ${name}`);
              } else {
                Alert.alert("Lỗi", "Không thể chặn người dùng này lúc này.");
              }
            } catch (error) {
              console.error("Lỗi Block:", error);
            }
          },
        },
      ]
    );
  };

  const filteredList = friends.filter((friend) => {
    const matchesSearch = friend.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : friend.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderRightActions = (id: string, name: string) => {
    return (
      <TouchableOpacity
        style={styles.blockAction}
        onPress={() => handleBlockFriend(id, name)}
      >
        <UserX size={24} color="#fff" />
        <Text style={styles.blockActionText}>Chặn</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        
        {/* SECTION KẾT BẠN NHANH */}
        <View style={styles.quickAddContainer}>
          <Text style={styles.sectionTitle}>Kết bạn nhanh</Text>
          <View style={styles.inputWrapper}>
            <UserPlus size={20} color="#65676b" style={{ marginLeft: 12 }} />
            <TextInput
              style={styles.quickInput}
              placeholder="Nhập ID người dùng..."
              value={friendIdInput}
              onChangeText={setFriendIdInput}
              placeholderTextColor="#999"
            />
            {friendIdInput.length === 0 && (
              <TouchableOpacity onPress={handlePaste} style={styles.pasteBtn}>
                <Text style={styles.pasteText}>Dán</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={handleSendRequest}
              disabled={isSending || !friendIdInput.trim()}
              style={[styles.sendBtn, !friendIdInput.trim() && { backgroundColor: '#ccc' }]}
            >
              {isSending ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm trong danh sách..."
            value={searchText}
            onChangeText={setSearchText}
          />
          <View style={styles.filterRow}>
            <View style={styles.filterContainer}>
              {["all", "online", "offline"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterBtn, statusFilter === status && styles.filterBtnActive]}
                  onPress={() => setStatusFilter(status as any)}
                >
                  <Text style={[styles.filterText, statusFilter === status && styles.filterTextActive]}>
                    {status === "all" ? "Tất cả" : status === "online" ? "Online" : "Offline"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.mapBtn} onPress={() => router.push("/(main)/map")}>
              <MapPin size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy bạn bè nào.</Text>}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => renderRightActions(item.id, item.name)}
              friction={2}
              rightThreshold={40}
            >
              <View style={styles.friendItem}>
                <Image source={item.avatar} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <TagChips
                    tags={[{
                      key: "status",
                      value: item.status === "online" ? "Trực tuyến" : "Ngoại tuyến",
                      variant: item.status === "online" ? "status-online" : "status-offline",
                    }]}
                    maxDisplay={1}
                  />
                </View>
              </View>
            </Swipeable>
          )}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  quickAddContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1e21',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    height: 48,
  },
  quickInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#1c1e21',
  },
  pasteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
  },
  pasteText: { fontSize: 11, fontWeight: '700', color: '#4b4f56' },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterContainer: { flexDirection: "row", gap: 6 },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
  },
  filterBtnActive: { backgroundColor: "#007AFF" },
  filterText: { fontSize: 12, color: "#007AFF" },
  filterTextActive: { color: "#fff" },
  mapBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  name: { fontSize: 16, fontWeight: "600" },
  blockAction: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderRadius: 12,
    marginLeft: 8,
  },
  blockActionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  emptyText: { textAlign: "center", marginTop: 20, color: "#999" },
});

export default FriendListSection;