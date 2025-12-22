import MyQr from "@/component/profile/MyQr";
import { Colors } from "@/constant/Colors";
import { AuthHelper } from "@/helper/AuthHelper";
import { UserService } from "@/service/UserService";
import { router } from "expo-router";
import { LogOut, Share2, UserPen } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUser = async () => {
    try {
      const userData = await UserService.getInstance().getMe();
      setUser(userData);
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Kết nối với mình trên ứng dụng nhé! Mã ID của mình là: ${user?.id}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn thoát khỏi tài khoản này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await AuthHelper.getInstance().logOut();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.blue[600]]}
          tintColor={Colors.blue[600]}
        />
      }
    >
      {/* 1. Header Section */}
      <View style={styles.headerSection}>
        <Image
          source={{
            uri:
              user?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "User"
              )}&background=random`,
          }}
          style={styles.avatar}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name || "Đang tải..."}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </View>

      {/* 2. Bio Section */}
      <View style={styles.bioSection}>
        <Text style={styles.bioTitle}>Giới thiệu</Text>
        <View style={styles.bioContent}>
          <Text style={styles.bioText}>
            {user?.bio || "Chưa có lời giới thiệu nào cho bản thân."}
          </Text>
        </View>
      </View>

      {/* 3. Action Row (Gọn gàng) */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => router.push("/(main)/profileEdit")}
        >
          <UserPen size={18} color="#FFF" />
          <Text style={styles.editBtnText}>Chỉnh sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.actionBtn, styles.iconBtn]}
          onPress={handleShare}
        >
          <Share2 size={20} color="#4B5563" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.actionBtn, styles.iconBtn, styles.logoutBorder]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {/* 4. QR Code Section */}
      <View style={styles.qrSection}>
        <View style={styles.qrHeader}>
          <Text style={styles.sectionTitle}>Mã QR cá nhân</Text>
          <Text style={styles.qrDesc}>
            Bạn bè có thể quét mã này để tìm thấy bạn nhanh hơn
          </Text>
        </View>
        <View style={styles.qrWrapper}>
          <MyQr />
        </View>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray[100],
    borderWidth: 3,
    borderColor: "#F3F4F6",
  },
  nameContainer: {
    marginLeft: 18,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  bioSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  bioTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  bioContent: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  bioText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginVertical: 20,
  },
  actionBtn: {
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  editBtn: {
    flex: 1,
    backgroundColor: Colors.blue[600],
    gap: 8,
  },
  editBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  iconBtn: {
    width: 44,
    backgroundColor: "#F3F4F6",
  },
  logoutBorder: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  qrSection: {
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginTop: 10,
  },
  qrHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  qrDesc: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  qrWrapper: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});