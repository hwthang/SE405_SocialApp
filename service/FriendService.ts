import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";

export class FriendService {
  private static instance: FriendService;

  public static getInstance(): FriendService {
    if (!FriendService.instance) {
      FriendService.instance = new FriendService();
    }
    return FriendService.instance;
  }

  // --- LẤY DANH SÁCH BẠN BÈ ---
  async fetchFriends() {
    try {
      const token = await AuthHelper.getInstance().getAccessToken();
      const res = await fetch(`${Api.getInstance().baseUrl}/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      return result?.data || [];
    } catch (e) {
      console.error("fetchFriends error:", e);
      return [];
    }
  }

  // --- LẤY LỜI MỜI KẾT BẠN ĐÃ NHẬN ---
  async fetchReceivedRequests() {
    const token = await AuthHelper.getInstance().getAccessToken();
    const response = await fetch(`${Api.getInstance().baseUrl}/friends/requests/received`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    return result.data || [];
  }

   async fetchSentRequests() {
    const token = await AuthHelper.getInstance().getAccessToken();
    const response = await fetch(`${Api.getInstance().baseUrl}/friends/requests/sent`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    return result.data || [];
  }

  // --- XỬ LÝ LỜI MỜI (ACCEPT/REJECT) ---
  async handleFriendRequest(requestId: string, action: "accept" | "reject") {
    const token = await AuthHelper.getInstance().getAccessToken();
    const response = await fetch(
      `${Api.getInstance().baseUrl}/friends/requests/${requestId}/${action}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return await response.json();
  }

  // --- TẠO HỘI THOẠI SAU KHI KẾT BẠN ---
  async createDirectConversation(otherUserId: string) {
    const token = await AuthHelper.getInstance().getAccessToken();
    const response = await fetch(`${Api.getInstance().baseUrl}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "DIRECT",
        otherUserId: otherUserId,
      }),
    });
    return await response.json();
  }
}