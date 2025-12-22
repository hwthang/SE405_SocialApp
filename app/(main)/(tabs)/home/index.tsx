import PostItem from "@/component/post/PostItem";
import { Colors } from "@/constant/Colors"; // Đảm bảo bạn có bảng màu này
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const HomeScreen = () => {
  const [postItems, setPostItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchPostItems = useCallback(async () => {
    try {
      setLoading(true);
      const api = Api.getInstance();
      const auth = AuthHelper.getInstance();
      const token = await auth.getAccessToken();

      const response = await fetch(`${api.baseUrl}/posts/feed`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setPostItems(result.data || []);
      }
    } catch (error) {
      console.log("Fetch posts error", error);
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchPostItems();
  }, [fetchPostItems]);

  // --- RENDER PLACEHOLDER KHI TRỐNG ---
  const renderEmptyComponent = () => {
    if (loading && isFirstLoad) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.iconCircle}>
          <Plus size={40} color={Colors.blue[500]} />
        </View>
        <Text style={styles.emptyTitle}>Bảng tin đang trống</Text>
        <Text style={styles.emptySubtitle}>
          Hãy là người đầu tiên chia sẻ khoảnh khắc thú vị của bạn với mọi người!
        </Text>
        
        <TouchableOpacity 
          style={styles.createBtn}
          onPress={() => router.push("/(main)/(tabs)/post")} // Đường dẫn đến trang tạo bài
          activeOpacity={0.8}
        >
          <Text style={styles.createBtnText}>Đăng bài ngay</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading && isFirstLoad ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.blue[500]} />
        </View>
      ) : (
        <FlatList
          data={postItems}
          style={styles.list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostItem post={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          /** 🔽 PULL TO REFRESH */
          refreshing={loading}
          onRefresh={() => fetchPostItems()}
          contentContainerStyle={postItems.length === 0 && { flex: 1 }}
        />
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5", // Màu nền Facebook nhạt
  },
  list: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // --- EMPTY STATE STYLES ---
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#FFF", // Làm nổi bật phần placeholder trên nền xám
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EBF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C1E21",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#65676B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  createBtn: {
    backgroundColor: "#1877F2",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#1877F2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});