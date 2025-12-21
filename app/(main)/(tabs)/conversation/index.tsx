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
import { getRelativeTimeFromISO } from "@/utils/date";

type Conversation = {
  id: string;
  name: string;
  avatar: string | null;
  lastMessage?: string;
  time?: string;
  isOnline?: boolean;
  isUnread?: boolean;
};

export default function ConversationScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);

const fetchConversations = async () => {
  try {
    const token = await AuthHelper.getInstance().getAccessToken();
    const myUserId = await AuthHelper.getInstance().getUserId();

    // 1. Lấy danh sách hội thoại
    const res = await fetch(`${Api.getInstance().baseUrl}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!result?.data) return;

    // 2. Với mỗi hội thoại, gọi API lấy tin nhắn để có dữ liệu "reads"
    // Sử dụng Promise.all để fetch song song tất cả các hội thoại
    const formatted = await Promise.all(
      result.data.map(async (conv: any) => {
        const isGroup = conv.type === "GROUP";

        // Fetch tin nhắn mới nhất của hội thoại này để lấy field "reads"
        const msgRes = await fetch(
          `${Api.getInstance().baseUrl}/conversations/${conv.id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const msgData = await msgRes.json();
        
        // Lấy tin nhắn đầu tiên (mới nhất) từ items
        const last = msgData?.data?.items?.[0];

        // --- Logic format như cũ ---
        const directUser = !isGroup
          ? conv.members.find((m: any) => m.userId !== myUserId)?.user
          : null;

        let text = "Hãy bắt đầu trò chuyện nào";
        let isUnread = false;

        if (last && !last.deletedAt) {
          const isMe = last.senderId === myUserId;

          // LOGIC KIỂM TRA ĐỌC: Chỉ cần không thấy ID mình trong mảng reads
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

    // Sắp xếp lại danh sách hội thoại theo tin nhắn mới nhất
    const sorted = formatted.sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

    setConversations(sorted);
  } catch (e) {
    console.error("fetchConversations error:", e);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    fetchConversations();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    return conversations.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <SearchBar value={search} onChange={setSearch} />
        </View>
        <Pressable
          onPress={() => setOpenModal(true)}
          style={{
            marginRight: 10,
            backgroundColor: Colors.blue[500],
            borderRadius: 999,
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
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} />
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