import MyQr from "@/component/profile/MyQr";
import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { UserService } from "@/service/UserService";
import { router } from "expo-router";
import { Eye, EyeOff, KeyRound, Lock, LogOut, Share2, UserPen, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

/* =======================================================
   RE-USE INPUT COMPONENT (Style từ Login)
======================================================= */
const PasswordInput = ({ label, value, onChangeText, placeholder }: any) => {
  const [secure, setSecure] = useState(true);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, focused && styles.inputFocused]}>
        <Lock size={20} color="#6B7280" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.textInput}
          secureTextEntry={secure}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          {secure ? <Eye size={20} color="#6B7280" /> : <EyeOff size={20} color="#6B7280" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* =======================================================
   MAIN SCREEN
======================================================= */
const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // States cho đổi mật khẩu
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);

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
      "Xác nhận đăng xuất",
      "Bạn có chắc muốn thoát khỏi phiên làm việc này không?",
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
      ],
      { cancelable: true }
    );
  };

  const handleChangePassword = async () => {
    if (currentPassword.length < 6 || newPassword.length < 6) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "Mật khẩu phải từ 6 ký tự" });
      return;
    }

    try {
      setLoadingPass(true);
      const api = Api.getInstance();
      const token = await AuthHelper.getInstance().getAccessToken();
      
      const res = await fetch(`${api.baseUrl}/users/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        Toast.show({ type: "success", text1: "Thành công", text2: "Đã đổi mật khẩu" });
        setIsPasswordModalVisible(false);
        setCurrentPassword("");
        setNewPassword("");
      } else {
        const result = await res.json();
        Toast.show({ type: "error", text1: "Lỗi", text2: result.message || "Mật khẩu cũ không đúng" });
      }
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.blue[600]]} />}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Image source={{ uri: user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}` }} style={styles.avatar} />
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>{user?.name || "Đang tải..."}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.bioTitle}>Giới thiệu</Text>
          <View style={styles.bioContent}>
            <Text style={styles.bioText}>{user?.bio || "Chưa có lời giới thiệu."}</Text>
          </View>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editBtn]} 
            onPress={() => router.push("/(main)/profileEdit")}
          >
            <UserPen size={18} color="#FFF" />
            <Text style={styles.editBtnText}>Chỉnh sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.iconBtn]} 
            onPress={() => setIsPasswordModalVisible(true)}
          >
            <KeyRound size={20} color="#4B5563" />
          </TouchableOpacity>

          {/* Nút Share được tạm comment lại */}
          <TouchableOpacity 
            style={[styles.actionBtn, styles.iconBtn]} 
            onPress={handleShare}
          >
            <Share2 size={20} color="#4B5563" />
          </TouchableOpacity> 
         

          <TouchableOpacity 
            style={[styles.actionBtn, styles.iconBtn, styles.logoutBtn]} 
            onPress={handleLogout}
          >
            <LogOut size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <View style={styles.qrSection}>
           <MyQr />
        </View>
      </ScrollView>

      {/* MODAL ĐỔI MẬT KHẨU */}
      <Modal visible={isPasswordModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bảo mật tài khoản</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalVisible(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <PasswordInput 
              label="Mật khẩu hiện tại" 
              value={currentPassword} 
              onChangeText={setCurrentPassword}
              placeholder="Nhập mật khẩu cũ"
            />
            
            <PasswordInput 
              label="Mật khẩu mới" 
              value={newPassword} 
              onChangeText={setNewPassword}
              placeholder="Nhập mật khẩu mới"
            />

            <TouchableOpacity 
              style={[styles.submitBtn, loadingPass && { opacity: 0.7 }]} 
              onPress={handleChangePassword}
              disabled={loadingPass}
            >
              <Text style={styles.submitBtnText}>{loadingPass ? "ĐANG LƯU..." : "CẬP NHẬT MẬT KHẨU"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  headerSection: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 25 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "#F3F4F6" },
  nameContainer: { marginLeft: 18, flex: 1 },
  userName: { fontSize: 22, fontWeight: "700", color: "#1F2937" },
  userEmail: { fontSize: 14, color: "#6B7280" },
  bioSection: { paddingHorizontal: 20, marginBottom: 10 },
  bioTitle: { fontSize: 15, fontWeight: "600", color: "#374151", marginBottom: 8 },
  bioContent: { backgroundColor: "#F9FAFB", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#F3F4F6" },
  bioText: { fontSize: 14, color: "#4B5563", lineHeight: 20 },
  actionRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginVertical: 20 },
  actionBtn: { height: 46, borderRadius: 12, justifyContent: "center", alignItems: "center", flexDirection: "row" },
  editBtn: { flex: 1, backgroundColor: Colors.blue[600], gap: 8 },
  editBtnText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  iconBtn: { width: 50, backgroundColor: "#F3F4F6" },
  logoutBtn: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#FEE2E2" },
  qrSection: { alignItems: "center", marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  inputContainer: { marginBottom: 18 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#F9FAFB",
  },
  inputFocused: { borderColor: Colors.blue[600], backgroundColor: "#FFF" },
  textInput: { flex: 1, fontSize: 16, paddingLeft: 10, color: "#1F2937" },
  submitBtn: { backgroundColor: Colors.blue[600], height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 10 },
  submitBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});