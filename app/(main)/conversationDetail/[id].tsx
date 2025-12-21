import ChatHeader from "@/component/message/ChatHeader";
import InputBar from "@/component/message/InputBar";
import MessageBubble from "@/component/message/MessageBubble";
import { AuthHelper } from "@/helper/AuthHelper";
import SocketHelper from "@/helper/SocketHelper";
import { ConversationService } from "@/service/ConversationService";
import { useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FlatList, Keyboard, View } from "react-native";

const ChatScreenDetail = () => {
  const { id } = useLocalSearchParams();
  const service = ConversationService.getInstance();

  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [myId, setMyId] = useState<string>("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [replyingMessage, setReplyingMessage] = useState<any>(null);

  const membersRef = useRef<any[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // --- LOGIC KHỞI TẠO ---
  const initChat = useCallback(async () => {
    const userId = await AuthHelper.getInstance().getUserId();
    setMyId(userId as string);

    // Lấy thông tin conversation từ list (hoặc viết thêm hàm fetch 1 conv trong service)
    const convs = await service.fetchAll();
    const conv = convs.find((c: { id: string | string[]; }) => c.id === id);

    if (conv) {
      setCurrentConversation(conv);
      membersRef.current = conv.members;
      const msgs = await service.fetchMessages(id as string, conv.members);
      setMessages(msgs);
      service.markAsRead(msgs, userId as string);
    }
  }, [id]);

  useEffect(() => {
    initChat();
    SocketHelper.onNewNotification(initChat);
    return () => SocketHelper.removeListener("notification:new", initChat);
  }, [initChat]);

  // --- ACTIONS ---
  const handleReact = async (messageId: string, reaction: string) => {
    const res = await service.reactToMessage(messageId, reaction);
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, myReaction: reaction } : m
        )
      );
    }
    setActiveActionId(null);
  };

  const handleDelete = async (messageId: string) => {
    const res = await service.deleteMessage(messageId);
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
    setActiveActionId(null);
  };

  // --- UI HELPERS ---
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardHeight(0)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const conversationUI = useMemo(() => {
    if (!currentConversation) return null;
    const isDirect = currentConversation.type === "DIRECT";
    const otherUser = currentConversation.members?.find(
      (m: any) => m.userId !== myId
    )?.user;
    return {
      title: isDirect ? otherUser?.name : currentConversation.name,
      avatar: isDirect ? otherUser?.avatarUrl : currentConversation.avatar,
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
        renderItem={({ item }) => (
          <MessageBubble
            item={item}
            messages={messages}
            myId={myId}
            isActive={activeActionId === item.id}
            onOpen={() => setActiveActionId(item.id)}
            onClose={() => setActiveActionId(null)}
            onReact={handleReact}
            onReply={setReplyingMessage}
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
            const sender = membersRef.current.find(
              (m) => m.userId === myId
            )?.user;
            const optimisticMsg = {
              ...newMsg,
              senderName: sender?.name || "Bạn",
              senderAvatar: sender?.avatarUrl,
              parentMessageId: replyingMessage?.id,
            };
            setMessages((prev) => [optimisticMsg, ...prev]);
            setReplyingMessage(null);
          }}
        />
      </View>
    </View>
  );
};

export default ChatScreenDetail;
