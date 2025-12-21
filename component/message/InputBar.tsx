import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import UploadHelper from "@/helper/UploadHelper";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, Send, XCircle } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
type Props = {
  conversationId: string;
  onMessageSent?: (msg: any) => void;
  replyingMessage?: any;
  onCancelReply?: () => void;
};

const InputBar = ({ conversationId, onMessageSent, replyingMessage, onCancelReply }: Props) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const sendText = async () => {
    if (!text.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(`${Api.getInstance().baseUrl}/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
        },
        body: JSON.stringify({
          type: "TEXT",
          content: text.trim(),
          replyToMessageId: replyingMessage?.id, // Gửi kèm ID tin nhắn reply nếu có
        }),
      });
      const json = await res.json();
      onMessageSent?.(json.data);
      setText("");
    } catch (e) {
      Alert.alert("Lỗi", "Không gửi được tin nhắn");
    } finally {
      setLoading(false);
    }
  };

   const pickMedia = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
    });

    if (res.canceled) return;

    try {
      setLoading(true);

      const asset = res.assets[0];

      const file = {
        uri: asset.uri,
        type: asset.type === "video" ? "video/mp4" : "image/jpeg",
        name: asset.type === "video" ? "video.mp4" : "image.jpg",
      } as any;

      const uploader = UploadHelper.getInstance();
      const media = await uploader.getMediaObject(file);

      const resMsg = await fetch(
        `${Api.getInstance().baseUrl}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
          },
          body: JSON.stringify({
            type: media.type =="VIDEO" ? "FILE" : media.type,
            mediaUrl: media.url,
          }),
        }
      );

      const json = await resMsg.json();
      console.log(json)
      onMessageSent?.(json.data);
    } catch (e) {
      Alert.alert("Lỗi", "Không gửi được media");
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      {/* UI Trả lời tin nhắn */}
      {replyingMessage && (
        <View style={styles.replyBar}>
          <View style={styles.replyLine} />
          <View style={{ flex: 1 }}>
            <Text style={styles.replyName}>Đang trả lời tin nhắn</Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {replyingMessage.content || "[Phương tiện]"}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply}>
            <XCircle size={20} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity onPress={pickMedia} style={{ padding: 4 }}>
          <ImagePlus size={24} color={Colors.blue[500]} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Nhắn tin..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity onPress={sendText} disabled={loading} style={styles.sendBtn}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#eee" },
  replyBar: { flexDirection: "row", padding: 10, backgroundColor: "#f8f9fa", alignItems: "center", gap: 10 },
  replyLine: { width: 3, height: "100%", backgroundColor: Colors.blue[500], borderRadius: 2 },
  replyName: { fontSize: 12, fontWeight: "bold", color: Colors.blue[500] },
  replyText: { fontSize: 13, color: "#666" },
  inputRow: { flexDirection: "row", alignItems: "center", padding: 10, gap: 8 },
  input: { flex: 1, maxHeight: 100, minHeight: 40, paddingHorizontal: 15, backgroundColor: "#f1f1f1", borderRadius: 20 },
  sendBtn: { backgroundColor: Colors.blue[500], width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
});

export default InputBar;