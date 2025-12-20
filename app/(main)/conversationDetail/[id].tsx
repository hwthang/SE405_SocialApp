import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";

import ChatHeader from "@/component/message/ChatHeader";
import InputBar from "@/component/message/InputBar";
import MessageList from "@/component/message/MessageList";

import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import UploadHelper from "@/helper/UploadHelper";

/* ================= TYPES ================= */
type MessageType = {
  id: string;
  text?: string;
  image?: string;
  audio?: string;
  isMe: boolean;
  reaction?: string;
};

/* ================= SCREEN ================= */
export default function ChatDetailScreen() {
  const router = useRouter();
  const { id: conversationId } = useLocalSearchParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [typing, setTyping] = useState(false);

  /* =====================================================
   * 📌 API: FETCH MESSAGE LIST
   * ===================================================== */
  const fetchMessages = async () => {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();

      const res = await fetch(
        `${Api.getInstance().baseUrl}/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const json = await res.json();

      const formatted: MessageType[] = json.data.map((m: any) => ({
        id: m.id,
        text: m.type === "TEXT" ? m.content : undefined,
        image: m.type === "IMAGE" ? m.mediaUrl : undefined,
        audio: m.type === "FILE" ? m.mediaUrl : undefined,
        isMe: m.senderId === json.meId,
        reaction: m.reaction,
      }));

      setMessages(formatted);
    } catch (err) {
      console.error("❌ fetchMessages error:", err);
    }
  };

  /* =====================================================
   * 📌 API: SEND MESSAGE (CORE)
   * ===================================================== */
  const sendMessage = async (payload: {
    type: "TEXT" | "IMAGE" | "FILE";
    content?: string;
    mediaUrl?: string;
    replyToMessageId?: string;
  }) => {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();

      await fetch(`${Api.getInstance().baseUrl}/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          type: payload.type,
          content: payload.content,
          mediaUrl: payload.mediaUrl,
          replyToMessageId: payload.replyToMessageId,
        }),
      });
    } catch (err) {
      console.error("❌ sendMessage error:", err);
    }
  };

  /* =====================================================
   * 📌 LOAD MESSAGE
   * ===================================================== */
  useEffect(() => {
    // fetchMessages(); // bật khi API ready
  }, []);

  /* ================= HANDLERS ================= */

  // 🔹 SEND TEXT
  const handleSend = async () => {
    if (!message.trim()) return;

    const tempId = String(Date.now());

    // Optimistic UI
    setMessages((prev) => [
      ...prev,
      { id: tempId, text: message, isMe: true },
    ]);

    await sendMessage({
      type: "TEXT",
      content: message,
    });

    setMessage("");
    setTyping(true);
    setTimeout(() => setTyping(false), 1000);
  };

  // 🔹 SEND IMAGE (Cloudinary)
  const handleSendImage = async (file: any) => {
    try {
      const media = await UploadHelper
        .getInstance()
        .getMediaObject(file);

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          image: media.url,
          isMe: true,
        },
      ]);

      await sendMessage({
        type: "IMAGE",
        mediaUrl: media.url,
      });
    } catch (err) {
      console.error("❌ handleSendImage error:", err);
    }
  };

  // 🔹 SEND VOICE / AUDIO
  const handleRecordVoice = async (file: any) => {
    try {
      const media = await UploadHelper
        .getInstance()
        .getMediaObject(file);

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          audio: media.url,
          isMe: true,
        },
      ]);

      await sendMessage({
        type: "FILE",
        mediaUrl: media.url,
      });
    } catch (err) {
      console.error("❌ handleRecordVoice error:", err);
    }
  };

  const handleDelete = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleReply = (msg: MessageType) => {
    if (msg.text) setMessage(msg.text + " ");
    if (msg.image) setMessage("[Hình ảnh] ");
    if (msg.audio) setMessage("[Voice] ");
  };

  const handleReact = (id: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, reaction: emoji } : m
      )
    );
  };

  /* ================= RENDER ================= */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f8f8f8", marginBottom: 40 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ChatHeader
        name="Nguyễn Văn A"
        avatar="https://i.pravatar.cc/150?img=1"
        onBack={() => router.back()}
      />

      <View style={{ flex: 1 }}>
        <MessageList
          messages={messages}
          typing={typing}
          onDelete={handleDelete}
          onReply={handleReply}
          onReact={handleReact}
        />
      </View>

      <InputBar
        value={message}
        onChange={setMessage}
        onSend={handleSend}
        onTyping={setTyping}
        onSendImage={handleSendImage}
        onRecordVoice={handleRecordVoice}
      />
    </KeyboardAvoidingView>
  );
}
