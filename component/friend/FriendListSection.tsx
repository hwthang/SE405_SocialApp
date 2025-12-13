import { router } from "expo-router";
import { MapPin, MessageCircle } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import TagChips from "./TagChip";

// Fake dữ liệu (đổi thành API)
const friendList = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=1",
    status: "online",
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=2",
    status: "offline",
  },
  {
    id: 3,
    name: "Lê Văn C",
    avatar: "https://i.pravatar.cc/150?img=3",
    status: "online",
  },
];

const FriendListSection = ({ navigation }: { navigation?: any }) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "online" | "offline"
  >("all");

  const filteredList = friendList.filter((friend) => {
    const matchesSearch = friend.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : friend.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        {/* Hàng 1: Search */}
        <View style={{ width: "100%" }}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bạn bè..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Hàng 2: Filter + Map */}
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
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          gap: 12,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />

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

            <TouchableOpacity style={styles.messageBtn}>
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
  toolbar: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
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

  container: {},
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
    borderRadius: 999,
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
