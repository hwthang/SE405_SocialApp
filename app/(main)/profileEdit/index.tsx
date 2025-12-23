import { Colors } from "@/constant/Colors";
import UploadHelper from "@/helper/UploadHelper";
import { Avatars } from "@/public/img/avatar";
import { UserService } from "@/service/UserService";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Camera } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EditProfileScreen = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await UserService.getInstance().getMe();
      if (user) {
        setName(user.name || "");
        setBio(user.bio || "");
        setAvatarUri(user.avatarUrl || null);
      }
    } catch (error) {
      console.error("Load user error:", error);
    } finally {
      setFetching(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Bạn cần cấp quyền thư viện ảnh.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Thông báo", "Tên không được để trống");
      return;
    }

    setLoading(true);
    try {
      let finalAvatarUrl: string | undefined;

      if (avatarUri && !avatarUri.startsWith("http")) {
        const fileToUpload = {
          uri: avatarUri,
          type: "image/jpeg",
          name: `avatar_${Date.now()}.jpg`,
        } as any;
        const uploadRes = await UploadHelper.getInstance().getMediaObject(
          fileToUpload
        );
        finalAvatarUrl = uploadRes.url;
      } else {
        finalAvatarUrl = avatarUri || undefined;
      }

      await UserService.getInstance().updateMyProfile({
        name,
        bio,
        ...(finalAvatarUrl ? { avatarUrl: finalAvatarUrl } : {}),
      });

      // 🔥 PHÁT TÍN HIỆU ĐỂ TABBAR UPDATE AVATAR
      DeviceEventEmitter.emit("userProfileUpdated");

      Alert.alert("Thành công", "Hồ sơ đã được cập nhật", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Cập nhật hồ sơ thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.blue[600]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={avatarUri ? { uri: avatarUri } : Avatars.cat}
                  style={styles.avatar}
                />
                <View style={styles.cameraBtn}>
                  <Camera size={20} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Thay đổi ảnh đại diện</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ và tên..."
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiểu sử (Bio)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tiểu sử..."
                multiline
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditProfileScreen;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 24 },
  avatarContainer: { alignItems: "center", marginBottom: 32 },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F3F4F6",
    borderWidth: 4,
    borderColor: "#F3F4F6",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.blue[600],
    padding: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  avatarHint: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.blue[600],
  },
  form: { marginBottom: 40 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1F2937",
  },
  textArea: { height: 120, paddingTop: 14 },
  saveBtn: {
    backgroundColor: Colors.blue[600],
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
