import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import ConversationItem from "@/component/message/ConversationItem";
import CreateGroupModal from "@/component/message/CreateGroupModal";
import SearchBar from "@/component/message/SearchBar";
import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import SocketHelper from "@/helper/SocketHelper";
import { getRelativeTimeFromISO } from "@/utils/date";
import Toast from "react-native-toast-message";

type Conversation = {
  id: string;
  name: string;
  avatar: string | null;
  lastMessage?: string;
  time?: string;
  isOnline?: boolean;
  isUnread?: boolean;
  type: "DIRECT" | "GROUP";
};

export default function ConversationScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);

  // ================= 1. FETCH DATA =================
  const fetchConversations = async () => {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      const myUserId = await AuthHelper.getInstance().getUserId();

      const res = await fetch(`${Api.getInstance().baseUrl}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!result?.data) return;

      const formatted = await Promise.all(
        result.data.map(async (conv: any) => {
          const isGroup = conv.type === "GROUP";

          // Fetch tin nhắn mới nhất để lấy field "reads"
          const msgRes = await fetch(
            `${Api.getInstance().baseUrl}/conversations/${conv.id}/messages`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const msgData = await msgRes.json();
          const last = msgData?.data?.items?.[0];

          const directUser = !isGroup
            ? conv.members.find((m: any) => m.userId !== myUserId)?.user
            : null;

          let text = "Hãy bắt đầu trò chuyện nào";
          let isUnread = false;

          if (last && !last.deletedAt) {
            const isMe = last.senderId === myUserId;

            // Logic Unread
            if (!isMe) {
              const hasRead = last.reads?.some((r: any) => r.userId === myUserId);
              if (!hasRead) isUnread = true;
            }

            const senderName = isGroup
              ? conv.members.find((m: any) => m.userId === last.senderId)?.user?.name ?? "Ai đó"
              : "";

            if (last.type === "TEXT") text = last.content ?? "";
            else if (last.type === "IMAGE") text = "đã gửi một hình ảnh";
            else if (last.type === "FILE") text = "đã gửi một tệp";

            if (isGroup) text = `${isMe ? "Bạn" : senderName}: ${text}`;
            else if (isMe) text = `Bạn: ${text}`;
          }

          return {
            id: conv.id,
            name: isGroup ? (conv.title ?? "Nhóm chat") : (directUser?.name ?? "Unknown"),
            avatar: isGroup ? (conv.avatar ?? null) : (directUser?.avatarUrl ?? null),
            isOnline: isGroup ? false : (directUser?.isOnline ?? false),
            lastMessage: text,
            time: last?.createdAt || conv.updatedAt,
            type: conv.type,
            isUnread,
          };
        })
      );

      setConversations(formatted.sort((a, b) => new Date(b.time!).getTime() - new Date(a.time!).getTime()));
    } catch (e) {
      console.error("fetchConversations error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ================= 2. LIFECYCLE & SOCKET =================
  useEffect(() => {
    fetchConversations();

    // Đăng ký Socket Listener
    SocketHelper.onNewNotification((data) => {
      console.log("📩 Socket Received:", data);
      Toast.show({type:'info', text1:data.type, text2: data.userId})

      if (data.type === "NEW_MESSAGE") {
        setConversations((prevList) => {
          const index = prevList.findIndex((c) => c.id === data.conversationId);

          if (index !== -1) {
            const newList = [...prevList];
            const currentConv = newList[index];
            
            // Format tin nhắn hiển thị theo type (Direct/Group)
            let displayContent = data.content;
            if (currentConv.type === "GROUP") {
              displayContent = `${data.senderName || "Ai đó"}: ${data.content}`;
            }

            newList[index] = {
              ...currentConv,
              lastMessage: displayContent,
              time: new Date().toISOString(),
              isUnread: true,
            };

            const [updatedItem] = newList.splice(index, 1);
            return [updatedItem, ...newList];
          } else {
            // Nếu hội thoại mới hoàn toàn thì fetch lại
            fetchConversations();
            return prevList;
          }
        });
      }
    });

    return () => {
      SocketHelper.removeListener("notification:new");
    };
  }, []);

  // ================= 3. SEARCH LOGIC =================
  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    return conversations.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={Colors.blue[500]} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* HEADER SEARCH & ADD */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 10 }}>
        <View style={{ flex: 1 }}>
          <SearchBar value={search} onChange={setSearch} />
        </View>
        <Pressable
          onPress={() => setOpenModal(true)}
          style={{
            backgroundColor: Colors.blue[500],
            borderRadius: 24,
            height: 48,
            width: 48,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 28, color: "white" }}>＋</Text>
        </Pressable>
      </View>

      {/* CONVERSATION LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchConversations(); }} 
          />
        }
        renderItem={({ item }) => (
          <ConversationItem
            {...item}
            time={item.time ? getRelativeTimeFromISO(item.time) : ""}
            onPress={() =>
              router.push({
                pathname: "/(main)/conversationDetail/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
      />

      <CreateGroupModal
        visible={openModal}
        onClose={() => setOpenModal(false)}
        friends={friends}
        loading={false}
      />
    </View>
  );
}