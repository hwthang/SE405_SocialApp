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
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.85}
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

      console.log(result.data.accessToken)
      await AuthHelper.getInstance().setAccessToken(result.data.accessToken);

      Toast.show({
        type: "success",
        text1: "Đăng nhập thành công",
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
      {/* Gradient background – render 1 lần */}
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

            <CustomButton
              title={loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
              onPress={handleLogin}
              disabled={loading}
            />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              style={{ marginTop: 16 }}
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

/* =======================================================
   STYLES
======================================================= */

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 120,
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
    padding: 20,
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
    paddingHorizontal: 16,
    height: 55,
    backgroundColor: "#F9FAFB",
  },
  inputFocused: { borderColor: "#3B82F6" },
  inputError: { borderColor: "#DC2626" },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 10,
    color: "#1F2937",
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
    fontSize: 18,
    color: "#FFF",
    fontWeight: "700",
  },
  registerText: {
    textAlign: "center",
    color: "#6B7280",
  },
  registerBold: {
    color: "#3B82F6",
    fontWeight: "bold",
  },
});
