import MyQr from "@/component/profile/MyQr";
import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { UserService } from "@/service/UserService";
import { router } from "expo-router";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Share2,
  UserPen,
  X
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
   RE-USE INPUT COMPONENT
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

  // State cho Custom Alert
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "error" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

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

  const showAlert = (type: "success" | "error" | "confirm", title: string, message: string, onConfirm?: () => void) => {
    setAlertConfig({ visible: true, type, title, message, onConfirm });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Kết nối với mình trên ứng dụng nhé! Mã ID của mình là: ${user?.id}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogoutPress = () => {
    showAlert(
      "confirm",
      "Đăng xuất?",
      "Bạn có chắc muốn thoát khỏi phiên làm việc này không?",
      async () => {
        await AuthHelper.getInstance().logOut();
        router.replace("/(auth)/login");
      }
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
        setIsPasswordModalVisible(false);
        setCurrentPassword("");
        setNewPassword("");
        showAlert("success", "Thành công", "Mật khẩu của bạn đã được cập nhật.");
      } else {
        const result = await res.json();
        showAlert("error", "Lỗi", result.message || "Mật khẩu cũ không chính xác.");
      }
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
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

          <TouchableOpacity
            style={[styles.actionBtn, styles.iconBtn]}
            onPress={handleShare}
          >
            <Share2 size={20} color="#4B5563" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.iconBtn, styles.logoutBtn]}
            onPress={handleLogoutPress}
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
            <View style={styles.modalIndicator} />
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
              {loadingPass ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>CẬP NHẬT MẬT KHẨU</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CUSTOM ALERT MODAL - PHẦN XÁC NHẬN ĐĂNG XUẤT MỚI */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[
              styles.alertIconCircle,
              { backgroundColor: alertConfig.type === 'confirm' ? '#FEF2F2' : (alertConfig.type === 'success' ? '#ECFDF5' : '#FEF2F2') }
            ]}>
              {alertConfig.type === 'confirm' ? (
                <LogOut size={32} color="#EF4444" />
              ) : alertConfig.type === 'success' ? (
                <CheckCircle2 size={32} color="#10B981" />
              ) : (
                <AlertCircle size={32} color="#EF4444" />
              )}
            </View>

            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>

            <View style={styles.alertActionRow}>
              {alertConfig.type === "confirm" ? (
                <>
                  <TouchableOpacity
                    style={[styles.alertBtnSmall, styles.btnCancel]}
                    onPress={() => setAlertConfig({ ...alertConfig, visible: false })}
                  >
                    <Text style={styles.btnTextCancel}>Hủy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.alertBtnSmall, styles.btnConfirm]}
                    onPress={() => {
                      setAlertConfig({ ...alertConfig, visible: false });
                      alertConfig.onConfirm?.();
                    }}
                  >
                    <Text style={styles.alertBtnText}>Đăng xuất</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.alertBtnFull, { backgroundColor: alertConfig.type === "success" ? "#10B981" : "#EF4444" }]}
                  onPress={() => setAlertConfig({ ...alertConfig, visible: false })}
                >
                  <Text style={styles.alertBtnText}>Đóng</Text>
                </TouchableOpacity>
              )}
            </View>
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
  
  // Modal Style
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFF", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
  modalIndicator: { width: 40, height: 5, backgroundColor: "#E5E7EB", borderRadius: 3, alignSelf: "center", marginBottom: 15 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  
  // Input Style
  inputContainer: { marginBottom: 18 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#F9FAFB",
  },
  inputFocused: { borderColor: Colors.blue[600], backgroundColor: "#FFF" },
  textInput: { flex: 1, fontSize: 16, paddingLeft: 10, color: "#1F2937" },
  submitBtn: { backgroundColor: Colors.blue[600], height: 56, borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 10 },
  submitBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  // --- CUSTOM ALERT STYLES ---
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    backgroundColor: "#FFF",
    width: "85%",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  alertIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  alertTitle: { fontSize: 20, fontWeight: "800", color: "#1F2937", marginBottom: 8 },
  alertMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  alertActionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  alertBtnSmall: { flex: 1, height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  alertBtnFull: { width: "100%", height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  btnCancel: { backgroundColor: '#F3F4F6' },
  btnConfirm: { 
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnTextCancel: { color: '#4B5563', fontWeight: '700', fontSize: 16 },
  alertBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});