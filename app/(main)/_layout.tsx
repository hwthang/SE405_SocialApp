import BackHeader from "@/component/BackHeader";
import CustomSplashScreen from "@/component/custom/CustomSplashScreen";
import SocketHelper from "@/helper/SocketHelper";
import { ConversationService } from "@/service/ConversationService";
import { FriendService } from "@/service/FriendService";
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

const MainLayout = () => {
  const pathname = usePathname();
  const router = useRouter();

  // --- States quản lý Splash Screen ---
  const [splashVisible, setSplashVisible] = useState(true); 
  const [isReady, setIsReady] = useState(false);           
  const [status, setStatus] = useState("Đang khởi tạo ứng dụng...");

  const pathnameRef = useRef(pathname);
  const routerRef = useRef(router);

  useEffect(() => {
    pathnameRef.current = pathname;
    routerRef.current = router;
  }, [pathname, router]);

  useEffect(() => {
    // 1. Handler xử lý thông báo nhận từ Socket
    const handleGlobalNotify = async (data: any) => {
      const { type, payload } = data;
      const currentPath = pathnameRef.current;
      const currentRouter = routerRef.current;

      if (type === "NEW_MESSAGE") {
        const { conversationId } = payload;
        if (currentPath.includes(`/conversationDetail/${conversationId}`)) return;

        try {
          const conversations = await ConversationService.getInstance().fetchAll();
          const targetConv = conversations.find((c) => c.id === conversationId);
          if (targetConv) {
            Toast.show({
              type: "info",
              text1: `Tin nhắn từ ${targetConv.name}`,
              text2: targetConv.type === "DIRECT" 
                ? targetConv.lastMessage?.split(": ")[1] || targetConv.lastMessage 
                : targetConv.lastMessage,
              onPress: () => {
                currentRouter.push({
                  pathname: "/(main)/conversationDetail/[id]",
                  params: { id: conversationId },
                });
                Toast.hide();
              },
            });
          }
        } catch (e) { console.error("Lỗi tin nhắn socket:", e); }
      }

      if (type === "FRIEND_REQUEST_RECEIVED") {
        try {
          const invitations = await FriendService.getInstance().fetchReceivedRequests();
          const requester = invitations.find((inv: any) => inv.fromUserId === payload.fromUserId);
          Toast.show({
            type: "success",
            text1: `Lời mời kết bạn mới 🤝`,
            text2: `${requester?.fromUser?.name || "Ai đó"} vừa gửi lời mời kết bạn.`,
            onPress: () => {
              currentRouter.push({ pathname: "/(main)/(tabs)/friend", params: { tab: "invitation" } });
              Toast.hide();
            },
          });
        } catch (e) { console.error("Lỗi lời mời socket:", e); }
      }
    };

    // 2. Logic "Câu giờ" 5 giây và kết nối Socket
    const setupSocket = async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const startTime = Date.now();

      try {
        setStatus("Đang thiết lập kết nối máy chủ...");

        // Chạy song song: Kết nối socket và chờ đủ 5000ms
        await Promise.all([
          SocketHelper.connect(),
          delay(5000) 
        ]);

        console.log("Socket connected & 5s delay complete.");
        SocketHelper.onNewNotification(handleGlobalNotify);
        setStatus("Sẵn sàng!");
      } catch (error) {
        console.error("Socket setup failed:", error);
        
        // Nếu lỗi xảy ra nhanh hơn 5s, vẫn chờ cho đủ để tránh giật lag UI
        const timePassed = Date.now() - startTime;
        if (timePassed < 5000) {
          await delay(5000 - timePassed);
        }
      } finally {
        // Kích hoạt hiệu ứng trượt lên của CustomSplashScreen
        setIsReady(true);
      }
    };

    setupSocket();

    return () => {
      SocketHelper.removeListener("notification:new", handleGlobalNotify);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="map/index" options={{ header: () => <BackHeader /> }} />
        <Stack.Screen name="option/index" options={{ header: () => <BackHeader /> }} />
        <Stack.Screen name="qr/index" options={{ header: () => <BackHeader /> }} />
        <Stack.Screen name="chatbot/index" options={{ headerShown: false }} />
        <Stack.Screen name="postDetail/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="conversationDetail/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profileEdit/index" options={{ header: () => <BackHeader /> }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

      {/* HIỂN THỊ SPLASH ĐÈ LÊN TRÊN STACK TRONG 5 GIÂY ĐẦU */}
      {splashVisible && (
        <CustomSplashScreen 
          isReady={isReady} 
          statusText={status}
          onFinish={() => setSplashVisible(false)} 
        />
      )}
    </View>
  );
};

export default MainLayout;