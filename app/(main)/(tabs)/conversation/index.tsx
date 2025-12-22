import { useRouter } from "expo-router";
import { Bot, Sparkles } from "lucide-react-native"; // Thêm icon Robot và Sparkles
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import ConversationItem from "@/component/message/ConversationItem";
import CreateGroupModal from "@/component/message/CreateGroupModal";
import SearchBar from "@/component/message/SearchBar";
import { Colors } from "@/constant/Colors";
import SocketHelper from "@/helper/SocketHelper";
import { ConversationService } from "@/service/ConversationService";
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

  // 3. Khởi tạo dữ liệu
  const initData = useCallback(async () => {
    await Promise.all([loadConversations(), loadFriends()]);
    setLoading(false);
    setRefreshing(false);
  }, [loadConversations, loadFriends]);

  useEffect(() => {
    initData();
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

  // --- RENDER HEADER LIST (Chứa nút Chat AI) ---
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Pressable 
        onPress={() => router.push("/(main)/chatbot")} // Link đến màn hình AI
        style={styles.aiButton}
      >
        <View style={styles.aiIconWrapper}>
          <Bot size={24} color="#FFF" />
          <View style={styles.sparkleTag}>
            <Sparkles size={10} color={Colors.blue[500]} fill={Colors.blue[500]} />
          </View>
        </View>
        <View style={styles.aiTextWrapper}>
          <Text style={styles.aiTitle}>Trợ lý thông minh AI</Text>
          <Text style={styles.aiSubtitle}>Hỏi đáp, sáng tạo và giải quyết vấn đề...</Text>
        </View>
        <View style={styles.onlineBadge} />
      </Pressable>
      
      <View style={styles.divider} />
      <Text style={styles.listLabel}>Tin nhắn gần đây</Text>
    </View>
  );

  if (loading) return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size="large" color={Colors.blue[500]} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Search & Add Group Bar */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 10 }}>
        <View style={{ flex: 1 }}>
          <SearchBar value={search} onChange={setSearch} />
        </View>
        <Pressable
          onPress={() => setOpenModal(true)}
          style={styles.addGroupBtn}
        >
          <Text style={{ fontSize: 28, color: "white" }}>＋</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
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

const styles = StyleSheet.create({
  addGroupBtn: {
    backgroundColor: Colors.blue[500],
    borderRadius: 24,
    height: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1E9FF',
    marginBottom: 10,
  },
  aiIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.blue[500],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparkleTag: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 2,
    elevation: 2,
  },
  aiTextWrapper: {
    marginLeft: 12,
    flex: 1,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.blue[600],
  },
  aiSubtitle: {
    fontSize: 13,
    color: '#667085',
    marginTop: 2,
  },
  onlineBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34D399', // Màu xanh online
    borderWidth: 2,
    borderColor: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F4F7',
    marginVertical: 10,
  },
  listLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667085',
    marginBottom: 8,
  }
});