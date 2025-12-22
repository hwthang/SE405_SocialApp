import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Waypoints as WaypointsIcon,
  type LucideIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";

/* =======================================================
   COMPONENTS
======================================================= */

const CustomButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => (
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
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

type CustomInputProps = {
  label: string;
  icon: LucideIcon;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  errorMessage?: string;
  isPassword?: boolean;
};

const CustomInput = ({
  label,
  icon: Icon,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  errorMessage,
  isPassword = false,
}: CustomInputProps) => {
  const [secure, setSecure] = useState(secureTextEntry);
  const [focused, setFocused] = useState(false);

  const iconColor = errorMessage ? "#DC2626" : "#6B7280";

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputFocused,
          errorMessage && styles.inputError,
        ]}
      >
        <Icon size={20} color={iconColor} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.textInput}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          placeholder={`Nhập ${label.toLowerCase()}`}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            {secure ? (
              <Eye size={20} color="#6B7280" />
            ) : (
              <EyeOff size={20} color="#6B7280" />
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Logic: Nút bị disable nếu email hoặc password rỗng (sau khi trim khoảng trắng)
  const isFormInvalid = email.trim().length === 0 || password.trim().length === 0;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Email không hợp lệ";
    }
    if (password.length < 6) {
      e.password = "Mật khẩu tối thiểu 6 ký tự";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const api = Api.getInstance();

      const res = await fetch(`${api.baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        Toast.show({
          type: "error",
          text1: "Đăng nhập thất bại",
          text2: result?.message || "Sai email hoặc mật khẩu",
        });
        return;
      }

      // Lưu trữ cặp Token
      const auth = AuthHelper.getInstance();
      await auth.setAccessToken(result.data.accessToken);
      await auth.setRefreshToken(result.data.refreshToken);

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Chào mừng bạn quay trở lại 🎉",
      });

      router.replace("/(main)/(tabs)/home");
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

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#1D4ED8", "#1E3A8A"]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        extraScrollHeight={0}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <WaypointsIcon size={60} color="#FFF" />
            <Text style={styles.headerText}>Chào mừng trở lại</Text>
            <Text style={styles.subHeader}>Đăng nhập để tiếp tục</Text>
          </View>

          <View style={styles.card}>
            <CustomInput
              label="Email"
              icon={Mail}
              value={email}
              onChangeText={(text: string) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              keyboardType="email-address"
              errorMessage={errors.email}
            />

            <View>
              <CustomInput
                label="Mật khẩu"
                icon={Lock}
                value={password}
                onChangeText={(text: string) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                secureTextEntry
                isPassword
                errorMessage={errors.password}
              />
              
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/recovery')}
                style={styles.forgotPasswordWrapper}
              >
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            <CustomButton
              title={loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
              onPress={handleLogin}
              loading={loading}
              disabled={isFormInvalid} // Disable nếu form trống
            />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              style={{ marginTop: 20 }}
            >
              <Text style={styles.registerText}>
                Chưa có tài khoản?{" "}
                <Text style={styles.registerBold}>Đăng ký</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

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
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  inputContainer: { marginBottom: 18 },
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
    height: 56,
    backgroundColor: "#F9FAFB",
  },
  inputFocused: { borderColor: "#3B82F6", backgroundColor: "#FFF" },
  inputError: { borderColor: "#DC2626" },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 10,
    color: "#1F2937",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordWrapper: {
    alignSelf: "flex-end",
    marginTop: -10,
    marginBottom: 20,
    padding: 4,
  },
  forgotPasswordText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonWrapper: {
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  registerText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
  },
  registerBold: {
    color: "#3B82F6",
    fontWeight: "bold",
  },
});