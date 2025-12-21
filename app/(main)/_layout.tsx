import BackHeader from "@/component/BackHeader";
import SocketHelper from "@/helper/SocketHelper";
import { ConversationService } from "@/service/ConversationService";
import { FriendService } from "@/service/FriendService";
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";

const MainLayout = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    SocketHelper.connect();

    const handleGlobalNotify = async (data: any) => {
      const { type, payload } = data;
      console.log(`[Socket Notification] ${type}`);

      // --- TRƯỜNG HỢP: TIN NHẮN MỚI ---
      if (type === "NEW_MESSAGE") {
        const { conversationId } = payload;
        
        // Kiểm tra xem có đang ở trong màn hình chat này không
        if (pathname.includes(`/conversationDetail/${conversationId}`)) return;

        // Fetch hội thoại để lấy Tên và Tin nhắn cuối (đã format ở Service)
        const conversations = await ConversationService.getInstance().fetchAll();
        const targetConv = conversations.find((c) => c.id === conversationId);

        if (targetConv) {
          const displayTitle = targetConv.name;
          // Tách bỏ phần "Bạn: " nếu là chat 1-1 để Toast đẹp hơn
          const displayBody = targetConv.type === "DIRECT" 
            ? (targetConv.lastMessage?.split(": ")[1] || targetConv.lastMessage)
            : targetConv.lastMessage;

          Toast.show({
            type: "info",
            text1: `Tin nhắn từ ${displayTitle}`,
            text2: displayBody,
            onPress: () => {
              router.push({
                pathname: "/(main)/conversationDetail/[id]",
                params: { id: conversationId },
              });
              Toast.hide();
            },
          });
        }
      }

      // --- TRƯỜNG HỢP: NHẬN LỜI MỜI KẾT BẠN ---
      if (type === "FRIEND_REQUEST_RECEIVED") {
        // Fetch ngầm để lấy tên người gửi
        const invitations = await FriendService.getInstance().fetchReceivedRequests();
        const requester = invitations.find((inv: any) => inv.fromUserId === payload.fromUserId);
        const senderName = requester?.fromUser?.name || "Một người dùng lạ";

        Toast.show({
          type: "success",
          text1: `Lời mời kết bạn mới 🤝`,
          text2: `${senderName} vừa gửi cho bạn một lời mời kết bạn. Nhấn để xem ngay!`,
          onPress: () => {
            // Điều hướng thẳng tới tab Lời mời (params dùng cho FriendScreen xử lý isActive)
            router.push({
              pathname: "/(main)/(tabs)/friend",
              params: { tab: "invitation" }
            });
            Toast.hide();
          },
        });
      }

      // --- TRƯỜNG HỢP: ĐỐI PHƯƠNG CHẤP NHẬN KẾT BẠN ---
      if (type === "FRIEND_REQUEST_ACCEPTED") {
        const friends = await FriendService.getInstance().fetchFriends();
        // friendId trong fetchFriends khớp với toUserId từ socket
        const newFriend = friends.find((f: any) => f.friendId === payload.toUserId);
        const friendName = newFriend?.name || "Một người dùng";

        Toast.show({
          type: "success",
          text1: `Kết bạn thành công 🎉`,
          text2: `Bạn và ${friendName} hiện đã là bạn bè. Hãy gửi lời chào nào!`,
          onPress: () => {
            router.push("/(main)/(tabs)/friend");
            Toast.hide();
          },
        });
      }
    };

    SocketHelper.onNewNotification(handleGlobalNotify);
    return () => SocketHelper.removeListener("notification:new", handleGlobalNotify);
  }, [pathname]);

  return (
    <Stack>
      {/* <Stack.Screen name="profile/index" options={{ header: () => <BackHeader /> }} /> */}
      <Stack.Screen name="map/index" options={{ header: () => <BackHeader /> }} />
      <Stack.Screen name="option/index" options={{ header: () => <BackHeader /> }} />
      <Stack.Screen name="qr/index" options={{ header: () => <BackHeader /> }} />
      <Stack.Screen name="postDetail/[id]" options={{ header: () => <BackHeader /> }} />
      <Stack.Screen name="conversationDetail/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default MainLayout;