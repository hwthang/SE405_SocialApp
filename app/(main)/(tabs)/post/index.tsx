import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import { Globe, ImagePlus, Lock, Send, Users, Video as VideoIcon, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ---- Types ----
type MediaType = "image" | "video";

interface MediaItem {
  uri: string;
  type: MediaType;
}

type Scope = "public" | "friends" | "private";

// ---- Media preview item (ảnh + video) ----
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
        <Image source={{ uri: item.uri }} style={styles.media} resizeMode="cover" />

        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
          <X size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  // Video preview (mute + loop)
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

      <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
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

  // Chọn media từ thư viện
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

  const handleSubmitPost = () => {
    console.log("New post:", { content, media, scope });
    // TODO: call API create post
  };

  const scopeLabel = {
    public: "Công khai",
    friends: "Bạn bè",
    private: "Chỉ mình tôi",
  }[scope];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Tạo bài viết</Text>

      {/* Scope selector */}
      <View style={styles.scopeRow}>
        <Text style={styles.scopeLabel}>Chế độ hiển thị:</Text>
        <View style={styles.scopeButtonsRow}>
          <TouchableOpacity
            style={[
              styles.scopeButton,
              scope === "public" && styles.scopeButtonActive,
            ]}
            onPress={() => setScope("public")}
          >
            <Globe
              size={16}
              strokeWidth={2}
              color={scope === "public" ? "#007AFF" : "#444"}
            />
            <Text
              style={[
                styles.scopeButtonText,
                scope === "public" && styles.scopeButtonTextActive,
              ]}
            >
              Công khai
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.scopeButton,
              scope === "friends" && styles.scopeButtonActive,
            ]}
            onPress={() => setScope("friends")}
          >
            <Users
              size={16}
              strokeWidth={2}
              color={scope === "friends" ? "#007AFF" : "#444"}
            />
            <Text
              style={[
                styles.scopeButtonText,
                scope === "friends" && styles.scopeButtonTextActive,
              ]}
            >
              Bạn bè
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.scopeButton,
              scope === "private" && styles.scopeButtonActive,
            ]}
            onPress={() => setScope("private")}
          >
            <Lock
              size={16}
              strokeWidth={2}
              color={scope === "private" ? "#007AFF" : "#444"}
            />
            <Text
              style={[
                styles.scopeButtonText,
                scope === "private" && styles.scopeButtonTextActive,
              ]}
            >
              Riêng tư
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Caption input */}
      <TextInput
        style={styles.input}
        placeholder={`Bạn đang nghĩ gì? (${scopeLabel})`}
        placeholderTextColor="#999"
        multiline
        value={content}
        onChangeText={setContent}
      />

      {/* Media preview */}
      {media.length > 0 && (
        <View style={styles.mediaContainer}>
          <FlatList
            data={media}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <MediaPreviewItem item={item} index={index} onRemove={removeMedia} />
            )}
          />
        </View>
      )}

      {/* Add media button */}
      <TouchableOpacity style={styles.pickBtn} onPress={handlePickMedia}>
        <ImagePlus size={20} color="#007AFF" />
        <Text style={styles.pickText}>Thêm ảnh/video</Text>
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitPost}>
        <Send size={18} color="#fff" />
        <Text style={styles.submitText}>Đăng bài</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreatePostScreen;

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

  // Scope
  scopeRow: {
    marginBottom: 8,
  },
  scopeLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  scopeButtonsRow: {
    flexDirection: "row",
    gap: 6,
  },
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
  scopeButtonText: {
    fontSize: 12,
    color: "#444",
  },
  scopeButtonTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },

  input: {
    minHeight: 120,
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    color: "#222",
    textAlignVertical: "top",
    marginTop: 8,
  },

  // Media preview grid
  mediaContainer: {
    marginTop: 16,
  },
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
    zIndex: 10,
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
  pickText: {
    fontSize: 16,
    color: "#007AFF",
  },

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
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
