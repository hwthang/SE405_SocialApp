import { Api } from "@/helper/Api";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ChevronLeft,
  KeyRound,
  Lock,
  Mail,
  Waypoints as WaypointsIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

/* =======================================================
   RECOVERY PASSWORD SCREEN
======================================================= */
const RecoveryPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);

  // Form Data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const api = Api.getInstance();

  // STEP 1: Gọi API check email và gửi OTP
  const handleCheckEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "Email không hợp lệ" });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${api.baseUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã gửi mã OTP",
        });
        setStep(2);
      } else {
        const result = await res.json();
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: result.message || "Email không tồn tại",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể kết nối máy chủ",
      });
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 & 3: Gọi API khôi phục mật khẩu (Email, OTP, Pass)
  const handleRecovery = async () => {
    if (otp.length !== 6) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "OTP phải gồm 6 số" });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mật khẩu tối thiểu 6 ký tự",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mật khẩu xác nhận không khớp",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${api.baseUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Mật khẩu đã được đổi",
        });
        router.replace("/(auth)/login");
      } else {
        const result = await res.json();
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: result.message || "OTP sai hoặc hết hạn",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Lỗi thực hiện khôi phục",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#1D4ED8", "#1E3A8A"]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => (step > 1 ? setStep(step - 1) : router.back())}
            style={styles.backBtn}
          >
            <ChevronLeft color="#FFF" size={28} />
          </TouchableOpacity>

          <View style={styles.header}>
            <WaypointsIcon size={60} color="#FFF" />
            <Text style={styles.headerText}>Khôi phục mật khẩu</Text>
            <Text style={styles.subHeader}>
              Bước {step}/3:{" "}
              {step === 1
                ? "Xác thực Email"
                : step === 2
                ? "Nhập mã OTP"
                : "Đặt mật khẩu mới"}
            </Text>
          </View>

          <View style={styles.card}>
            {/* SECTION 1: NHẬP EMAIL */}
            {step === 1 && (
              <View>
                <Text style={styles.inputLabel}>Email của bạn</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color="#6B7280" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@gmail.com"
                    style={styles.textInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity
                  onPress={handleCheckEmail}
                  disabled={loading}
                  style={styles.mainBtn}
                >
                  <Text style={styles.btnText}>
                    {loading ? "ĐANG GỬI..." : "GỬI MÃ OTP"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* SECTION 2: NHẬP OTP */}
            {step === 2 && (
              <View>
                <Text style={styles.inputLabel}>Mã OTP (6 chữ số)</Text>
                <View style={styles.inputWrapper}>
                  <KeyRound size={20} color="#6B7280" />
                  <TextInput
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="123456"
                    style={styles.textInput}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setStep(3)}
                  style={styles.mainBtn}
                >
                  <Text style={styles.btnText}>TIẾP TỤC</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* SECTION 3: NHẬP PASSWORD MỚI */}
            {step === 3 && (
              <View>
                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#6B7280" />
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Tối thiểu 6 ký tự"
                    secureTextEntry
                    style={styles.textInput}
                  />
                </View>

                <Text style={[styles.inputLabel, { marginTop: 15 }]}>
                  Xác nhận mật khẩu
                </Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#6B7280" />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Nhập lại mật khẩu"
                    secureTextEntry
                    style={styles.textInput}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleRecovery}
                  disabled={loading}
                  style={styles.mainBtn}
                >
                  <Text style={styles.btnText}>
                    {loading ? "ĐANG XỬ LÝ..." : "ĐỔI MẬT KHẨU"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default RecoveryPassword;

/* =======================================================
   STYLES (Đồng bộ với Login)
======================================================= */
const styles = StyleSheet.create({
  scrollContent: { paddingTop: 80, paddingBottom: 40, alignItems: "center" },
  container: { width: "100%", maxWidth: 420, paddingHorizontal: 16 },
  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  header: { alignItems: "center", marginBottom: 30 },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 12,
  },
  subHeader: { fontSize: 15, color: "#BFDBFE", marginTop: 4 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 55,
    backgroundColor: "#F9FAFB",
  },
  textInput: { flex: 1, fontSize: 16, paddingLeft: 10, color: "#1F2937" },
  mainBtn: {
    height: 55,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
