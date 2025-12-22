import CustomHeader from "@/component/custom/CustomHeader";
import { Colors } from "@/constant/Colors";
import { router } from "expo-router";
import { Bot, ChevronLeft, Send } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface IMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const ChatAIScreen = () => {
  const [messages, setMessages] = useState<IMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Xin chào! Mình là trợ lý AI. Bạn cần mình giúp gì hôm nay?",
      createdAt: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Biến Animated để tính toán khoảng cách đẩy lên
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Lắng nghe sự kiện bàn phím
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onKeyboardShow = (event: any) => {
      // Đẩy giao diện lên bằng đúng chiều cao bàn phím
      Animated.timing(keyboardHeight, {
        duration: event.duration || 300,
        toValue: event.endCoordinates.height,
        useNativeDriver: false, // translateY nên để false nếu ảnh hưởng đến layout layout
      }).start();
    };

    const onKeyboardHide = (event: any) => {
      Animated.timing(keyboardHeight, {
        duration: event.duration || 300,
        toValue: 0,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: IMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      // Giả lập API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockReply = "Câu trả lời giả lập cho: " + userMessage.content;

      const aiResponse: IMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: mockReply,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI Chat Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  const renderMessage = ({ item }: { item: IMessage }) => {
    const isAi = item.role === "assistant";
    return (
      <View style={[styles.msgWrapper, isAi ? styles.aiWrapper : styles.userWrapper]}>
        {isAi && (
          <View style={styles.aiAvatar}><Bot size={16} color="#FFF" /></View>
        )}
        <View style={[styles.msgBubble, isAi ? styles.aiBubble : styles.userBubble]}>
          <Text style={[styles.msgText, isAi ? styles.aiText : styles.userText]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="#FFF" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trợ lý AI</Text>
          <View style={{ width: 28 }} />
        </View>
      </CustomHeader>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={() => 
          loading ? (
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={Colors.blue[500]} />
              <Text style={styles.loadingText}>AI đang suy nghĩ...</Text>
            </View>
          ) : null
        }
      />

      {/* Phần Input Area bọc trong Animated.View để dịch chuyển */}
      <Animated.View style={{ marginBottom: keyboardHeight }}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Hỏi AI bất cứ điều gì..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <Send size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default ChatAIScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB", marginBottom:40 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flex: 1 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  listContent: { padding: 16, paddingBottom: 30 },
  msgWrapper: { flexDirection: "row", marginBottom: 16, maxWidth: "85%" },
  aiWrapper: { alignSelf: "flex-start", alignItems: "flex-end" },
  userWrapper: { alignSelf: "flex-end" },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.blue[500], justifyContent: "center", alignItems: "center", marginRight: 8 },
  msgBubble: { padding: 12, borderRadius: 18 },
  aiBubble: { backgroundColor: "#FFF", borderBottomLeftRadius: 4, elevation: 1 },
  userBubble: { backgroundColor: Colors.blue[500], borderBottomRightRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 22 },
  aiText: { color: "#374151" },
  userText: { color: "#FFF" },
  loadingBubble: { flexDirection: "row", alignItems: "center", marginLeft: 36, marginBottom: 16 },
  loadingText: { marginLeft: 8, fontSize: 13, color: "#9CA3AF", fontStyle: "italic" },
  inputArea: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    // Bỏ marginBottom cứng ở đây vì đã dùng Animated
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blue[500],
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendBtnDisabled: { backgroundColor: "#D1D5DB" },
});