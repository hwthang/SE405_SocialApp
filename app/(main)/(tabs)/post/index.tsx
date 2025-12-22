import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Globe,
  ImagePlus,
  Lock,
  Users,
  Video as VideoIcon,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import CustomHeader from "@/component/custom/CustomHeader";
import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import UploadHelper from "@/helper/UploadHelper";
import { UserService } from "@/service/UserService";

// ---- Types ----
type MediaType = "image" | "video";
interface MediaItem {
  uri: string;
  type: MediaType;
}
type Scope = "public" | "friends" | "only_me";

const SCOPE_OPTIONS = [
  {
    id: "public",
    label: "Công khai",
    desc: "Bất kỳ ai cũng có thể xem",
    Icon: Globe,
  },
  { id: "friends", label: "Bạn bè", desc: "Chỉ bạn bè của bạn", Icon: Users },
  {
    id: "only_me",
    label: "Chỉ mình tôi",
    desc: "Chỉ mình bạn mới thấy",
    Icon: Lock,
  },
];

const MediaPreviewItem = ({
  item,
  index,
  onRemove,
}: {
  item: MediaItem;
  index: number;
  onRemove: (i: number) => void;
}) => {
  if (item.type === "image") {
    return (
      <View style={styles.mediaWrapper}>
        <Image
          source={{ uri: item.uri }}
          style={styles.media}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => onRemove(index)}
        >
          <X size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  const player = useVideoPlayer(item.uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={styles.mediaWrapper}>
      <VideoView
        player={player}
        style={styles.media}
        contentFit="cover"
        allowsFullscreen={false}
      />
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => onRemove(index)}
      >
        <X size={14} color="#fff" />
      </TouchableOpacity>
      <View style={styles.videoTag}>
        <VideoIcon size={12} color="#fff" />
      </View>
    </View>
  );
};

const CreatePostScreen = () => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [scope, setScope] = useState<Scope>("public");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showScopeModal, setShowScopeModal] = useState(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    UserService.getInstance().getMe().then(setUser);
  }, []);

  const showAlert = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setAlertConfig({ visible: true, type, title, message });
  };

  const handlePickMedia = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!res.canceled) {
      const selected: MediaItem[] = res.assets.map((item) => ({
        uri: item.uri,
        type: item.type === "video" ? "video" : "image",
      }));
      setMedia((prev) => [...prev, ...selected]);
    }
  };

  const handleSubmitPost = async () => {
    if (!content.trim() && media.length === 0) {
      showAlert("warning", "Thông báo", "Bạn chưa nhập nội dung bài viết");
      return;
    }
    setLoading(true);
    try {
      const uploader = UploadHelper.getInstance();
      const uploadedMedia = await Promise.all(
        media.map((item, index) =>
          uploader.getMediaObject({
            uri: item.uri,
            type: item.type === "video" ? "video/mp4" : "image/jpeg",
            name: item.type === "video" ? `v_${index}.mp4` : `i_${index}.jpg`,
          } as any)
        )
      );

      const res = await fetch(`${Api.getInstance().baseUrl}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
        },
        body: JSON.stringify({
          text: content,
          privacy: scope.toUpperCase(),
          media: uploadedMedia,
        }),
      });

      if (res.ok) {
        setContent("");
        setMedia([]);
        setScope("public");
        showAlert(
          "success",
          "Thành công",
          "Bài viết đã được chia sẻ lên bảng tin"
        );
      } else {
        throw new Error();
      }
    } catch (error) {
      showAlert(
        "error",
        "Thất bại",
        "Không thể kết nối máy chủ, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  const CurrentScope =
    SCOPE_OPTIONS.find((o) => o.id === scope) || SCOPE_OPTIONS[0];
  const canPost = content.trim().length > 0 || media.length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.root}
    >
      <CustomHeader>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerAction}
          >
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo bài viết</Text>
          <TouchableOpacity
            onPress={handleSubmitPost}
            disabled={loading || !canPost}
            style={[styles.postBtn, canPost && styles.postBtnActive]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.blue[500]} />
            ) : (
              <Text
                style={[
                  styles.postBtnText,
                  canPost && { color: Colors.blue[600] },
                ]}
              >
                Đăng
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </CustomHeader>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.userInfoRow}>
          <Image
            source={{
              uri:
                user?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${user?.name}`,
            }}
            style={styles.userAvatar}
          />
          <View style={styles.userMeta}>
            <Text style={styles.userName}>{user?.name || "Người dùng"}</Text>
            <TouchableOpacity
              style={styles.scopeSelector}
              onPress={() => setShowScopeModal(true)}
            >
              <View style={{display:'flex', flexDirection:'row', alignItems:'center', gap:4}}>
                <CurrentScope.Icon size={12} color="#65676B" />
                <Text style={styles.scopeText}>{CurrentScope.label}</Text>
              </View>

              <ChevronDown size={12} color="#65676B" />
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Bạn đang nghĩ gì?"
          placeholderTextColor="#8E8E93"
          multiline
          value={content}
          onChangeText={setContent}
        />

        {media.length > 0 && (
          <View style={styles.mediaGrid}>
            {media.map((item, index) => (
              <MediaPreviewItem
                key={index}
                item={item}
                index={index}
                onRemove={(i) =>
                  setMedia((m) => m.filter((_, idx) => idx !== i))
                }
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.toolbar}>
        <Text style={styles.addText}>Thêm vào bài viết</Text>
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            onPress={handlePickMedia}
            style={styles.toolbarIcon}
          >
            <ImagePlus size={24} color="#45BD62" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => setShowScopeModal(true)}
          >
            <CurrentScope.Icon size={24} color={Colors.blue[500]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* CUSTOM SCOPE MODAL */}
      <Modal visible={showScopeModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowScopeModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <Text style={styles.modalHeaderTitle}>Ai có thể xem bài viết?</Text>
            <View style={styles.optionList}>
              {SCOPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionItem,
                    scope === opt.id && styles.optionItemActive,
                  ]}
                  onPress={() => {
                    setScope(opt.id as Scope);
                    setShowScopeModal(false);
                  }}
                >
                  <View style={styles.optionLeft}>
                    <View style={styles.optionIconBox}>
                      <opt.Icon size={18} color="#1C1E21" />
                    </View>
                    <View>
                      <Text style={styles.optionLabel}>{opt.label}</Text>
                      <Text style={styles.optionDesc}>{opt.desc}</Text>
                    </View>
                  </View>
                  {scope === opt.id && (
                    <Check size={20} color={Colors.blue[500]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CUSTOM ALERT MODAL - SIÊU ĐẸP */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View
              style={[
                styles.alertIconCircle,
                {
                  backgroundColor:
                    alertConfig.type === "success"
                      ? "#ECFDF5"
                      : alertConfig.type === "error"
                      ? "#FEF2F2"
                      : "#FFFBEB",
                },
              ]}
            >
              {alertConfig.type === "success" && (
                <CheckCircle2 size={32} color="#10B981" />
              )}
              {alertConfig.type === "error" && (
                <AlertCircle size={32} color="#EF4444" />
              )}
              {alertConfig.type === "warning" && (
                <AlertCircle size={32} color="#F59E0B" />
              )}
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity
              style={[
                styles.alertBtn,
                {
                  backgroundColor:
                    alertConfig.type === "success"
                      ? "#10B981"
                      : alertConfig.type === "error"
                      ? "#EF4444"
                      : "#F59E0B",
                },
              ]}
              onPress={() => {
                setAlertConfig({ ...alertConfig, visible: false });
                if (alertConfig.type === "success") router.back();
              }}
            >
              <Text style={styles.alertBtnText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  headerAction: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  postBtn: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 60,
    alignItems: "center",
  },
  postBtnActive: { backgroundColor: "#FFF" },
  postBtnText: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "700",
    fontSize: 14,
  },
  userInfoRow: { flexDirection: "row", padding: 16, alignItems: "center" },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F2F5",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  userMeta: { marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: "700", color: "#1C1E21" },
  scopeSelector: {
    width:120,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    gap: 6,
  },
  scopeText: { fontSize: 12, fontWeight: "600", color: "#65676B" },
  input: {
    fontSize: 18,
    color: "#1C1E21",
    paddingHorizontal: 16,
    minHeight: 120,
    textAlignVertical: "top",
    lineHeight: 26,
    marginTop: 10,
  },
  mediaGrid: { flexDirection: "row", flexWrap: "wrap", padding: 8 },
  mediaWrapper: { width: "33.33%", aspectRatio: 1, padding: 3 },
  media: { width: "100%", height: "100%", borderRadius: 12 },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  videoTag: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
    borderRadius: 6,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderTopColor: "#EFEFEF",
    backgroundColor: "#fff",
  },
  addText: { fontSize: 15, fontWeight: "600", color: "#65676B" },
  toolbarActions: { flexDirection: "row", gap: 18 },
  toolbarIcon: { padding: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalIndicator: {
    width: 36,
    height: 4,
    backgroundColor: "#E4E6EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeaderTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#050505",
    textAlign: "center",
    marginBottom: 24,
  },
  optionList: { gap: 14 },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F7F8FA",
  },
  optionItemActive: {
    backgroundColor: "#E7F3FF",
    borderWidth: 1,
    borderColor: Colors.blue[500],
  },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  optionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E4E6EB",
    justifyContent: "center",
    alignItems: "center",
  },
  optionLabel: { fontSize: 16, fontWeight: "700", color: "#050505" },
  optionDesc: { fontSize: 13, color: "#65676B", marginTop: 2 },

  // CẢI TIẾN ALERT STYLE
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    backgroundColor: "#FFF",
    width: "80%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  alertIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  alertBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  alertBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
