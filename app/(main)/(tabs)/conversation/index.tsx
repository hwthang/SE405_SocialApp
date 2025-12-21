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

  // ================= 1. FETCH ALL CONVERSATIONS =================
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

            if (!isMe) {
              const hasRead = last.reads?.some((r: any) => r.userId === myUserId);
              if (!hasRead) isUnread = true;
            }

            // Lấy tên người gửi thực tế của tin nhắn cuối
            const senderInConv = conv.members.find((m: any) => m.userId === last.senderId);
            const senderName = isMe ? "Bạn" : (senderInConv?.user?.name ?? "Ai đó");

            if (last.type === "TEXT") text = last.content ?? "";
            else if (last.type === "IMAGE") text = "đã gửi một hình ảnh";
            else if (last.type === "FILE") text = "đã gửi một tệp";

            // Luôn hiển thị format: "Người gửi: Nội dung"
            text = `${senderName}: ${text}`;
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

  // ================= 2. SOCKET LISTENER =================
  useEffect(() => {
    fetchConversations();

    SocketHelper.onNewNotification(async (data) => {
      if (data.type === "NEW_MESSAGE") {
        const { conversationId } = data.payload;
        const token = await AuthHelper.getInstance().getAccessToken();
        const myUserId = await AuthHelper.getInstance().getUserId();

        try {
          const msgRes = await fetch(
            `${Api.getInstance().baseUrl}/conversations/${conversationId}/messages`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const msgData = await msgRes.json();
          const lastMsg = msgData?.data?.items?.[0];

          if (!lastMsg) return;

          setConversations((prevList) => {
            const index = prevList.findIndex((c) => c.id === conversationId);
            const newList = [...prevList];

            if (index !== -1) {
              const currentConv = newList[index];
              const isMe = lastMsg.senderId === myUserId;
              const senderName = isMe ? "Bạn" : (lastMsg.sender?.name ?? "Ai đó");
              
              let content = lastMsg.type === "TEXT" ? lastMsg.content : "đã gửi một tệp";
              let fullText = `${senderName}: ${content}`;

              newList[index] = {
                ...currentConv,
                lastMessage: fullText,
                time: lastMsg.createdAt,
                isUnread: !isMe,
              };

              const [updatedItem] = newList.splice(index, 1);
              return [updatedItem, ...newList];
            } else {
              fetchConversations();
              return prevList;
            }
          });

          // Hiển thị Toast với Tên cuộc trò chuyện và Nội dung tin nhắn
          const targetConv = conversations.find(c => c.id === conversationId);
          Toast.show({
            type: "info",
            text1: targetConv?.name || "Tin nhắn mới",
            text2: `${lastMsg.sender?.name || "Ai đó"}: ${lastMsg.content || "đã gửi một tệp"}`,
            onPress: () => {
              Toast.hide();
              router.push({
                pathname: "/(main)/conversationDetail/[id]",
                params: { id: conversationId },
              });
            },
            visibilityTime: 4000,
          });
        } catch (err) {
          console.error("Socket update error:", err);
        }
      }
    });

    return () => {
      SocketHelper.removeListener("notification:new");
    };
  }, [conversations]); // Thêm conversations vào deps để Toast lấy được name mới nhất

  // ================= 3. RENDER =================
  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    return conversations.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size="large" color={Colors.blue[500]} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
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

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchConversations();
            }}
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