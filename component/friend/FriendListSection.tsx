import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { Avatars } from "@/public/img/avatar";
import { router } from "expo-router";
import { MapPin, UserX } from "lucide-react-native"; // Thêm icon chặn
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import TagChips from "./TagChip";

const FriendListSection = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                // Xóa bạn bè khỏi danh sách hiển thị sau khi chặn thành công
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

  // Render nút Block nằm bên phải (hiện ra khi vuốt sang trái)
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
      <View style={{ flex: 1 }}>
        {/* Toolbar */}
        <View style={styles.toolbar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bạn bè..."
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
                    {status === "all" ? "Tất cả" : status === "online" ? "Trực tuyến" : "Ngoại tuyến"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.mapBtn} onPress={() => router.push("/(main)/map")}>
              <MapPin size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 16 }}
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

export default FriendListSection;

const styles = StyleSheet.create({
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
    marginLeft: 8, // Tạo khoảng cách nhỏ với item
  },
  blockActionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  emptyText: { textAlign: "center", marginTop: 20, color: "#999" },
});