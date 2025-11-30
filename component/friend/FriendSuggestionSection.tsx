import { Colors } from "@/constant/Colors";

import { useRouter } from "expo-router";
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
const mockFriendSuggestions = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    avatar: "https://i.pravatar.cc/150?img=1",
    mutualFriends: 3,
    nearby: true,
    status: "online",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    avatar: "https://i.pravatar.cc/150?img=2",
    mutualFriends: 0,
    nearby: false,
    status: "offline",
  },
  {
    id: 3,
    name: "Lê Minh Đức",
    avatar: "https://i.pravatar.cc/150?img=3",
    mutualFriends: 1,
    nearby: true,
    status: "online",
  },
  {
    id: 4,
    name: "Hoàng Thu Hà",
    avatar: "https://i.pravatar.cc/150?img=4",
    mutualFriends: 2,
    nearby: false,
    status: "online",
  },
  {
    id: 5,
    name: "Phạm Nhật Huy",
    avatar: "https://i.pravatar.cc/150?img=5",
    mutualFriends: 0,
    nearby: true,
    status: "offline",
  },
  {
    id: 6,
    name: "Đỗ Khánh Linh",
    avatar: "https://i.pravatar.cc/150?img=6",
    mutualFriends: 4,
    nearby: true,
    status: "online",
  },
  {
    id: 7,
    name: "Bùi Anh Tuấn",
    avatar: "https://i.pravatar.cc/150?img=7",
    mutualFriends: 0,
    nearby: false,
    status: "offline",
  },
  {
    id: 8,
    name: "Võ Thị Mai",
    avatar: "https://i.pravatar.cc/150?img=8",
    mutualFriends: 2,
    nearby: true,
    status: "online",
  },
  {
    id: 9,
    name: "Ngô Minh Quân",
    avatar: "https://i.pravatar.cc/150?img=9",
    mutualFriends: 1,
    nearby: false,
    status: "offline",
  },
  {
    id: 10,
    name: "Hà Nhật Long",
    avatar: "https://i.pravatar.cc/150?img=10",
    mutualFriends: 5,
    nearby: true,
    status: "online",
  },
];

const FriendSuggestionSection = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "mutual" | "nearby">(
    "all"
  );

  // Lọc dữ liệu dựa trên searchText và statusFilter
  const filteredData = mockFriendSuggestions.filter((friend: any) => {
    // Search
    const matchesSearch = friend.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    // Filter theo tag
    let matchesFilter = true;
    if (statusFilter === "mutual") matchesFilter = friend.mutualFriends > 0;
    if (statusFilter === "nearby") matchesFilter = friend.nearby;

    return matchesSearch && matchesFilter;
  });

  return (
    <View
      style={{
        borderWidth: 0,
        flex:1,
        display: "flex",
        paddingHorizontal: 6,
      }}
    >
      {/* Toolbar */}
      <View style={styles.toolbar}>
        {/* Hàng 1: Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bạn bè..."
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Hàng 2: Filter + Map */}
        <View style={styles.filterRow}>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterBtn,
                statusFilter === "all" && styles.filterBtnActive,
              ]}
              onPress={() => setStatusFilter("all")}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFilter === "all" && styles.filterTextActive,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterBtn,
                statusFilter === "mutual" && styles.filterBtnActive,
              ]}
              onPress={() => setStatusFilter("mutual")}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFilter === "mutual" && styles.filterTextActive,
                ]}
              >
                Có bạn chung
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterBtn,
                statusFilter === "nearby" && styles.filterBtnActive,
              ]}
              onPress={() => setStatusFilter("nearby")}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFilter === "nearby" && styles.filterTextActive,
                ]}
              >
                Gần bạn
              </Text>
            </TouchableOpacity>
          </View>

          {/* <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => router.push("/(main)/(tabs)/friend/map")}
          >
            <MapPin size={24} color="#fff" />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
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
            <Image
              source={{ uri: item.avatar }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 999,
              }}
            />

            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {item.name}
                </Text>
                <View style={{ marginTop: 4 }}>
                  <TagChips
                    tags={[
                      ...(item.mutualFriends > 0
                        ? [{ key: "mutual_friends", value: "Có bạn chung" }]
                        : []),
                      ...(item.nearby
                        ? [{ key: "nearby_location", value: "Gần bạn" }]
                        : []),
                    ]}
                    maxDisplay={2}
                  />
                </View>
              </View>

              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <TouchableOpacity
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
                  <Text style={{ color: "white", fontSize: 14 }}>Kết bạn</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    width: 100,
                    height: 34,
                    paddingHorizontal: 14,
                    backgroundColor: Colors.gray[500],
                    borderRadius: 8,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 4,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 14 }}>Bỏ qua</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default FriendSuggestionSection;

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
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
    gap: 6,
    marginTop: 6,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
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
});
