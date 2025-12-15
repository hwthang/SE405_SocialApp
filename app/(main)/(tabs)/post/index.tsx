import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Globe,
  ImagePlus,
  Lock,
  Send,
  Users,
  Video as VideoIcon,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import UploadHelper from "@/helper/UploadHelper";

// ---- Types ----
type MediaType = "image" | "video";

interface MediaItem {
  uri: string;
  type: MediaType;
}

type Scope = "public" | "friends" | "private";

// ---- Media preview item ----
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
          <X size={16} color="#fff" />
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
        allowsPictureInPicture={false}
      />

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => onRemove(index)}
      >
        <X size={16} color="#fff" />
      </TouchableOpacity>

      <View style={styles.videoTag}>
        <VideoIcon size={14} color="#fff" />
      </View>
    </View>
  );
};

const CreatePostScreen = () => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [scope, setScope] = useState<Scope>("public");
  const [loading, setLoading] = useState(false);

  // ---- Pick media ----
  const handlePickMedia = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!res.canceled) {
      const selected: MediaItem[] = res.assets.map((item) => ({
        uri: item.uri,
        type: item.type === "video" ? "video" : "image",
      }));

      setMedia((prev) => [...prev, ...selected]);
    }
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // ---- Convert Expo asset → file upload ----
  const buildUploadFile = (item: MediaItem, index: number) => {
    const isVideo = item.type === "video";

    return {
      uri: item.uri,
      type: isVideo ? "video/mp4" : "image/jpeg",
      name: isVideo ? `video_${index}.mp4` : `image_${index}.jpg`,
    } as any;
  };

  // ---- Submit post ----
  const handleSubmitPost = async () => {
    try {
      if (!content.trim() && media.length === 0) {
        Alert.alert("Thông báo", "Nội dung hoặc media không được trống");
        return;
      }

      setLoading(true);

      const uploader = UploadHelper.getInstance();

      // 1. Upload media
      const uploadedMedia = await Promise.all(
        media.map((item, index) =>
          uploader.getMediaObject(buildUploadFile(item, index))
        )
      );

      console.log({
        text: content,
        privacy: scope.toUpperCase(),
        media: uploadedMedia,
      });
      const auth = AuthHelper.getInstance();
      // 2. Call API create post
      const res = await fetch(`${Api.getInstance().baseUrl}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await auth.getAccessToken()}`,
        },
        body: JSON.stringify({
          text: content,
          privacy: scope.toUpperCase(),
          media: uploadedMedia,
        }),
      });

      if (!res.ok) {
        throw new Error("Create post failed");
      }

      // 3. Reset
      setContent("");
      setMedia([]);
      setScope("public");

      Alert.alert("Thành công", "Bài viết đã được đăng");
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể đăng bài");
    } finally {
      setLoading(false);
    }
  };

  const scopeLabel = {
    public: "Công khai",
    friends: "Bạn bè",
    private: "Chỉ mình tôi",
  }[scope];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Tạo bài viết</Text>

      {/* Scope */}
      <View style={styles.scopeRow}>
        <Text style={styles.scopeLabel}>Chế độ hiển thị:</Text>
        <View style={styles.scopeButtonsRow}>
          {[
            { key: "public", label: "Công khai", Icon: Globe },
            { key: "friends", label: "Bạn bè", Icon: Users },
            { key: "private", label: "Riêng tư", Icon: Lock },
          ].map(({ key, label, Icon }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.scopeButton,
                scope === key && styles.scopeButtonActive,
              ]}
              onPress={() => setScope(key as Scope)}
            >
              <Icon size={16} color={scope === key ? "#007AFF" : "#444"} />
              <Text
                style={[
                  styles.scopeButtonText,
                  scope === key && styles.scopeButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Caption */}
      <TextInput
        style={styles.input}
        placeholder={`Bạn đang nghĩ gì? (${scopeLabel})`}
        placeholderTextColor="#999"
        multiline
        value={content}
        onChangeText={setContent}
      />

      {/* Media */}
      {media.length > 0 && (
        <View style={styles.mediaContainer}>
          <FlatList
            data={media}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <MediaPreviewItem
                item={item}
                index={index}
                onRemove={removeMedia}
              />
            )}
          />
        </View>
      )}

      {/* Pick media */}
      <TouchableOpacity style={styles.pickBtn} onPress={handlePickMedia}>
        <ImagePlus size={20} color="#007AFF" />
        <Text style={styles.pickText}>Thêm ảnh/video</Text>
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.6 }]}
        onPress={handleSubmitPost}
        disabled={loading}
      >
        <Send size={18} color="#fff" />
        <Text style={styles.submitText}>
          {loading ? "Đang đăng..." : "Đăng bài"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreatePostScreen;

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  scopeRow: { marginBottom: 8 },
  scopeLabel: { fontSize: 13, color: "#555", marginBottom: 4 },
  scopeButtonsRow: { flexDirection: "row", gap: 6 },

  scopeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 4,
  },
  scopeButtonActive: {
    borderColor: "#007AFF33",
    backgroundColor: "#E5F0FF",
  },
  scopeButtonText: { fontSize: 12, color: "#444" },
  scopeButtonTextActive: { color: "#007AFF", fontWeight: "600" },

  input: {
    minHeight: 120,
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    color: "#222",
    marginTop: 8,
  },

  mediaContainer: { marginTop: 16 },
  mediaWrapper: {
    width: "33%",
    aspectRatio: 1,
    padding: 4,
    position: "relative",
  },
  media: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#ccc",
  },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 4,
    borderRadius: 20,
  },
  videoTag: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  pickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 18,
    padding: 10,
  },
  pickText: { fontSize: 16, color: "#007AFF" },

  submitBtn: {
    marginTop: 24,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
