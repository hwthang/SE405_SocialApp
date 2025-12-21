import ChatHeader from "@/component/message/ChatHeader";
import InputBar from "@/component/message/InputBar";
import MessageBubble from "@/component/message/MessageBubble";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Keyboard, View } from "react-native";

const ChatScreenDetail = () => {
  const { id } = useLocalSearchParams();

  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [myId, setMyId] = useState<string>("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [replyingMessage, setReplyingMessage] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // ================= 1. KHỞI TẠO DỮ LIỆU =================
  useEffect(() => {
    const init = async () => {
      const userId = await AuthHelper.getInstance().getUserId();
      setMyId(userId as string);

      const conv = await fetchConversation();
      
      if (conv) {
        await fetchMessages(conv.members, userId as string);
      }
    };
    init();
  }, [id]);

  // ================= 2. CÁC HÀM FETCH DỮ LIỆU =================
  const fetchConversation = async () => {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      const res = await fetch(`${Api.getInstance().baseUrl}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const conv = data?.data?.find((i: any) => i.id === id);
      
      if (conv) {
        setCurrentConversation(conv);
        return conv;
      }
    } catch (error) {
      console.error("Fetch conversation error:", error);
    }
    return null;
  };

  const fetchMessages = async (convMembers: any[], currentUserId: string) => {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      const res = await fetch(
        `${Api.getInstance().baseUrl}/conversations/${id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      const rawItems = data?.data?.items;
      if (!rawItems) return;

      const memberMap: Record<string, any> = {};
      convMembers.forEach((m: any) => {
        memberMap[m.userId] = m.user;
      });

      const formatted = rawItems
        .filter((i: any) => !i.deletedAt)
        .map((i: any) => {
          const sender = memberMap[i.senderId];
          return {
            id: i.id,
            createdAt: i.createdAt,
            senderId: i.senderId,
            senderName: sender?.name || "Người dùng",
            senderAvatar: sender?.avatarUrl,
            type: i.type,
            content: i.content,
            mediaUrl: i.mediaUrl,
            parentMessageId: i.replyToMessageId,
            myReaction: i.reactions?.length > 0 ? i.reactions[0].type : null,
            reads: i.reads || [], // Lưu lại mảng reads để check trạng thái đã đọc
          };
        })
        .sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setMessages(formatted);

      // SAU KHI FETCH XONG -> ĐÁNH DẤU ĐÃ ĐỌC
      markAllAsRead(rawItems, currentUserId, token as string);

    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  };

  // Hàm gọi API đánh dấu đã đọc cho các tin nhắn của đối phương gửi mà mình chưa đọc
  const markAllAsRead = async (items: any[], currentUserId: string, token: string) => {
    try {
      // Lọc ra các tin nhắn: không phải do mình gửi VÀ mình chưa nằm trong mảng reads
      const unreadMessages = items.filter((msg: any) => {
        const isMe = msg.senderId === currentUserId;
        const iHaveRead = msg.reads?.some((r: any) => r.userId === currentUserId);
        return !isMe && !iHaveRead;
      });

      if (unreadMessages.length === 0) return;

      // Gọi API cho từng tin nhắn chưa đọc
      await Promise.all(
        unreadMessages.map((msg: any) =>
          fetch(`${Api.getInstance().baseUrl}/messages/${msg.id}/read`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      
      console.log(`✅ Đã đánh dấu đọc ${unreadMessages.length} tin nhắn.`);
    } catch (error) {
      console.warn("Mark as read error:", error);
    }
  };

  // ================= 3. XỬ LÝ ACTIONS (TIN NHẮN) =================
  const handleReact = async (messageId: string, reaction: string) => {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      const res = await fetch(
        `${Api.getInstance().baseUrl}/messages/${messageId}/reactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: reaction }),
        }
      );
      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, myReaction: reaction } : msg
          )
        );
      }
    } finally {
      setActiveActionId(null);
    }
  };

  const handleUnreact = async (messageId: string) => {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      const res = await fetch(
        `${Api.getInstance().baseUrl}/messages/${messageId}/unreact`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, myReaction: null } : msg
          )
        );
      }
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      const res = await fetch(
        `${Api.getInstance().baseUrl}/messages/${messageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    } finally {
      setActiveActionId(null);
    }
  };

  const handleReply = (message: any) => {
    setReplyingMessage(message);
    setActiveActionId(null);
  };

  // ================= 4. LISTENERS & HELPERS =================
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const conversationUI = useMemo(() => {
    if (!currentConversation) return null;
    const isDirect = currentConversation.type === "DIRECT";
    const otherUser = currentConversation.members.find((m: any) => m.userId !== myId)?.user;
    return {
      title: isDirect ? otherUser?.name : currentConversation.title,
      avatar: isDirect ? otherUser?.avatarUrl : undefined,
      isOnline: isDirect ? otherUser?.isOnline : false,
    };
  }, [currentConversation, myId]);

  if (!currentConversation) return <View style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ChatHeader
        title={conversationUI?.title}
        avatar={conversationUI?.avatar}
        isOnline={conversationUI?.isOnline}
      />

      <FlatList
        inverted
        ref={flatListRef}
        data={messages}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
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
            onUnreact={() => handleUnreact(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
      />

      <View style={{ paddingBottom: keyboardHeight, marginBottom: 48 }}>
        <InputBar
          conversationId={id as string}
          replyingMessage={replyingMessage}
          onCancelReply={() => setReplyingMessage(null)}
          onMessageSent={(newMsg) => {
            setMessages((prev) => [
              { ...newMsg, parentMessageId: replyingMessage?.id },
              ...prev,
            ]);
            setReplyingMessage(null);
          }}
        />
      </View>
    </View>
  );
};

export default ChatScreenDetail;