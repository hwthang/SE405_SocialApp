import ChatHeader from "@/component/message/ChatHeader";
import InputBar from "@/component/message/InputBar";
import MessageBubble from "@/component/message/MessageBubble";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Keyboard, View } from "react-native";

const ChatScreenDetail = () => {
  const { id } = useLocalSearchParams();

  const [members, setMembers] = useState<any[]>([]);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [myId, setMyId] = useState<string>("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [replyingMessage, setReplyingMessage] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // ================= HANDLE ACTIONS =================

  // 1. Hàm xử lý thả cảm xúc (React)
  const handleReact = async (messageId: string, reaction: string) => {
    try {
      console.log(`🚀 Đang thả ${reaction} cho tin nhắn: ${messageId}`);

      const token = await AuthHelper.getInstance().getAccessToken();
      const res = await fetch(
        `${Api.getInstance().baseUrl}/messages/${messageId}/reactions`,
        {
          method: "POST", // Hoặc PATCH tùy API của bạn
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: reaction }),
        }
      );

      if (res.ok) {
        // Cập nhật UI ngay lập tức (Optimistic Update)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, myReaction: reaction } : msg
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi thả react:", error);
    } finally {
      setActiveActionId(null); // Đóng menu sau khi chọn
    }
  };

  // 2. Hàm xử lý chọn trả lời (Reply)
  const handleReply = (message: any) => {
    console.log("📝 Đang trả lời tin nhắn:", message.id);
    setReplyingMessage(message); // Lưu tin nhắn vào state để hiển thị trên InputBar
    setActiveActionId(null); // Đóng menu action

    // (Tùy chọn) Tự động focus vào ô nhập liệu
    // inputRef.current?.focus();
  };

  // ================= KEYBOARD LISTENER =================
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // ================= HANDLE ACTIONS =================

// 1. Hàm gỡ cảm xúc (Unreact)
const handleUnreact = async (messageId: string) => {
  try {
    const token = await AuthHelper.getInstance().getAccessToken();
    // API Unreact thường dùng DELETE hoặc POST tới endpoint unreact
    const res = await fetch(
      `${Api.getInstance().baseUrl}/messages/${messageId}/unreact`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, myReaction: null } : msg
        )
      );
    }
  } catch (error) {
    console.error("Lỗi khi gỡ react:", error);
  } finally {
    setActiveActionId(null);
  }
};

// 2. Hàm xóa tin nhắn (Delete)
const handleDelete = async (messageId: string) => {
  try {
    const token = await AuthHelper.getInstance().getAccessToken();
    const res = await fetch(
      `${Api.getInstance().baseUrl}/messages/${messageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      // Cách 1: Xóa hẳn khỏi danh sách
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      
      // Cách 2: Nếu muốn hiện chữ "Tin nhắn đã bị thu hồi" như Messenger:
      /*
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, type: "DELETED", content: "Tin nhắn đã bị thu hồi" } : msg
        )
      );
      */
    }
  } catch (error) {
    console.error("Lỗi khi xóa tin nhắn:", error);
  } finally {
    setActiveActionId(null);
  }
};
  // ================= INIT =================
  useEffect(() => {
    const init = async () => {
      const userId = await AuthHelper.getInstance().getUserId();
      setMyId(userId as string);
      await Promise.all([fetchConversation(), fetchMessages()]);
    };
    init();
  }, []);

  // ================= FETCH CONVERSATION =================
  const fetchConversation = async () => {
    const token = await AuthHelper.getInstance().getAccessToken();

    const res = await fetch(`${Api.getInstance().baseUrl}/conversations`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!data?.data) return;

    const conv = data.data.find((i: any) => i.id === id);
    if (!conv) return;

    setCurrentConversation(conv);
    setMembers(
      conv.members
        .filter((m: any) => m.user.id !== myId)
        .map((m: any) => m.user)
    );
  };

  // ================= FETCH MESSAGES =================
  // ... (Các phần import và state giữ nguyên)

  // ================= FETCH MESSAGES =================
  const fetchMessages = async () => {
    const token = await AuthHelper.getInstance().getAccessToken();

    const res = await fetch(
      `${Api.getInstance().baseUrl}/conversations/${id}/messages`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    // console.log(data?.data?.items[0].reactions)
    if (!data?.data?.items) return;

    setMessages(
      data.data.items
        .filter((item: { deletedAt: any; }) => !item.deletedAt).map((i: any) => ({
          id: i.id,
          createdAt: i.createdAt,
          senderId: i.senderId,
          type: i.type,
          content: i.content,
          mediaUrl: i.mediaUrl,
          // 🚀 MAPPING THÊM 2 TRƯỜNG NÀY:
          parentMessageId: i.replyToMessageId, // ID tin nhắn gốc để hiển thị Quote
          myReaction:
            i.reactions && i.reactions.length > 0
              ? i.reactions[0].type // Lấy react đầu tiên (hoặc logic tìm react của chính mình)
              : null,
        }))
        .sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    );
  };

  // ... (Các phần handleReact, handleReply giữ nguyên)

  if (!currentConversation) {
    return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  }

  const isDirect = currentConversation.type === "DIRECT";
  const directUser = members[0];

  // ================= RENDER =================
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingBottom: 50 }}>
      {/* HEADER */}
      <ChatHeader
        title={isDirect ? directUser?.name : currentConversation.title}
        avatar={isDirect ? directUser?.avatar : undefined}
        isOnline={isDirect ? directUser?.isOnline : false}
      />

      {/* MESSAGE LIST */}

     <FlatList
  ref={flatListRef}
  data={messages}
  keyExtractor={(i) => i.id}
  onScrollBeginDrag={() => setActiveActionId(null)}
  renderItem={({ item }) => (
    <MessageBubble
      item={item}
      messages={messages}
      myId={myId}
      isActive={activeActionId === item.id}
      onOpen={() => setActiveActionId(item.id)}
      onClose={() => setActiveActionId(null)}
      onReact={handleReact}
      onReply={handleReply}
      // 🚀 TRUYỀN THÊM 2 HÀM NÀY
      onUnreact={() => handleUnreact(item.id)}
      onDelete={() => handleDelete(item.id)}
    />
  )}
/>

      {/* INPUT BAR – ĐẨY THEO KEYBOARD */}
      <View
        style={{
          paddingBottom: keyboardHeight,
        }}
      >
        <InputBar
          conversationId={id as string}
          replyingMessage={replyingMessage} // Tin nhắn đang được chọn để trả lời
          onCancelReply={() => setReplyingMessage(null)}
          onMessageSent={(newMsg) => {
            // 🚀 TẠO OBJECT TIN NHẮN ĐÃ ĐƯỢC CẬP NHẬT THÔNG TIN REPLY
            const updatedMsg = {
              ...newMsg,
              parentMessageId: replyingMessage?.id, // Gán ID tin nhắn gốc
              // Nếu muốn hiển thị nhanh, bạn có thể map cả object vào:
              // quotedMessage: replyingMessage
            };

            // Cập nhật vào danh sách tin nhắn hiện tại
            setMessages((prev) => [...prev, updatedMsg]);

            // Xóa trạng thái đang reply
            setReplyingMessage(null);

            // Cuộn xuống cuối
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
        />
      </View>
    </View>
  );
};

export default ChatScreenDetail;
