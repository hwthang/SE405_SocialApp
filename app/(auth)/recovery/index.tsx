import { Api } from "@/helper/Api";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Waypoints as WaypointsIcon
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const OTP_LENGTH = 6;

/* =======================================================
   RE-USE COMPONENTS
======================================================= */
const CustomButton = ({ title, onPress, disabled, loading }: any) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.85}
    style={styles.buttonWrapper}
  >
    <LinearGradient
      colors={disabled ? ["#9CA3AF", "#9CA3AF"] : ["#2563EB", "#1D4ED8"]}
      style={styles.button}
    >
      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{title}</Text>}
    </LinearGradient>
  </TouchableOpacity>
);

const RecoveryPassword = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [secureNewPass, setSecureNewPass] = useState(true);
  const [secureConfirmPass, setSecureConfirmPass] = useState(true);

  // Refs & Animation
  const otpInputRef = useRef<TextInput>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onKeyboardShow = () => {
      Animated.timing(translateY, {
        toValue: -100, // Đẩy lên cao hơn một chút vì form bước 2 dài hơn
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    const onKeyboardHide = () => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const api = Api.getInstance();

  const handleCheckEmail = async () => {
    if (!email.includes("@")) return Toast.show({ type: "error", text1: "Email không hợp lệ" });
    setLoading(true);
    try {
      const res = await fetch(`${api.baseUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { 
        setStep(2); 
        Toast.show({ type: "success", text1: "Đã gửi OTP" }); 
      }
      else Toast.show({ type: "error", text1: "Lỗi", text2: "Email không tồn tại" });
    } finally { setLoading(false); }
  };

  const handleReset = async () => {
    if (otp.length < 6) return Toast.show({ type: "error", text1: "Vui lòng nhập đủ OTP" });
    if (newPassword !== confirmPassword) return Toast.show({ type: "error", text1: "Mật khẩu không khớp" });
    
    setLoading(true);
    try {
      const res = await fetch(`${api.baseUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, newPassword }),
      });
      const json = await res.json()
      console.log(json)
      if (res.ok) {
        Toast.show({ type: "success", text1: "Thành công", text2: "Mật khẩu đã được cập nhật" });
        router.replace("/(auth)/login");
      } else Toast.show({ type: "error", text1: "Lỗi", text2: "Mã OTP sai hoặc hết hạn" });
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#1D4ED8", "#1E3A8A"]} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
        <TouchableOpacity onPress={() => (step > 1 ? setStep(1) : router.back())} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>

        <View style={styles.header}>
          <WaypointsIcon size={60} color="#FFF" />
          <Text style={styles.headerText}>Khôi phục mật khẩu</Text>
          <Text style={styles.subHeader}>
            {step === 1 ? "Nhập email xác thực" : "Thiết lập mật khẩu mới"}
          </Text>
        </View>

        <View style={styles.card}>
          {step === 1 ? (
            <View>
              <Text style={styles.inputLabel}>Email khôi phục</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#6B7280" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  style={styles.textInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <CustomButton title="TIẾP TỤC" onPress={handleCheckEmail} loading={loading} disabled={!email} />
            </View>
          ) : (
            <View>
              <Text style={styles.inputLabel}>Mã xác thực OTP</Text>
              <Pressable style={styles.otpContainer} onPress={() => otpInputRef.current?.focus()}>
                {Array(OTP_LENGTH).fill(0).map((_, i) => (
                  <View key={i} style={[styles.otpBox, otp.length === i && styles.otpBoxFocused, otp[i] && styles.otpBoxFilled]}>
                    <Text style={styles.otpText}>{otp[i] || ""}</Text>
                  </View>
                ))}
              </Pressable>
              
              <TextInput
                ref={otpInputRef}
                value={otp}
                onChangeText={setOtp}
                maxLength={OTP_LENGTH}
                keyboardType="number-pad"
                style={styles.hiddenInput}
              />

              <Text style={[styles.inputLabel, { marginTop: 15 }]}>Mật khẩu mới</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#6B7280" />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Tối thiểu 6 ký tự"
                  secureTextEntry={secureNewPass}
                  style={styles.textInput}
                />
                <TouchableOpacity onPress={() => setSecureNewPass(!secureNewPass)}>
                  {secureNewPass ? <Eye size={20} color="#6B7280" /> : <EyeOff size={20} color="#6B7280" />}
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 15 }]}>Xác nhận mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#6B7280" />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Nhập lại mật khẩu"
                  secureTextEntry={secureConfirmPass}
                  style={styles.textInput}
                />
                <TouchableOpacity onPress={() => setSecureConfirmPass(!secureConfirmPass)}>
                  {secureConfirmPass ? <Eye size={20} color="#6B7280" /> : <EyeOff size={20} color="#6B7280" />}
                </TouchableOpacity>
              </View>

              <CustomButton
                title="HOÀN TẤT"
                onPress={handleReset}
                loading={loading}
                disabled={otp.length < 6 || !newPassword || !confirmPassword}
              />
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

export default RecoveryPassword;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16 },
  backBtn: { position: "absolute", top: 60, left: 16 },
  header: { alignItems: "center", marginBottom: 30 },
  headerText: { fontSize: 26, fontWeight: "bold", color: "#FFF", marginTop: 12 },
  subHeader: { fontSize: 15, color: "#BFDBFE", marginTop: 4 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  inputLabel: { fontSize: 15, fontWeight: "600", color: "#374151", marginBottom: 8 },
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
  textInput: { flex: 1, fontSize: 16, paddingLeft: 10, color: "#1F2937" },
  buttonWrapper: { height: 56, borderRadius: 12, overflow: "hidden", marginTop: 24 },
  button: { flex: 1, justifyContent: "center", alignItems: "center" },
  buttonText: { fontSize: 16, color: "#FFF", fontWeight: "bold" },
  
  otpContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  otpBox: {
    width: (width - 120) / 6,
    height: 50,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  otpBoxFocused: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  otpBoxFilled: { borderColor: "#2563EB" },
  otpText: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  hiddenInput: { position: "absolute", width: 1, height: 1, opacity: 0 },
});