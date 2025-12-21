import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";

import ConversationItem from "@/component/message/ConversationItem";
import CreateGroupModal from "@/component/message/CreateGroupModal";
import SearchBar from "@/component/message/SearchBar";
import { Colors } from "@/constant/Colors";
import SocketHelper from "@/helper/SocketHelper";
import { ConversationService } from "@/service/ConversationService"; // Đã sửa đường dẫn theo file tree của bạn
import { FriendService } from "@/service/FriendService";
import { getRelativeTimeFromISO } from "@/utils/date";

export default function ConversationScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // 1. Hàm Load Hội thoại
  const loadConversations = useCallback(async () => {
    const data = await ConversationService.getInstance().fetchAll();
    setConversations(data);
  }, []);

  // 2. Hàm Load Bạn bè
  const loadFriends = useCallback(async () => {
    const data = await FriendService.getInstance().fetchFriends();
    setFriends(data);
  }, []);

  // 3. Khởi tạo dữ liệu (Chạy song song)
  const initData = useCallback(async () => {
    await Promise.all([loadConversations(), loadFriends()]);
    setLoading(false);
    setRefreshing(false);
  }, [loadConversations, loadFriends]);

  useEffect(() => {
    initData();

    // Socket lắng nghe tin nhắn mới để cập nhật danh sách hội thoại
    SocketHelper.onNewNotification(loadConversations);

    return () => {
      SocketHelper.removeListener("notification:new", loadConversations);
    };
  }, [initData, loadConversations]);

  // 4. Logic Tìm kiếm
  const filteredConversations = useMemo(() => {
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
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              setRefreshing(true);
              initData();
            }} 
          />
        }
        renderItem={({ item }) => (
          <ConversationItem
            {...item}
            time={item.time ? getRelativeTimeFromISO(item.time) : ""}
            onPress={() => router.replace({
              pathname: "/(main)/conversationDetail/[id]",
              params: { id: item.id },
            })}
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