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

import { CustomBottomModal } from "@/component/custom/CustomBottomModal";
import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { getRelativeTimeFromISO } from "@/utils/date";
import ConversationItem from "../../../../component/message/ConversationItem";
import SearchBar from "../../../../component/message/SearchBar";

/* ===================== TYPES ===================== */

type Conversation = {
  id: string;
  name: string;
  avatar: string | null;
  lastMessage?: string;
  time?: string;
  isOnline?: boolean;
};

type Friend = {
  id: string;
  name: string;
  avatar: string | null;
};

/* ===================== SCREEN ===================== */

export default function ConversationScreen() {
  const router = useRouter();

  /* ---------- STATE ---------- */
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  /* ===================== API ===================== */

  const fetchConversations = async () => {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      const myUserId = await AuthHelper.getInstance().getUserId();

      const response = await fetch(
        `${Api.getInstance().baseUrl}/conversations`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (!result?.data) return;

      console.log(result.data.members);

      const formatted: Conversation[] = result.data.map((conv: any) => {
        const displayUser =
          conv.type === "DIRECT"
            ? conv.members.find((m: any) => m.userId !== myUserId)?.user
            : null;

        const lastMessage =
          conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;

        const isMe = lastMessage?.senderId === myUserId;

        let lastMessageText = "Hãy bắt đầu trò chuyện nào";

        if (!lastMessage.deletedAt) {
          if (lastMessage.type === "TEXT") {
            lastMessageText = lastMessage.content ?? "";
          } else if (lastMessage.type === "IMAGE") {
            lastMessageText = isMe
              ? "Bạn đã gửi một hình ảnh"
              : "Đã gửi một hình ảnh";
          } else if (lastMessage.type === "FILE") {
            lastMessageText = isMe ? "Bạn đã gửi một tệp" : "Đã gửi một tệp";
          }

          if (isMe && lastMessage.type === "TEXT") {
            lastMessageText = `Bạn: ${lastMessageText}`;
          }
        }

        return {
          id: conv.id,
          name: displayUser?.name ?? "Unknown",
          avatar: displayUser?.avatarUrl ?? null,
          isOnline: displayUser?.isOnline ?? false,
          lastMessage: lastMessageText,
          time: lastMessage.deletedAt ? "" : lastMessage?.createdAt,
        };
      });

      console.log(formatted.filter);

      setConversations(formatted);
    } catch (e) {
      console.error("❌ fetchConversations error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const token = await AuthHelper.getInstance().getAccessToken();

      const response = await fetch(`${Api.getInstance().baseUrl}/friends`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!result?.data) return;

      const formatted: Friend[] = result.data.map((item: any) => ({
        id: String(item.friendId),
        name: item.name,
        avatar: item.avatarUrl ?? null,
      }));

      setFriends(formatted);
    } catch (e) {
      console.error("❌ fetchFriends error:", e);
    } finally {
      setLoadingFriends(false);
    }
  };

  /* ===================== EFFECT ===================== */

  useEffect(() => {
    fetchConversations();
  }, []);

  /* ===================== SEARCH ===================== */

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    console.log(conversations);
    return conversations.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  /* ===================== FRIEND SELECT ===================== */

  const toggleFriend = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const checked = selectedFriendIds.includes(item.id);

    return (
      <Pressable
        onPress={() => toggleFriend(item.id)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: checked ? Colors.blue[500] : "#ccc",
            marginRight: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: checked ? Colors.blue[500] : "transparent",
          }}
        >
          {checked && <Text style={{ color: "white", fontSize: 14 }}>✓</Text>}
        </View>

        <Text style={{ fontSize: 16 }}>{item.name}</Text>
      </Pressable>
    );
  };

  const openCreateConversation = () => {
    setOpenCreateModal(true);
    fetchFriends();
  };

  /* ===================== LOADING ===================== */

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ===================== RENDER ===================== */

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* ===== Search + Add ===== */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <SearchBar value={search} onChange={setSearch} />
        </View>

        <Pressable
          onPress={openCreateConversation}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
            marginRight: 10,
            backgroundColor: Colors.blue[500],
          }}
        >
          <Text style={{ fontSize: 26, fontWeight: "600", color: "white" }}>
            ＋
          </Text>
        </Pressable>
      </View>

      {/* ===== List ===== */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchConversations();
            }}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 100 }}>
            <Text style={{ color: "#999", marginBottom: 12 }}>
              Chưa có cuộc trò chuyện nào
            </Text>

            <Pressable
              onPress={openCreateConversation}
              style={{
                borderColor: Colors.blue[500],
                borderWidth: 1,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: Colors.blue[500], fontWeight: "600" }}>
                Bắt đầu
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <ConversationItem
            avatar={item.avatar}
            name={item.name}
            lastMessage={item.lastMessage}
            time={getRelativeTimeFromISO(item.time as string)}
            isOnline={item.isOnline}
            onPress={() =>
              router.push({
                pathname: "/(main)/conversationDetail/[id]",
                params: {
                  id: item.id,
                },
              })
            }
          />
        )}
      />

      {/* ===== CREATE MODAL ===== */}
      <CustomBottomModal
        visible={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          setSelectedFriendIds([]);
        }}
      >
        <View style={{ padding: 20, flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            Bắt đầu cuộc trò chuyện
          </Text>

          <View style={{ marginTop: 16, flex: 1 }}>
            {loadingFriends ? (
              <ActivityIndicator />
            ) : (
              <FlatList
                data={friends}
                keyExtractor={(item) => item.id}
                renderItem={renderFriendItem}
              />
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 12,
            }}
          >
            <Pressable onPress={() => setOpenCreateModal(false)}>
              <Text style={{ color: "#666", fontSize: 16, marginRight: 16 }}>
                Hủy
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                const selected = friends.filter((f) =>
                  selectedFriendIds.includes(f.id)
                );

                console.log("✅ Selected friends:", selected);

                setOpenCreateModal(false);
                setSelectedFriendIds([]);
              }}
            >
              <Text
                style={{
                  color: Colors.blue[500],
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Xác nhận
              </Text>
            </Pressable>
          </View>
        </View>
      </CustomBottomModal>
    </View>
  );
}
