import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";

export class ConversationService {
  private static instance: ConversationService;

  public static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService();
    }
    return ConversationService.instance;
  }

  // --- LOGIC DANH SÁCH (GIỮ NGUYÊN HOẶC CẬP NHẬT) ---
  async fetchAll() {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      const myUserId = await AuthHelper.getInstance().getUserId();

      const res = await fetch(`${Api.getInstance().baseUrl}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!result?.data) return [];

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
            if (!isMe && !last.reads?.some((r: any) => r.userId === myUserId)) isUnread = true;

            const senderInConv = conv.members.find((m: any) => m.userId === last.senderId);
            const senderName = isMe ? "Bạn" : (senderInConv?.user?.name ?? "Ai đó");

            if (last.type === "TEXT") text = last.content ?? "";
            else if (last.type === "IMAGE") text = "đã gửi một hình ảnh";
            else if (last.type === "FILE") text = "đã gửi một tệp";

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
            members: conv.members // Cần trả về members để màn hình Detail dùng
          };
        })
      );
      return formatted.sort((a, b) => new Date(b.time!).getTime() - new Date(a.time!).getTime());
    } catch (e) {
      return [];
    }
  }

  // --- LOGIC CHI TIẾT TIN NHẮN ---

  async fetchMessages(conversationId: string, members: any[]) {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      const res = await fetch(`${Api.getInstance().baseUrl}/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const rawItems = data?.data?.items || [];

      const memberMap: Record<string, any> = {};
      members.forEach((m: any) => { memberMap[m.userId] = m.user; });

      return rawItems
        .filter((i: any) => !i.deletedAt)
        .map((i: any) => {
          const sender = memberMap[i.senderId];
          return {
            id: i.id,
            createdAt: i.createdAt,
            senderId: i.senderId,
            senderName: sender?.name || "Người dùng",
            senderAvatar: sender?.avatarUrl,
            type: i.type,
            content: i.content,
            mediaUrl: i.mediaUrl,
            parentMessageId: i.replyToMessageId,
            myReaction: i.reactions?.length > 0 ? i.reactions[0].type : null,
            reads: i.reads || [],
          };
        })
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      return [];
    }
  }

  async markAsRead(items: any[], currentUserId: string) {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      const unreadIds = items
        .filter(msg => msg.senderId !== currentUserId && !msg.reads?.some((r: any) => r.userId === currentUserId))
        .map(msg => msg.id);

      if (unreadIds.length === 0) return;

      await Promise.all(unreadIds.map(id => 
        fetch(`${Api.getInstance().baseUrl}/messages/${id}/read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
    } catch (e) {}
  }

  async deleteMessage(messageId: string) {
    const token = await AuthHelper.getInstance().getAccessToken();
    return fetch(`${Api.getInstance().baseUrl}/messages/${messageId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async reactToMessage(messageId: string, type: string) {
    const token = await AuthHelper.getInstance().getAccessToken();
    return fetch(`${Api.getInstance().baseUrl}/messages/${messageId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type })
    });
  }
}