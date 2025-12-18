import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { Avatars } from "@/public/img/avatar"; // Đảm bảo bạn có avatar mặc định
import { router } from "expo-router";
import { MapPin, MessageCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import TagChips from "./TagChip";

const FriendListSection = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  
  // Quản lý danh sách bạn bè từ API
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
        // Ánh xạ dữ liệu từ API sang cấu trúc hiển thị
        const formattedFriends = result.data.map((item: any) => ({
          id: item.friendId, // Sử dụng friendId từ API
          name: item.name,
          // Nếu avatarUrl null thì dùng ảnh mặc định
          avatar: item.avatarUrl ? { uri: item.avatarUrl } : Avatars.cat,
          status: item.isOnline ? "online" : "offline", // Giả định API trả về trạng thái này
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

  // Lọc danh sách dựa trên State 'friends'
  const filteredList = friends.filter((friend) => {
    const matchesSearch = friend.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : friend.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={{ width: "100%" }}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bạn bè..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.filterRow}>
          <View style={styles.filterContainer}>
            {["all", "online", "offline"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterBtn,
                  statusFilter === status && styles.filterBtnActive,
                ]}
                onPress={() => setStatusFilter(status as any)}
              >
                <Text
                  style={[
                    styles.filterText,
                    statusFilter === status && styles.filterTextActive,
                  ]}
                >
                  {status === "all"
                    ? "Tất cả"
                    : status === "online"
                    ? "Trực tuyến"
                    : "Ngoại tuyến"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => router.push("/(main)/(tabs)/friend/map?mode=nearby")}
          >
            <MapPin size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách bạn bè */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          gap: 12,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
            Không tìm thấy bạn bè nào.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Image source={item.avatar} style={styles.avatar} />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <TagChips
                tags={[
                  {
                    key: "status",
                    value:
                      item.status === "online" ? "Trực tuyến" : "Ngoại tuyến",
                    variant:
                      item.status === "online"
                        ? "status-online"
                        : "status-offline",
                  },
                ]}
                maxDisplay={1}
              />
            </View>

            <TouchableOpacity 
              style={styles.messageBtn}
              onPress={() => {}} // Điều hướng tới chat
            >
              <MessageCircle size={18} color="#007AFF" />
              <Text style={styles.messageText}>Nhắn tin</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default FriendListSection;

const styles = StyleSheet.create({
  // Giữ nguyên các styles cũ của bạn...
  toolbar: {
    flexDirection: "column",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#f0f2f5", // Màu nhẹ hơn cho hiện đại
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 0,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 6,
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
  },
  filterBtnActive: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 12,
    color: "#007AFF",
  },
  filterTextActive: {
    color: "#fff",
  },
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  messageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
  },
  messageText: {
    color: "#007AFF",
    fontSize: 14,
  },
});