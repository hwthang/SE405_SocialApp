import { Api } from "@/helper/Api";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Waypoints as WaypointsIcon,
  type LucideIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";

/* =======================================================
   INTERFACES
======================================================= */
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

interface InputProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  errorMessage?: string;
  isPassword?: boolean;
}

/* =======================================================
   CUSTOM BUTTON
======================================================= */
const CustomButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    disabled={disabled}
    style={styles.buttonWrapper}
  >
    <LinearGradient
      colors={disabled ? ["#9CA3AF", "#9CA3AF"] : ["#2563EB", "#1D4ED8"]}
      style={styles.button}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

/* =======================================================
   CUSTOM INPUT
======================================================= */
const CustomInput: React.FC<InputProps> = ({
  label,
  icon: Icon,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  errorMessage,
  isPassword = false,
}) => {
  const [secure, setSecure] = useState(secureTextEntry);
  const iconColor = errorMessage ? "#DC2626" : "#6B7280";

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>

      <View style={[styles.inputWrapper, errorMessage && styles.inputError]}>
        <Icon size={20} color={iconColor} />

        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          placeholder={`Nhập ${label.toLowerCase()}`}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            {secure ? (
              <Eye size={20} color={iconColor} />
            ) : (
              <EyeOff size={20} color={iconColor} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

/* =======================================================
   MAIN SCREEN
======================================================= */
const RegisterScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  /* ---------- VALIDATE ---------- */
  const validate = () => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "Tên không được để trống";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Email không hợp lệ";
    if (password.length < 6)
      e.password = "Mật khẩu tối thiểu 6 ký tự";
    if (password !== confirmPassword)
      e.confirmPassword = "Mật khẩu không khớp";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- SUBMIT ---------- */
  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const api = Api.getInstance();

      const res = await fetch(`${api.baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const result = await res.json();

      if (result?.data) {
        Toast.show({
          type: "success",
          text1: "Đăng ký thành công",
          text2: "Vui lòng kiểm tra email của bạn",
        });
        router.replace("/(auth)/login");
      } else {
        Toast.show({
          type: "error",
          text1: "Đăng ký thất bại",
          text2:
            result?.message === "Email already in use"
              ? "Email đã được đăng ký"
              : "Hệ thống đang bận, vui lòng thử lại",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi kết nối",
        text2: "Không thể kết nối máy chủ",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <LinearGradient colors={["#1D4ED8", "#1E3A8A"]} style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={100}
        enableOnAndroid
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <WaypointsIcon size={64} color="#FFF" />
            <Text style={styles.headerText}>Tạo tài khoản mới</Text>
            <Text style={styles.subHeader}>
              Tham gia cộng đồng trong nháy mắt
            </Text>
          </View>

          <View style={styles.card}>
            <CustomInput
              label="Tên đầy đủ"
              icon={User}
              value={name}
              onChangeText={setName}
              errorMessage={errors.name}
            />

            <CustomInput
              label="Email"
              icon={Mail}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              errorMessage={errors.email}
            />

            <CustomInput
              label="Mật khẩu"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              isPassword
              errorMessage={errors.password}
            />

            <CustomInput
              label="Nhập lại mật khẩu"
              icon={Lock}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              isPassword
              errorMessage={errors.confirmPassword}
            />

            <CustomButton
              title={loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
              onPress={handleRegister}
              disabled={loading}
            />

            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              style={{ marginTop: 14 }}
            >
              <Text style={styles.loginText}>
                Đã có tài khoản?{" "}
                <Text style={styles.loginBold}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
};

export default RegisterScreen;

/* =======================================================
   STYLES
======================================================= */
const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 60,
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: 420,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 12,
  },
  subHeader: {
    fontSize: 15,
    color: "#BFDBFE",
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    elevation: 5,
  },
  inputContainer: { marginBottom: 20 },
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
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    height: 55,
  },
  inputError: { borderColor: "#DC2626" },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingLeft: 10,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 6,
  },
  buttonWrapper: {
    height: 55,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  loginText: {
    textAlign: "center",
    color: "#6B7280",
  },
  loginBold: {
    color: "#3B82F6",
    fontWeight: "bold",
  },
});
